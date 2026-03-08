const mysql = require('mysql2/promise');
require('dotenv').config();

/**
 * This function automates the Database and Table creation.
 * It is exported so server.js can trigger it on startup.
 */
const setupDB = async () => {
  try {
    // 1. Connect to MySQL Server (without a specific DB)
    const connection = await mysql.createConnection({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
    });

    console.log("Successfully connected to MySQL Server.");

    // 2. Create the Database if it doesn't exist yet
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME};`);
    console.log(`Database "${process.env.DB_NAME}" checked/created.`);

    await connection.end();

    // 3. Create a Pool specifically for our ERP database
    const pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASS,
      database: process.env.DB_NAME,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    // 4. Create the Users table
    const userTableQuery = `
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'management', 'staff', 'student') DEFAULT 'student',
        mfa_enabled BOOLEAN DEFAULT FALSE,
        mfa_secret VARCHAR(255) NULL
      );
    `;
    await pool.query(userTableQuery);
    console.log("Table 'users' is ready.");

    // 5. Create Student Profile table (CGPA, Credits)
    const studentProfileQuery = `
      CREATE TABLE IF NOT EXISTS student_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        cgpa DECIMAL(3,2) DEFAULT 0.00,
        total_credits INT DEFAULT 0,
        semester INT DEFAULT 1,
        department VARCHAR(100) DEFAULT 'Computer Science',
        enrollment_year INT DEFAULT 2024,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await pool.query(studentProfileQuery);
    console.log("Table 'student_profiles' is ready.");

    // 6. Create Attendance table
    const attendanceQuery = `
      CREATE TABLE IF NOT EXISTS attendance (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        subject_code VARCHAR(20) NOT NULL,
        subject_name VARCHAR(100) NOT NULL,
        classes_attended INT DEFAULT 0,
        total_classes INT DEFAULT 0,
        percentage DECIMAL(5,2) DEFAULT 0.00,
        status_badge ENUM('Safe', 'Low', 'Critical') DEFAULT 'Safe',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await pool.query(attendanceQuery);
    console.log("Table 'attendance' is ready.");

    // 7. Create Schedule table
    const scheduleQuery = `
      CREATE TABLE IF NOT EXISTS schedule (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        class_name VARCHAR(100) NOT NULL,
        instructor VARCHAR(100) DEFAULT 'TBA',
        room VARCHAR(50) DEFAULT 'TBA',
        start_time TIME NOT NULL,
        end_time TIME NOT NULL,
        day_of_week ENUM('Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday') NOT NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await pool.query(scheduleQuery);
    console.log("Table 'schedule' is ready.");

    // 8. Create Assignments table
    const assignmentsQuery = `
      CREATE TABLE IF NOT EXISTS assignments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        title VARCHAR(200) NOT NULL,
        subject VARCHAR(100) NOT NULL,
        deadline_date DATE NOT NULL,
        urgency ENUM('Today', 'This Week', 'Later') DEFAULT 'Later',
        status ENUM('Pending', 'Submitted', 'Graded') DEFAULT 'Pending',
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await pool.query(assignmentsQuery);
    console.log("Table 'assignments' is ready.");

    // 9. Create Performance Trends table (GPA per semester)
    const performanceQuery = `
      CREATE TABLE IF NOT EXISTS performance_trends (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        semester INT NOT NULL,
        semester_label VARCHAR(20) NOT NULL,
        gpa DECIMAL(3,2) NOT NULL,
        UNIQUE KEY unique_user_semester (user_id, semester),
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await pool.query(performanceQuery);
    console.log("Table 'performance_trends' is ready.");

    // 10. Create Staff Profile table
    const staffProfileQuery = `
      CREATE TABLE IF NOT EXISTS staff_profiles (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL UNIQUE,
        department VARCHAR(100) DEFAULT 'Computer Science',
        designation VARCHAR(100) DEFAULT 'Assistant Professor',
        assigned_courses INT DEFAULT 0,
        leave_balance INT DEFAULT 12,
        total_mentees INT DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await pool.query(staffProfileQuery);
    console.log("Table 'staff_profiles' is ready.");

    // 11. Create Pending Requests table
    const pendingRequestsQuery = `
      CREATE TABLE IF NOT EXISTS pending_requests (
        id INT AUTO_INCREMENT PRIMARY KEY,
        staff_id INT NOT NULL,
        student_name VARCHAR(100) NOT NULL,
        roll_number VARCHAR(20) NOT NULL,
        type ENUM('Leave', 'OD') NOT NULL,
        reason TEXT NOT NULL,
        dates VARCHAR(100) NOT NULL,
        status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
        FOREIGN KEY (staff_id) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await pool.query(pendingRequestsQuery);
    console.log("Table 'pending_requests' is ready.");

    // 12. Create College Analytics table (for Management Dashboard)
    const collegeAnalyticsQuery = `
      CREATE TABLE IF NOT EXISTS college_analytics (
        id INT AUTO_INCREMENT PRIMARY KEY,
        metric_name VARCHAR(100) NOT NULL UNIQUE,
        metric_value VARCHAR(100) NOT NULL,
        trend VARCHAR(50) DEFAULT 'up',
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      );
    `;
    await pool.query(collegeAnalyticsQuery);
    console.log("Table 'college_analytics' is ready.");

    // 13. Create System Logs table (for Super Admin Audit Log)
    const systemLogsQuery = `
      CREATE TABLE IF NOT EXISTS system_logs (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        action VARCHAR(255) NOT NULL,
        ip_address VARCHAR(45) DEFAULT '127.0.0.1',
        timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
      );
    `;
    await pool.query(systemLogsQuery);
    console.log("Table 'system_logs' is ready.");

    // 14. Create System Settings table (for Permissions Matrix)
    const systemSettingsQuery = `
      CREATE TABLE IF NOT EXISTS system_settings (
        id INT AUTO_INCREMENT PRIMARY KEY,
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value JSON NOT NULL,
        description TEXT
      );
    `;
    await pool.query(systemSettingsQuery);
    console.log("Table 'system_settings' is ready.");

    // 15. Create Portal Locks table (for Admin Portal Manager — lock/unlock portals)
    const portalLocksQuery = `
      CREATE TABLE IF NOT EXISTS portal_locks (
        portal_type VARCHAR(20) PRIMARY KEY,
        locked_by INT NOT NULL,
        locked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (locked_by) REFERENCES users(id) ON DELETE CASCADE
      );
    `;
    await pool.query(portalLocksQuery);
    console.log("Table 'portal_locks' is ready.");

    return pool;


  } catch (error) {
    console.error("❌ SQL SETUP ERROR:");
    console.error("Message:", error.message);
    console.error("Check your .env password and ensure MySQL is running.");
    process.exit(1);
  }
};

/**
 * Seeds demo dashboard data for a given student user_id.
 * Only inserts if data doesn't already exist.
 */
const seedStudentData = async (pool, userId) => {
  try {
    // Check if profile already exists
    const [existing] = await pool.execute(
      'SELECT id FROM student_profiles WHERE user_id = ?', [userId]
    );
    if (existing.length > 0) {
      console.log(`Dashboard data already seeded for user ${userId}.`);
      return;
    }

    // Student Profile
    await pool.execute(
      'INSERT INTO student_profiles (user_id, cgpa, total_credits, semester, department, enrollment_year) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 8.72, 96, 5, 'Computer Science', 2024]
    );

    // Attendance records
    const attendanceData = [
      [userId, 'CS301', 'Data Structures', 38, 42, 90.48, 'Safe'],
      [userId, 'CS302', 'Operating Systems', 35, 42, 83.33, 'Safe'],
      [userId, 'CS303', 'Database Systems', 30, 42, 71.43, 'Low'],
      [userId, 'MA301', 'Discrete Mathematics', 40, 42, 95.24, 'Safe'],
      [userId, 'CS304', 'Computer Networks', 28, 42, 66.67, 'Critical'],
      [userId, 'HS301', 'Technical Writing', 39, 42, 92.86, 'Safe'],
    ];
    for (const row of attendanceData) {
      await pool.execute(
        'INSERT INTO attendance (user_id, subject_code, subject_name, classes_attended, total_classes, percentage, status_badge) VALUES (?, ?, ?, ?, ?, ?, ?)',
        row
      );
    }

    // Schedule (Monday classes as example for "Today")
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const scheduleData = [
      [userId, 'Data Structures', 'Dr. Sharma', 'Room 301', '09:00:00', '10:00:00', 'Monday'],
      [userId, 'Operating Systems', 'Prof. Gupta', 'Room 204', '10:15:00', '11:15:00', 'Monday'],
      [userId, 'Database Systems', 'Dr. Patel', 'Lab 102', '11:30:00', '12:30:00', 'Monday'],
      [userId, 'Discrete Mathematics', 'Prof. Rao', 'Room 405', '14:00:00', '15:00:00', 'Monday'],
      [userId, 'Computer Networks', 'Dr. Kumar', 'Room 301', '15:15:00', '16:15:00', 'Monday'],
      [userId, 'Data Structures', 'Dr. Sharma', 'Lab 101', '09:00:00', '10:00:00', 'Tuesday'],
      [userId, 'Technical Writing', 'Prof. Singh', 'Room 110', '10:15:00', '11:15:00', 'Tuesday'],
      [userId, 'Operating Systems', 'Prof. Gupta', 'Room 204', '11:30:00', '12:30:00', 'Wednesday'],
      [userId, 'Database Systems', 'Dr. Patel', 'Room 305', '14:00:00', '15:00:00', 'Wednesday'],
      [userId, 'Computer Networks', 'Dr. Kumar', 'Lab 103', '09:00:00', '10:00:00', 'Thursday'],
      [userId, 'Discrete Mathematics', 'Prof. Rao', 'Room 405', '10:15:00', '11:15:00', 'Thursday'],
      [userId, 'Data Structures', 'Dr. Sharma', 'Room 301', '14:00:00', '15:00:00', 'Friday'],
      [userId, 'Technical Writing', 'Prof. Singh', 'Room 110', '10:15:00', '11:15:00', 'Friday'],
    ];
    for (const row of scheduleData) {
      await pool.execute(
        'INSERT INTO schedule (user_id, class_name, instructor, room, start_time, end_time, day_of_week) VALUES (?, ?, ?, ?, ?, ?, ?)',
        row
      );
    }

    // Assignments
    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];
    const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

    const assignmentsData = [
      [userId, 'Binary Tree Implementation', 'Data Structures', formatDate(today), 'Today', 'Pending'],
      [userId, 'ER Diagram for Library System', 'Database Systems', formatDate(addDays(today, 1)), 'This Week', 'Pending'],
      [userId, 'Process Scheduling Simulation', 'Operating Systems', formatDate(addDays(today, 3)), 'This Week', 'Pending'],
      [userId, 'Graph Theory Problem Set', 'Discrete Mathematics', formatDate(addDays(today, 5)), 'This Week', 'Pending'],
      [userId, 'Network Protocol Analysis', 'Computer Networks', formatDate(addDays(today, 10)), 'Later', 'Pending'],
      [userId, 'Technical Report Draft', 'Technical Writing', formatDate(addDays(today, 14)), 'Later', 'Submitted'],
    ];
    for (const row of assignmentsData) {
      await pool.execute(
        'INSERT INTO assignments (user_id, title, subject, deadline_date, urgency, status) VALUES (?, ?, ?, ?, ?, ?)',
        row
      );
    }

    // Performance Trends (GPA per semester)
    const performanceData = [
      [userId, 1, 'Sem 1', 7.80],
      [userId, 2, 'Sem 2', 8.10],
      [userId, 3, 'Sem 3', 8.45],
      [userId, 4, 'Sem 4', 8.90],
      [userId, 5, 'Sem 5', 8.72],
    ];
    for (const row of performanceData) {
      await pool.execute(
        'INSERT INTO performance_trends (user_id, semester, semester_label, gpa) VALUES (?, ?, ?, ?)',
        row
      );
    }

    console.log(`✅ Dashboard data seeded successfully for user ${userId}.`);
  } catch (error) {
    console.error(`Error seeding data for user ${userId}:`, error.message);
  }
};

