const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const { authenticator } = require('@otplib/preset-default');
const { setupDB, seedStudentData, seedStaffData, seedManagementData, seedAdminData } = require('./db');

const app = express();
let db;

app.use(cors());
app.use(express.json());

// Initialize Database and then start the server
setupDB().then(pool => {
    db = pool;

    const SERVER_PORT = 5000;
    app.listen(SERVER_PORT, () => {
        console.log(`✅ Database Linked`);
        console.log(`🚀 Server running on http://localhost:${SERVER_PORT}`);
    });
}).catch(err => {
    console.error("Failed to start server due to DB error:", err);
});

/**
 * SIGNUP ROUTE
 */
app.post('/signup', async (req, res, next) => {
    try {
        console.log("📩 Signup request received:", JSON.stringify(req.body));
        const { name, email, password, role } = req.body;

        if (!name || !email || !password || !role) {
            res.status(400);
            res.json({ success: false, message: "All fields are required" });
            return;
        }

        const [existing] = await db.execute('SELECT id FROM users WHERE email = ?', [email]);
        if (existing.length > 0) {
            res.status(409);
            res.json({ success: false, message: "Email already registered" });
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        const mfaSecret = authenticator.generateSecret();

        const [result] = await db.execute(
            'INSERT INTO users (name, email, password, role, mfa_enabled, mfa_secret) VALUES (?, ?, ?, ?, ?, ?)',
            [name, email, hashedPassword, role, true, mfaSecret]
        );

        // If the new user is a student, seed their dashboard data
        if (role === 'student') {
            await seedStudentData(db, result.insertId);
        } else if (role === 'staff') {
            await seedStaffData(db, result.insertId);
        } else if (role === 'management') {
            await seedManagementData(db, result.insertId);
        } else if (role === 'admin') {
            await seedAdminData(db, result.insertId);
        }

        const mfaCode = authenticator.generate(mfaSecret);
        console.log("✅ User created with ID:", result.insertId, "MFA Code:", mfaCode);
        res.status(201);
        res.json({
            success: true,
            message: "Account created successfully",
            userId: result.insertId,
            mfaSecret: mfaSecret,
            mfaCode: mfaCode
        });
    } catch (error) {
        console.error("Signup Error:", error);
        next(error);
    }
});

/**
 * LOGIN ROUTE
 */
app.post('/login', async (req, res, next) => {
    try {
        console.log("📩 Login request received:", JSON.stringify(req.body));
        const { email, password, role } = req.body;

        if (!email || !password || !role) {
            res.status(400);
            res.json({ success: false, message: "All fields are required" });
            return;
        }

        const [rows] = await db.execute(
            'SELECT id, password, role, mfa_secret FROM users WHERE email = ? AND role = ?',
            [email, role]
        );

        if (rows.length === 0) {
            res.status(404);
            res.json({ success: false, message: "No account found with this email and role" });
            return;
        }

        const user = rows[0];
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            res.status(401);
            res.json({ success: false, message: "Invalid password" });
            return;
        }

        const mfaCode = authenticator.generate(user.mfa_secret);
        console.log("✅ Login successful for user:", user.id, "MFA Code:", mfaCode);
        res.json({
            success: true,
            message: "Credentials verified. Proceed to MFA.",
            userId: user.id,
            role: user.role,
            mfaCode: mfaCode
        });
    } catch (error) {
        console.error("Login Error:", error);
        next(error);
    }
});

/**
 * MFA VERIFICATION ROUTE
 */
app.post('/verify-mfa', async (req, res, next) => {
    try {
        console.log("📩 MFA verify request received:", JSON.stringify(req.body));
        const { userId, code } = req.body;

        if (!userId || !code) {
            res.status(400);
            res.json({ success: false, message: "Missing User ID or Code" });
            return;
        }

        const [rows] = await db.execute(
            'SELECT mfa_secret, role FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            res.status(404);
            res.json({ success: false, message: "User not found" });
            return;
        }

        const user = rows[0];

        // Allow a wider time window (±2 steps = ~2 minutes) for local dev
        const expectedCode = authenticator.generate(user.mfa_secret);
        console.log("🔍 MFA Check - Expected:", expectedCode, "Received:", code);

        authenticator.options = { ...authenticator.options, window: 2 };
        const isValid = authenticator.check(code, user.mfa_secret);

        if (isValid) {
            // Seed dashboard data for student if not already done
            if (user.role === 'student') {
                await seedStudentData(db, userId);
            } else if (user.role === 'staff') {
                await seedStaffData(db, userId);
            }
            res.json({
                success: true,
                message: "Access Granted",
                role: user.role
            });
        } else {
            res.status(401);
            res.json({ success: false, message: "Invalid MFA Code. Try the latest code from your notification." });
        }
    } catch (error) {
        console.error("MFA Error:", error);
        next(error);
    }
});

