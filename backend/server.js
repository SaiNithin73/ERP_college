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

// Global error handler for Express 5
app.use((err, req, res, next) => {
    console.error("🔥 Unhandled Error:", err.message);
    console.error(err.stack);
    res.status(500);
    res.json({ success: false, message: err.message || "Internal Server Error" });
});