/**
 * Seeds demo dashboard data for a given staff user_id.
 */
const seedStaffData = async (pool, userId) => {
  try {
    const [existing] = await pool.execute('SELECT id FROM staff_profiles WHERE user_id = ?', [userId]);
    if (existing.length > 0) return;

    await pool.execute(
      'INSERT INTO staff_profiles (user_id, department, designation, assigned_courses, leave_balance, total_mentees) VALUES (?, ?, ?, ?, ?, ?)',
      [userId, 'Computer Science', 'Associate Professor', 4, 12, 24]
    );

    const today = new Date();
    const formatDate = (d) => d.toISOString().split('T')[0];

    // We can reuse schedule table for staff too, mapping day_of_week
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
    const currentDay = days[today.getDay() === 0 || today.getDay() === 6 ? 0 : today.getDay() - 1]; // Fallback to Monday if weekend

    const scheduleData = [
      [userId, 'Data Structures', 'B.Tech CS Sec A', 'Room 301', '09:00:00', '10:00:00', currentDay],
      [userId, 'Operating Systems', 'B.Tech CS Sec B', 'Room 204', '10:15:00', '11:15:00', currentDay],
      [userId, 'Mentoring Batch A', 'Mentorship', 'Lab 102', '11:30:00', '12:30:00', currentDay],
    ];
    for (const row of scheduleData) {
      await pool.execute(
        'INSERT INTO schedule (user_id, class_name, instructor, room, start_time, end_time, day_of_week) VALUES (?, ?, ?, ?, ?, ?, ?)',
        row
      );
    }

    const requestsData = [
      [userId, 'Alice Johnson', 'CS24001', 'Leave', 'Medical Reason', formatDate(today), 'Pending'],
      [userId, 'Bob Smith', 'CS24045', 'OD', 'Hackathon Participation', formatDate(new Date(today.getTime() + 86400000)), 'Pending'],
      [userId, 'Charlie Davis', 'CS24012', 'Leave', 'Family Event', formatDate(new Date(today.getTime() + 86400000 * 2)), 'Pending'],
    ];
    for (const row of requestsData) {
      await pool.execute(
        'INSERT INTO pending_requests (staff_id, student_name, roll_number, type, reason, dates, status) VALUES (?, ?, ?, ?, ?, ?, ?)',
        row
      );
    }

    console.log(`✅ Staff data seeded successfully for user ${userId}.`);
  } catch (error) {
    console.error(`Error seeding staff data:`, error.message);
  }
};