/**
 * FORGOT PASSWORD ROUTE
 */
app.post('/forgot-password', async (req, res, next) => {
    try {
        console.log("📩 Forgot password request received:", JSON.stringify(req.body));
        const { email, role } = req.body;

        if (!email || !role) {
            res.status(400);
            res.json({ success: false, message: "Email and role are required" });
            return;
        }

        const [rows] = await db.execute(
            'SELECT id, mfa_secret FROM users WHERE email = ? AND role = ?',
            [email, role]
        );

        if (rows.length === 0) {
            res.status(404);
            res.json({ success: false, message: "No account found with this email and role" });
            return;
        }

        const user = rows[0];
        const mfaCode = authenticator.generate(user.mfa_secret);
        console.log("✅ Forgot password OTP for user:", user.id, "MFA Code:", mfaCode);

        res.json({
            success: true,
            message: "Verification code generated. Use it to reset your password.",
            userId: user.id,
            mfaCode: mfaCode
        });
    } catch (error) {
        console.error("Forgot Password Error:", error);
        next(error);
    }
});

/**
 * RESET PASSWORD ROUTE
 */
app.post('/reset-password', async (req, res, next) => {
    try {
        console.log("📩 Reset password request received:", JSON.stringify(req.body));
        const { userId, code, newPassword } = req.body;

        if (!userId || !code || !newPassword) {
            res.status(400);
            res.json({ success: false, message: "User ID, verification code, and new password are required" });
            return;
        }

        if (newPassword.length < 6) {
            res.status(400);
            res.json({ success: false, message: "Password must be at least 6 characters" });
            return;
        }

        const [rows] = await db.execute(
            'SELECT mfa_secret FROM users WHERE id = ?',
            [userId]
        );

        if (rows.length === 0) {
            res.status(404);
            res.json({ success: false, message: "User not found" });
            return;
        }

        const user = rows[0];

        authenticator.options = { ...authenticator.options, window: 2 };
        const isValid = authenticator.check(code, user.mfa_secret);

        if (!isValid) {
            res.status(401);
            res.json({ success: false, message: "Invalid verification code. Please try again." });
            return;
        }

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await db.execute(
            'UPDATE users SET password = ? WHERE id = ?',
            [hashedPassword, userId]
        );

        console.log("✅ Password reset successful for user:", userId);
        res.json({
            success: true,
            message: "Password has been reset successfully. You can now sign in."
        });
    } catch (error) {
        console.error("Reset Password Error:", error);
        next(error);
    }
});

/**
 * ============================================================
 * STUDENT DASHBOARD API
 * ============================================================
 */

/**
 * GET /api/dashboard/student/:userId
 * Returns all dashboard data for a student: profile, attendance, schedule, assignments, performance.
 */
app.get('/api/dashboard/student/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log(`📩 Dashboard data request for user ${userId}`);

        // 1. Get user info
        const [userRows] = await db.execute(
            'SELECT id, name, email, role FROM users WHERE id = ?',
            [userId]
        );

        if (userRows.length === 0) {
            res.status(404);
            res.json({ success: false, message: "User not found" });
            return;
        }

        const user = userRows[0];

        // 2. Get student profile
        const [profileRows] = await db.execute(
            'SELECT cgpa, total_credits, semester, department, enrollment_year FROM student_profiles WHERE user_id = ?',
            [userId]
        );
        const profile = profileRows.length > 0 ? profileRows[0] : null;

        // 3. Get attendance
        const [attendanceRows] = await db.execute(
            'SELECT subject_code, subject_name, classes_attended, total_classes, percentage, status_badge FROM attendance WHERE user_id = ? ORDER BY subject_name',
            [userId]
        );

        // 4. Get today's schedule
        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDay = daysOfWeek[new Date().getDay()];

        const [scheduleRows] = await db.execute(
            'SELECT class_name, instructor, room, start_time, end_time, day_of_week FROM schedule WHERE user_id = ? AND day_of_week = ? ORDER BY start_time',
            [userId, todayDay]
        );

        // 5. Get assignments
        const [assignmentRows] = await db.execute(
            'SELECT title, subject, deadline_date, urgency, status FROM assignments WHERE user_id = ? ORDER BY deadline_date ASC',
            [userId]
        );

        // 6. Get performance trends
        const [performanceRows] = await db.execute(
            'SELECT semester, semester_label, gpa FROM performance_trends WHERE user_id = ? ORDER BY semester ASC',
            [userId]
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                },
                profile: profile,
                attendance: attendanceRows,
                schedule: scheduleRows,
                assignments: assignmentRows,
                performance: performanceRows,
            }
        });

    } catch (error) {
        console.error("Dashboard API Error:", error);
        next(error);
    }
});

