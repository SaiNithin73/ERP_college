/**
 * api.d.ts — All API response shapes consumed by the frontend.
 * Every shape here must match the backend response envelope exactly:
 *   Success: { success: true, data: T }
 *   Error:   { success: false, error: string }
 *
 * Rule F4: `any` is forbidden. All API data must be typed here.
 * Rule B4: These shapes mirror the backend envelope contract.
 */

// ─── Envelope ──────────────────────────────────────────────────────────────

export type ApiSuccess<T> = { success: true; data: T };
export type ApiError = { success: false; error: string };
export type ApiResponse<T> = ApiSuccess<T> | ApiError;

// ─── Auth ──────────────────────────────────────────────────────────────────

export interface LoginPayload {
    email: string;
    password: string;
}

export interface LoginData {
    userId: number;
    role: 'student' | 'staff' | 'admin' | 'management';
    requiresMfa: boolean;
    token?: string;
}

export interface MfaVerifyData {
    userId: number;
    token: string;
}

export interface MfaVerifyResult {
    token: string;
    role: 'student' | 'staff' | 'admin' | 'management';
    userId: number;
}

// ─── Student Portal ────────────────────────────────────────────────────────

export interface StudentProfile {
    cgpa: number;
    total_credits: number;
    semester: number;
    department: string;
    enrollment_year: number;
}

export interface AttendanceRecord {
    subject_code: string;
    subject_name: string;
    classes_attended: number;
    total_classes: number;
    percentage: number;
    status_badge: 'Safe' | 'Low' | 'Critical';
}

export interface ScheduleItem {
    class_name: string;
    instructor: string;
    room: string;
    start_time: string;
    end_time: string;
    day_of_week: string;
}

export interface Assignment {
    title: string;
    subject: string;
    deadline_date: string;
    urgency: 'Today' | 'This Week' | 'Later';
    status: 'Pending' | 'Submitted' | 'Graded';
}

export interface PerformanceTrend {
    semester: number;
    semester_label: string;
    gpa: number;
}

export interface DashboardStudentData {
    user: { id: number; name: string; email: string; role: string };
    profile: StudentProfile | null;
    attendance: AttendanceRecord[];
    schedule: ScheduleItem[];
    assignments: Assignment[];
    performance: PerformanceTrend[];
}

export interface FeePaymentRecord {
    id: string;
    description: string;
    amount: number;
    due_date: string;
    status: 'Pending' | 'Paid' | 'Overdue';
    receipt_url?: string;
}

export interface FineRecord {
    id: string;
    reason: string;
    amount: number;
    date_issued: string;
    status: 'Unpaid' | 'Paid';
    receipt_url?: string;
}


// ─── Staff Portal ──────────────────────────────────────────────────────────

export interface StaffCourse {
    course_code: string;
    course_name: string;
    section: string;
    student_count: number;
}

export interface LeaveRequest {
    id: number;
    student_name: string;
    student_id: string;
    reason: string;
    from_date: string;
    to_date: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface DashboardStaffData {
    user: { id: number; name: string; email: string; role: string };
    courses: StaffCourse[];
    leave_requests: LeaveRequest[];
}

export interface QuestionPaperRecord {
    id: string;
    subject: string;
    semester: string;
    exam_type: 'Midterm' | 'Final' | 'Quiz';
    status: 'Draft' | 'Submitted' | 'Approved' | 'Rejected';
    last_updated: string;
}

export interface SalaryRecord {
    month: string;
    base_pay: number;
    allowances: number;
    deductions: number;
    net_pay: number;
    status: 'Processing' | 'Paid';
    payslip_url?: string;
}

export interface ClassAssignment {
    id: string;
    title: string;
    course: string;
    due_date: string;
    submissions: number;
    total_students: number;
}

export interface StaffProfile {
    id: string;
    name: string;
    email: string;
    department: string;
    designation: string;
    joining_date: string;
}


// ─── Admin Portal ──────────────────────────────────────────────────────────

export interface AuditLog {
    id: number;
    action: string;
    ip_address: string;
    timestamp: string;
}

export interface AdminSystemStats {
    active_sessions: { count: number };
    server_uptime: { days: number; hours: number };
    database_size: { size: string };
    permissions_matrix: Record<string, Record<string, boolean>>;
}

export interface AdminUserRecord {
    id: string;
    name: string;
    email: string;
    role: string;
    mfa: boolean;
    status: 'Active' | 'Inactive' | 'Locked';
}

export interface DashboardAdminData {
    user: { name: string; email: string; role: string };
    recent_logs: AuditLog[];
    system_stats: AdminSystemStats;
}

export interface PortalStatusCard {
    id: string;
    name: 'Student' | 'Staff' | 'Admin' | 'Management';
    status: 'ONLINE' | 'DEGRADED' | 'OFFLINE';
    active_users: number | string;
    pending_actions: number;
    last_sync: string;
}

export interface AdminStudentRecord {
    roll_no: string;
    name: string;
    department: string;
    semester: number;
    cgpa: number;
    attendance: number;
    status: 'Safe' | 'Low' | 'Critical';
}

export interface AdminStaffRecord {
    staff_id: string;
    name: string;
    department: string;
    designation: string;
    courses: number;
    leave_balance: number;
    status: 'Active' | 'On Leave' | 'Inactive';
}

export interface StaffLeaveRequestAdmin {
    id: number;
    staff_name: string;
    type: 'Sick' | 'Casual' | 'OD';
    reason: string;
    date_range: string;
    days: number;
    status: 'Pending' | 'Approved' | 'Rejected';
}

export interface SystemVital {
    metric: string;
    value: number | string;
    status: 'Normal' | 'Warning' | 'Critical';
    history: number[];
}

export interface ServiceStatus {
    name: string;
    status: 'Operational' | 'Degraded' | 'Down';
    uptime: number;
    last_incident: string;
    response_time: number;
}

export interface ErrorLogEntry {
    id: number;
    timestamp: string;
    severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
    service: string;
    message: string;
    resolved: boolean;
}

export interface Announcement {
    id: number;
    title: string;
    message: string;
    targets: string[];
    priority: 'Normal' | 'Important' | 'Urgent';
    timestamp: string;
}


// ─── Management Portal ─────────────────────────────────────────────────────

export interface EnrollmentStat {
    department: string;
    total_students: number;
    active_students: number;
}

export interface FinancialSummary {
    total_collected: number;
    total_pending: number;
    semester: number;
}

export interface DashboardManagementData {
    user: { name: string; email: string; role: string };
    enrollment: EnrollmentStat[];
    financials: FinancialSummary;
}

export interface DepartmentCard {
    id: string;
    name: string;
    hod: string;
    students: number;
    faculty: number;
    avg_cgpa: number;
    placement_percent: number;
}