/**
 * Seeds demo dashboard data for a given management user_id.
 */
const seedManagementData = async (pool, userId) => {
  try {
    const [existing] = await pool.execute('SELECT id FROM college_analytics LIMIT 1');
    if (existing.length > 0) return; // Only seed once globally

    const analyticsData = [
      ['total_students', '14,250', 'up'],
      ['revenue_collected', '$4.2M', 'up'],
      ['placement_percentage', '92%', 'up'],
      ['faculty_strength', '450', 'up']
    ];

    for (const row of analyticsData) {
      await pool.execute(
        'INSERT INTO college_analytics (metric_name, metric_value, trend) VALUES (?, ?, ?)',
        row
      );
    }

    console.log(`✅ Management data (college analytics) seeded successfully.`);
  } catch (error) {
    console.error(`Error seeding management data:`, error.message);
  }
};

/**
 * Seeds demo dashboard data for a given admin user_id.
 */
const seedAdminData = async (pool, userId) => {
  try {
    const [existingLogs] = await pool.execute('SELECT id FROM system_logs LIMIT 1');
    if (existingLogs.length === 0) {
      const logsData = [
        [userId, 'System Initialized', '127.0.0.1'],
        [userId, 'Database Backup Completed', '127.0.0.1'],
        [userId, 'New Admin User Registered', '127.0.0.1'],
      ];
      for (const row of logsData) {
        await pool.execute(
          'INSERT INTO system_logs (user_id, action, ip_address) VALUES (?, ?, ?)',
          row
        );
      }
    }

    const [existingSettings] = await pool.execute('SELECT id FROM system_settings LIMIT 1');
    if (existingSettings.length === 0) {
      const settingsData = [
        ['permissions_matrix', JSON.stringify({
          'admin': { 'edit_grades': true, 'delete_users': true, 'view_financials': true },
          'management': { 'edit_grades': false, 'delete_users': false, 'view_financials': true },
          'staff': { 'edit_grades': true, 'delete_users': false, 'view_financials': false }
        }), 'Default role permissions'],
        ['active_sessions', JSON.stringify({ count: 1245 }), 'Current active user sessions'],
        ['server_uptime', JSON.stringify({ days: 42, hours: 14 }), 'Server uptime stats'],
        ['database_size', JSON.stringify({ size: '14.2 GB' }), 'Current DB size']
      ];
      for (const row of settingsData) {
        await pool.execute(
          'INSERT INTO system_settings (setting_key, setting_value, description) VALUES (?, ?, ?)',
          row
        );
      }
    }

    console.log(`✅ Admin data (system logs & settings) seeded successfully.`);
  } catch (error) {
    console.error(`Error seeding admin data:`, error.message);
  }
};

module.exports = { setupDB, seedStudentData, seedStaffData, seedManagementData, seedAdminData };