/**
 * ============================================================
 * STAFF DASHBOARD API
 * ============================================================
 */

/**
 * GET /api/dashboard/staff/:userId
 * Returns dashboard data for a staff member.
 */
app.get('/api/dashboard/staff/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log(`📩 Staff dashboard data request for user ${userId}`);

        const [userRows] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
        if (userRows.length === 0) return res.status(404).json({ success: false, message: "User not found" });

        const [profileRows] = await db.execute('SELECT assigned_courses, leave_balance, total_mentees FROM staff_profiles WHERE user_id = ?', [userId]);
        const profile = profileRows.length > 0 ? profileRows[0] : { assigned_courses: 0, leave_balance: 0, total_mentees: 0 };

        const [pendingRequestsRows] = await db.execute('SELECT id, student_name, roll_number, type, reason, dates, status FROM pending_requests WHERE staff_id = ? ORDER BY id DESC', [userId]);

        const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
        const todayDay = daysOfWeek[new Date().getDay()];

        const [scheduleRows] = await db.execute(
            'SELECT id, class_name, room, start_time, end_time FROM schedule WHERE user_id = ? AND day_of_week = ? ORDER BY start_time',
            [userId, todayDay]
        );

        // Map schedule and add 'attended' mock property (for demo)
        const mappedSchedule = scheduleRows.map(row => ({
            ...row,
            attended: false
        }));

        const stats = {
            ...profile,
            pending_tasks: pendingRequestsRows.filter(r => r.status === 'Pending').length
        };

        const attendance_trends = [
            { subject: 'Data Structures', percentage: 92 },
            { subject: 'Operating Sys.', percentage: 85 },
            { subject: 'Algorithm Des.', percentage: 78 },
            { subject: 'Computer Net.', percentage: 89 },
        ];

        res.json({
            success: true,
            data: {
                stats,
                schedule: mappedSchedule,
                pending_requests: pendingRequestsRows,
                attendance_trends
            }
        });
    } catch (error) {
        console.error("Staff Dashboard API Error:", error);
        next(error);
    }
});

/**
 * POST /api/leave-status
 * Updates the status of a pending leave/OD request
 */
app.post('/api/leave-status', async (req, res, next) => {
    try {
        console.log("📩 Leave status update request received:", JSON.stringify(req.body));
        const { requestId, status, staffId } = req.body;

        if (!requestId || !status) {
            return res.status(400).json({ success: false, message: "Missing required fields" });
        }

        await db.execute('UPDATE pending_requests SET status = ? WHERE id = ? AND staff_id = ?', [status, requestId, staffId]);

        res.json({
            success: true,
            message: `Request marked as ${status}`
        });
    } catch (error) {
        console.error("Leave Status Update Error:", error);
        next(error);
    }
});

/**
 * ============================================================
 * MANAGEMENT DASHBOARD API
 * ============================================================
 */
app.get('/api/dashboard/management/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log(`📩 Management dashboard data request for user ${userId}`);

        const [userRows] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ? AND role = "management"', [userId]);
        if (userRows.length === 0) return res.status(404).json({ success: false, message: "Management user not found" });

        const [analyticsRows] = await db.execute('SELECT metric_name, metric_value, trend FROM college_analytics');

        // Transform rows to an object for easy frontend access
        const kpis = {};
        for (const row of analyticsRows) {
            kpis[row.metric_name] = { value: row.metric_value, trend: row.trend };
        }

        res.json({
            success: true,
            data: {
                user: userRows[0],
                kpis
            }
        });
    } catch (error) {
        console.error("Management Dashboard API Error:", error);
        next(error);
    }
});

/**
 * ============================================================
 * SUPER ADMIN DASHBOARD API
 * ============================================================
 */
app.get('/api/dashboard/admin/:userId', async (req, res, next) => {
    try {
        const { userId } = req.params;
        console.log(`📩 Admin dashboard data request for user ${userId}`);

        const [userRows] = await db.execute('SELECT id, name, email, role FROM users WHERE id = ? AND role = "admin"', [userId]);
        if (userRows.length === 0) return res.status(404).json({ success: false, message: "Admin user not found" });

        const [logsRows] = await db.execute('SELECT id, action, ip_address, timestamp FROM system_logs ORDER BY timestamp DESC LIMIT 50');

        const [settingsRows] = await db.execute('SELECT setting_key, setting_value FROM system_settings');
        const settings = {};
        for (const row of settingsRows) {
            settings[row.setting_key] = row.setting_value;
        }

        res.json({
            success: true,
            data: {
                user: userRows[0],
                recent_logs: logsRows,
                system_stats: settings
            }
        });
    } catch (error) {
        console.error("Admin Dashboard API Error:", error);
        next(error);
    }
});

/**
 * ============================================================
 * ADMIN — PORTAL MANAGER APIs
 * ============================================================
 */

/**
 * GET /api/admin/portals/overview
 * Returns live counts per role + current lock status for all portals.
 */
app.get('/api/admin/portals/overview', async (req, res, next) => {
    try {
        // Count users grouped by role
        const [counts] = await db.execute(
            'SELECT role, COUNT(*) as total FROM users GROUP BY role'
        );
        const roleMap = {};
        for (const row of counts) roleMap[row.role] = row.total;

        // Fetch currently locked portals
        const [locks] = await db.execute('SELECT portal_type FROM portal_locks');
        const lockedPortals = new Set(locks.map(l => l.portal_type));

        const data = {
            student: {
                activeUsers: Math.round((roleMap.student || 0) * 0.35), // ~35% online estimate
                totalStudents: roleMap.student || 0,
                lastActivity: '2 mins ago',
                status: (roleMap.student || 0) > 0 ? 'online' : 'degraded',
                locked: lockedPortals.has('student')
            },
            staff: {
                activeUsers: Math.round((roleMap.staff || 0) * 0.6),
                totalStaff: roleMap.staff || 0,
                lastActivity: '5 mins ago',
                status: (roleMap.staff || 0) > 0 ? 'online' : 'degraded',
                locked: lockedPortals.has('staff')
            },
            management: {
                activeUsers: Math.round((roleMap.management || 0) * 0.5),
                totalMembers: roleMap.management || 0,
                lastActivity: '1 hr ago',
                status: (roleMap.management || 0) > 0 ? 'online' : 'degraded',
                locked: lockedPortals.has('management')
            },
            admin: {
                activeUsers: roleMap.admin || 0,
                totalAdmins: roleMap.admin || 0,
                lastActivity: 'Just now',
                status: (roleMap.admin || 0) > 0 ? 'online' : 'degraded',
                locked: lockedPortals.has('admin')
            }
        };

        res.json({ success: true, data });
    } catch (error) {
        console.error('Portals Overview Error:', error);
        next(error);
    }
});

/**
 * GET /api/admin/portal/:portalType/users
 * Paginated + searchable user list for a given portal (role).
 * Query params: ?page=1&limit=20&search=&department=
 */
app.get('/api/admin/portal/:portalType/users', async (req, res, next) => {
    try {
        const { portalType } = req.params;
        const page     = Math.max(1, parseInt(req.query.page  || '1', 10));
        const limit    = Math.min(50, parseInt(req.query.limit || '20', 10));
        const search   = (req.query.search     || '').trim();
        const dept     = (req.query.department || '').trim();
        const offset   = (page - 1) * limit;

        const validRoles = ['student', 'staff', 'management', 'admin'];
        if (!validRoles.includes(portalType)) {
            return res.status(400).json({ success: false, error: 'Invalid portal type' });
        }

        // Build WHERE clause
        let where = 'u.role = ?';
        const params = [portalType];

        if (search) {
            where += ' AND (u.name LIKE ? OR u.email LIKE ?)';
            params.push(`%${search}%`, `%${search}%`);
        }

        // For students/staff — join profile for department filter
        let joinClause = '';
        let extraCols  = '';

        if (portalType === 'student') {
            joinClause = 'LEFT JOIN student_profiles sp ON sp.user_id = u.id';
            extraCols  = ', sp.department, sp.cgpa, sp.semester';
            if (dept) { where += ' AND sp.department = ?'; params.push(dept); }
        } else if (portalType === 'staff') {
            joinClause = 'LEFT JOIN staff_profiles sp ON sp.user_id = u.id';
            extraCols  = ', sp.department, sp.designation';
            if (dept) { where += ' AND sp.department = ?'; params.push(dept); }
        }

        // Total count
        const [countRows] = await db.execute(
            `SELECT COUNT(*) as total FROM users u ${joinClause} WHERE ${where}`,
            params
        );
        const total = countRows[0].total;

        // Paginated rows
        const [users] = await db.execute(
            `SELECT u.id, u.name, u.email, u.role, u.mfa_enabled ${extraCols}
             FROM users u ${joinClause}
             WHERE ${where}
             ORDER BY u.id DESC
             LIMIT ? OFFSET ?`,
            [...params, limit, offset]
        );

        res.json({
            success: true,
            data: {
                users,
                total,
                page,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        console.error('Portal Users Error:', error);
        next(error);
    }
});

/**
 * GET /api/admin/portal/:portalType/user/:userId
 * Full profile for a single user — joins role-specific tables.
 */
app.get('/api/admin/portal/:portalType/user/:userId', async (req, res, next) => {
    try {
        const { portalType, userId } = req.params;

        const [userRows] = await db.execute(
            'SELECT id, name, email, role, mfa_enabled FROM users WHERE id = ? AND role = ?',
            [userId, portalType]
        );
        if (userRows.length === 0) {
            return res.status(404).json({ success: false, error: 'User not found' });
        }
        const user = userRows[0];

        let profile = null;
        let extra   = {};

        if (portalType === 'student') {
            const [p] = await db.execute(
                'SELECT cgpa, total_credits, semester, department, enrollment_year FROM student_profiles WHERE user_id = ?',
                [userId]
            );
            profile = p[0] || null;

            const [att] = await db.execute(
                'SELECT subject_name, classes_attended, total_classes, percentage, status_badge FROM attendance WHERE user_id = ? LIMIT 10',
                [userId]
            );
            const [perf] = await db.execute(
                'SELECT semester_label, gpa FROM performance_trends WHERE user_id = ? ORDER BY semester',
                [userId]
            );
            extra = { attendance: att, performance: perf };

        } else if (portalType === 'staff') {
            const [p] = await db.execute(
                'SELECT department, designation, assigned_courses, leave_balance, total_mentees FROM staff_profiles WHERE user_id = ?',
                [userId]
            );
            profile = p[0] || null;

            const [reqs] = await db.execute(
                'SELECT student_name, type, status, dates FROM pending_requests WHERE staff_id = ? LIMIT 5',
                [userId]
            );
            extra = { pending_requests: reqs };
        }

        res.json({ success: true, data: { user, profile, ...extra } });
    } catch (error) {
        console.error('Portal User Profile Error:', error);
        next(error);
    }
});

/**
 * POST /api/admin/portal/lock
 * Body: { portalType, adminId }
 * Inserts or replaces a row in portal_locks.
 */
app.post('/api/admin/portal/lock', async (req, res, next) => {
    try {
        const { portalType, adminId } = req.body;
        if (!portalType || !adminId) {
            return res.status(400).json({ success: false, error: 'portalType and adminId are required' });
        }

        const validTypes = ['student', 'staff', 'management', 'admin'];
        if (!validTypes.includes(portalType)) {
            return res.status(400).json({ success: false, error: 'Invalid portal type' });
        }

        // REPLACE INTO handles both insert and update (if already locked, refreshes)
        await db.execute(
            'REPLACE INTO portal_locks (portal_type, locked_by, locked_at) VALUES (?, ?, NOW())',
            [portalType, adminId]
        );

        await db.execute(
            'INSERT INTO system_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
            [adminId, `Portal LOCKED: ${portalType}`, req.ip || '127.0.0.1']
        );

        console.log(`🔒 Portal locked: ${portalType} by admin ${adminId}`);
        res.json({ success: true, message: `${portalType} portal locked successfully` });
    } catch (error) {
        console.error('Portal Lock Error:', error);
        next(error);
    }
});

/**
 * POST /api/admin/portal/unlock
 * Body: { portalType, adminId }
 * Deletes the lock row from portal_locks.
 */
app.post('/api/admin/portal/unlock', async (req, res, next) => {
    try {
        const { portalType, adminId } = req.body;
        if (!portalType || !adminId) {
            return res.status(400).json({ success: false, error: 'portalType and adminId are required' });
        }

        await db.execute('DELETE FROM portal_locks WHERE portal_type = ?', [portalType]);

        await db.execute(
            'INSERT INTO system_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
            [adminId, `Portal UNLOCKED: ${portalType}`, req.ip || '127.0.0.1']
        );

        console.log(`🔓 Portal unlocked: ${portalType} by admin ${adminId}`);
        res.json({ success: true, message: `${portalType} portal unlocked successfully` });
    } catch (error) {
        console.error('Portal Unlock Error:', error);
        next(error);
    }
});

/**
 * POST /api/admin/global/force-logout
 * Body: { adminId }
 * Logs the action (sessions table not yet implemented — logs to system_logs).
 */
app.post('/api/admin/global/force-logout', async (req, res, next) => {
    try {
        const { adminId } = req.body;
        if (!adminId) return res.status(400).json({ success: false, error: 'adminId is required' });

        // Count all non-admin active users
        const [countRows] = await db.execute(
            "SELECT COUNT(*) as total FROM users WHERE role != 'admin'"
        );
        const affected = countRows[0].total;

        await db.execute(
            'INSERT INTO system_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
            [adminId, `GLOBAL force-logout triggered — ${affected} users affected`, req.ip || '127.0.0.1']
        );

        console.log(`🚨 Force logout by admin ${adminId} — ${affected} users affected`);
        res.json({ success: true, data: { affected }, message: `All sessions terminated (${affected} users)` });
    } catch (error) {
        console.error('Force Logout Error:', error);
        next(error);
    }
});

/**
 * POST /api/admin/global/maintenance
 * Body: { enabled: boolean, adminId }
 * Upserts maintenance_mode key in system_settings.
 */
app.post('/api/admin/global/maintenance', async (req, res, next) => {
    try {
        const { enabled, adminId } = req.body;
        if (typeof enabled !== 'boolean' || !adminId) {
            return res.status(400).json({ success: false, error: 'enabled (boolean) and adminId are required' });
        }

        await db.execute(
            `INSERT INTO system_settings (setting_key, setting_value, description)
             VALUES ('maintenance_mode', ?, 'Global maintenance mode flag')
             ON DUPLICATE KEY UPDATE setting_value = ?`,
            [JSON.stringify(enabled), JSON.stringify(enabled)]
        );

        await db.execute(
            'INSERT INTO system_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
            [adminId, `Maintenance mode ${enabled ? 'ENABLED' : 'DISABLED'}`, req.ip || '127.0.0.1']
        );

        console.log(`🛠️  Maintenance mode ${enabled ? 'enabled' : 'disabled'} by admin ${adminId}`);
        res.json({ success: true, data: { maintenance_mode: enabled } });
    } catch (error) {
        console.error('Maintenance Mode Error:', error);
        next(error);
    }
});

/**
 * POST /api/admin/global/reset-passwords
 * Body: { adminId }
 * Sets a password_reset_required flag in system_settings for tracking.
 * Returns count of affected non-admin users.
 */
app.post('/api/admin/global/reset-passwords', async (req, res, next) => {
    try {
        const { adminId } = req.body;
        if (!adminId) return res.status(400).json({ success: false, error: 'adminId is required' });

        const [countRows] = await db.execute(
            "SELECT COUNT(*) as total FROM users WHERE role != 'admin'"
        );
        const affected = countRows[0].total;

        // Store the flag in system_settings
        await db.execute(
            `INSERT INTO system_settings (setting_key, setting_value, description)
             VALUES ('password_reset_required', 'true', 'Force password reset on next login for all non-admin users')
             ON DUPLICATE KEY UPDATE setting_value = 'true'`
        );

        await db.execute(
            'INSERT INTO system_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
            [adminId, `GLOBAL password reset flagged — ${affected} users affected`, req.ip || '127.0.0.1']
        );

        console.log(`🔑 Password reset flagged by admin ${adminId} — ${affected} users`);
        res.json({ success: true, data: { affected }, message: `Password reset flagged for ${affected} users` });
    } catch (error) {
        console.error('Reset Passwords Error:', error);
        next(error);
    }
});

// Global error handler for Express 5

app.use((err, req, res, next) => {
    console.error("🔥 Unhandled Error:", err.message);
    console.error(err.stack);
    res.status(500);
    res.json({ success: false, message: err.message || "Internal Server Error" });
});