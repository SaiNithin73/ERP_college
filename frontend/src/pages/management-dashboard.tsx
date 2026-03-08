import { useEffect, useState, lazy, Suspense, Fragment } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    ArrowDownRight,
    ArrowUpRight,
    Award,
    Bell,
    BookOpen,
    Briefcase,
    Building,
    Calendar,
    CalendarDays,
    CalendarOff,
    Clock,
    BarChart,
    BarChart3,
    CheckCircle,
    ChevronLeft,
    ChevronRight,
    ClipboardCheck,
    Cpu,
    DollarSign,
    Download,
    FileText,
    GraduationCap,
    Home,
    Info,
    Layers,
    LayoutDashboard,
    Library,
    LogOut,
    Megaphone,
    Menu,
    Monitor,
    PieChart as PieChartIcon,
    Scale,
    Server,
    Settings,
    TrendingUp,
    User,
    UserCheck,
    UserPlus,
    Users,
    UserX,
    Wallet,
    Zap,
    Search,
    Edit2,
    Save,
    Plus,
    Filter,
    RefreshCw,
    Share2,
} from 'lucide-react';

import { useReducedMotion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

import { formatNumber, formatPercent, formatAttendance } from '@/lib/formatters';
import { fadeSlideUp, staggerContainer } from '@/components/animations/transitions';

import { toast } from 'sonner';

// Shadcn UI Components
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "@/components/ui/tabs";
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tooltip } from '@/components/ui/tooltips';



// Recharts
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    BarChart as RechartsBarChart,
    Bar,
    LineChart as RechartsLineChart,
    Line,
    PieChart as RechartsPieChart,
    Pie,
    Cell,
    RadialBarChart,
    RadialBar,
} from 'recharts';





// Theme
import { ThemeToggle } from '@/components/theme-toggle';

const ManagementAnalytics = lazy(() => import('@/features/management/analytics'));
const ManagementFinancials = lazy(() => import('@/features/management/financials'));
const ManagementDepartments = lazy(() => import('@/features/management/departments'));
const ManagementProfile = lazy(() => import('@/features/management/profile'));

// Removed lazy imports of Overview sections to inline implementation for stability and rule compliance
// const StudentOverview = lazy(() => import('@/features/management/student-overview'));
// const StaffOverview = lazy(() => import('@/features/management/staff-overview'));


// Attendance component is inlined below for stability and performance
// Examinations component is inlined below for stability and performance
const FeeManagement = lazy(() => import('@/features/management/fee-management'));
const LibraryOverview = lazy(() => import('@/features/management/library'));
// Timetable component is inlined below for stability and performance
// const Timetable = lazy(() => import('@/features/management/timetable'));
const Placements = lazy(() => import('@/features/management/placements'));
const Announcements = lazy(() => import('@/features/management/announcements'));
const Reports = lazy(() => import('@/features/management/reports'));
const SystemMonitor = lazy(() => import('@/features/management/system-monitor'));

const LazyFallback = () => <div className="h-[60vh] w-full animate-pulse bg-slate-100 dark:bg-white/5 rounded-xl" />;

// --- Types ---


interface FinancialData {
    month: string;
    revenue: number;
    expenses: number;
}

interface FunnelData {
    stage: string;
    count: number;
    fill: string;
}

interface DepartmentStat {
    name: string;
    attendance: number;
    pass_percentage: number;
    grievances: number;
}

interface ManagementData {
    user: { name: string; email: string; role: string; };
    kpis: Record<string, { value: string; trend: string }>;
}

// --- Mock Data (merged with API later) ---
const financeData: FinancialData[] = [
    { month: 'Jan', revenue: 400, expenses: 240 },
    { month: 'Feb', revenue: 300, expenses: 230 },
    { month: 'Mar', revenue: 550, expenses: 280 },
    { month: 'Apr', revenue: 450, expenses: 260 },
    { month: 'May', revenue: 600, expenses: 310 },
    { month: 'Jun', revenue: 650, expenses: 340 },
    { month: 'Jul', revenue: 500, expenses: 300 },
    { month: 'Aug', revenue: 700, expenses: 380 },
];



const funnelData: FunnelData[] = [
    { stage: 'Total Applicants', count: 15400, fill: '#64748b' }, // Slate 500
    { stage: 'Eligible', count: 8200, fill: '#8b5cf6' }, // Violet 500
    { stage: 'Interviewed', count: 4100, fill: '#ec4899' }, // Pink 500
    { stage: 'Admitted', count: 1250, fill: '#eab308' }, // Yellow 500
];

const departmentStats: DepartmentStat[] = [
    { name: 'Computer Science', attendance: 92, pass_percentage: 88, grievances: 12 },
    { name: 'Electronics', attendance: 85, pass_percentage: 81, grievances: 8 },
    { name: 'Mechanical', attendance: 78, pass_percentage: 75, grievances: 24 },
    { name: 'Information Tech', attendance: 90, pass_percentage: 85, grievances: 5 },
];

const criticalAlerts = [
    { id: 1, title: 'Library Budget Exceeded', desc: 'Q3 allocation overshot by 15%', type: 'warning' },
    { id: 2, title: 'Attendance Drop in MECH', desc: 'Average below 75% threshold', type: 'danger' },
    { id: 3, title: 'Server Maintenance', desc: 'Scheduled downtime tonight at 2 AM', type: 'info' },
];

// --- Student Overview Specific Types & Data ---

interface StudentKPI {
    id: string;
    label: string;
    value: string;
    sub: string;
    icon: any;
    color: string;
    trend?: { value: string; isUp: boolean };
}

interface DeptEnrollment {
    name: string;
    shortName: string;
    count: number;
}

interface AdmissionTrend {
    month: string;
    count: number;
}

interface AcademicPerformance {
    dept: string;
    slug: string;
    students: number;
    cgpa: number;
    passRate: number;
    backlogs: number;
    topStudent: string;
    performance: 'Excellent' | 'Good' | 'Needs Attention';
}


// --- Examinations Specific Types & Data ---

interface ExamKPI {
    id: string;
    label: string;
    value: string;
    sub: string;
    icon: any;
    color: string;
    trend?: { value: string; isUp: boolean; statusLabel?: string };
}

interface UpcomingExam {
    id: number;
    name: string;
    dept: string;
    date: string;
    time: string;
    venue: string;
    invigilator: string;
    students: number;
    status: 'Scheduled' | 'In Progress' | 'Completed' | 'Postponed';
}

interface DeptExamPerformance {
    dept: string;
    slug: string;
    appeared: number;
    pass: number;
    fail: number;
    absent: number;
    passRate: number;
    avgScore: number;
    rank: number;
    status: 'Excellent' | 'Good' | 'Below Average';
}

interface PassRateTrend {
    sem: string;
    inst: number;
    cs: number;
    law: number;
}

interface GPADistribution {
    range: string;
    count: number;
    percentage: number;
    fill: string;
}

const EXAM_KPIS: ExamKPI[] = [
    { id: 'upcoming', label: 'Exams Scheduled', value: '24', sub: 'Next 30 days across all depts', icon: CalendarDays, color: 'text-amber-500', trend: { value: 'None', isUp: true, statusLabel: 'On Schedule' } },
    { id: 'pending', label: 'Results Awaited', value: '8', sub: 'From last semester exams', icon: Clock, color: 'text-amber-500', trend: { value: 'None', isUp: false, statusLabel: 'In Progress' } },
    { id: 'pass-rate', label: 'Institution Pass Rate', value: '88.4%', sub: 'Last completed semester', icon: TrendingUp, color: 'text-emerald-500', trend: { value: '+2.1% vs previous semester', isUp: true } },
    { id: 'avg-score', label: 'Average Marks (out of 100)', value: '71.8', sub: 'Across all subjects last sem', icon: Award, color: 'text-purple-500', trend: { value: '+1.4 points improvement', isUp: true } },
];

const UPCOMING_EXAMS_DATA: UpcomingExam[] = [
    { id: 1, name: 'Data Structures', dept: 'CS', date: '08/03/2026', time: '09:00 AM – 12:00 PM', venue: 'Hall A', invigilator: 'Dr. Ramesh', students: 324, status: 'Scheduled' },
    { id: 2, name: 'Digital Electronics', dept: 'ECE', date: '09/03/2026', time: '09:00 AM – 12:00 PM', venue: 'Hall B', invigilator: 'Prof. Sunita', students: 218, status: 'Scheduled' },
    { id: 3, name: 'Fluid Mechanics', dept: 'ME', date: '10/03/2026', time: '02:00 PM – 05:00 PM', venue: 'Hall C', invigilator: 'Dr. Kartik', students: 195, status: 'Scheduled' },
    { id: 4, name: 'Business Law', dept: 'Law', date: '11/03/2026', time: '09:00 AM – 12:00 PM', venue: 'Hall D', invigilator: 'Prof. Deepak', students: 100, status: 'Scheduled' },
    { id: 5, name: 'Computer Networks', dept: 'CS', date: '12/03/2026', time: '09:00 AM – 12:00 PM', venue: 'Hall A', invigilator: 'Dr. Priya', students: 312, status: 'Scheduled' },
    { id: 6, name: 'Marketing Management', dept: 'MBA', date: '13/03/2026', time: '02:00 PM – 05:00 PM', venue: 'Hall E', invigilator: 'Prof. Anita', students: 184, status: 'Scheduled' },
    { id: 7, name: 'Structural Analysis', dept: 'CE', date: '14/03/2026', time: '09:00 AM – 12:00 PM', venue: 'Hall C', invigilator: 'Dr. Leela', students: 162, status: 'Scheduled' },
    { id: 8, name: 'Advanced Java', dept: 'MCA', date: '15/03/2026', time: '09:00 AM – 12:00 PM', venue: 'Lab 2', invigilator: 'Dr. Vijay', students: 142, status: 'Scheduled' },
];

const DEPT_EXAM_PERFORMANCE_DATA: DeptExamPerformance[] = [
    { dept: 'CS & Engg', slug: 'cs-engg', appeared: 3180, pass: 2960, fail: 164, absent: 56, passRate: 93.1, avgScore: 76.4, rank: 1, status: 'Excellent' },
    { dept: 'MBA', slug: 'mba', appeared: 1820, pass: 1684, fail: 106, absent: 30, passRate: 92.5, avgScore: 74.8, rank: 2, status: 'Excellent' },
    { dept: 'MCA', slug: 'mca', appeared: 1400, pass: 1288, fail: 84, absent: 28, passRate: 92.0, avgScore: 73.9, rank: 3, status: 'Excellent' },
    { dept: 'ECE', slug: 'ece', appeared: 2160, pass: 1944, fail: 164, absent: 52, passRate: 90.0, avgScore: 72.1, rank: 4, status: 'Excellent' },
    { dept: 'Mechanical', slug: 'mechanical', appeared: 1920, pass: 1632, fail: 230, absent: 58, passRate: 85.0, avgScore: 69.8, rank: 5, status: 'Good' },
    { dept: 'Civil', slug: 'civil', appeared: 1600, pass: 1312, fail: 224, absent: 64, passRate: 82.0, avgScore: 68.2, rank: 6, status: 'Good' },
    { dept: 'Law', slug: 'law', appeared: 980, pass: 735, fail: 196, absent: 49, passRate: 75.0, avgScore: 62.4, rank: 7, status: 'Below Average' },
];

const PASS_RATE_TREND_DATA: PassRateTrend[] = [
    { sem: 'Sem 1', inst: 84.2, cs: 91.8, law: 72.4 },
    { sem: 'Sem 2', inst: 85.6, cs: 92.4, law: 73.1 },
    { sem: 'Sem 3', inst: 86.1, cs: 92.8, law: 73.8 },
    { sem: 'Sem 4', inst: 86.8, cs: 93.1, law: 74.2 },
    { sem: 'Sem 5', inst: 87.4, cs: 93.4, law: 74.8 },
    { sem: 'Sem 6', inst: 88.4, cs: 93.1, law: 75.0 },
];

const GPA_DISTRIBUTION_DATA: GPADistribution[] = [
    { range: '9.0 – 10.0', count: 1840, percentage: 12.9, fill: 'hsl(var(--success))' },
    { range: '8.0 – 8.99', count: 3420, percentage: 24.0, fill: 'hsl(var(--success))' },
    { range: '7.0 – 7.99', count: 4280, percentage: 30.0, fill: 'hsl(var(--warning-surface))' },
    { range: '6.0 – 6.99', count: 2960, percentage: 20.8, fill: 'hsl(var(--warning-surface))' },
    { range: '5.0 – 5.99', count: 1240, percentage: 8.7, fill: 'hsl(var(--danger-surface))' },
    { range: 'Below 5.0', count: 510, percentage: 3.6, fill: 'hsl(var(--danger-surface))' },
];

const TOP_PERFORMERS = [
    { name: 'Arjun Mehta', dept: 'CS & Engg', score: '9.84' },
    { name: 'Priya Sharma', dept: 'ECE', score: '9.72' },
    { name: 'Kavya Nair', dept: 'MBA', score: '9.68' },
];

const STUDENT_KPIS: StudentKPI[] = [
    { id: 'total', label: 'Total Enrolled Students', value: '14,250', sub: 'Across all departments & semesters', icon: GraduationCap, color: 'text-amber-500', trend: { value: '+847 from last year', isUp: true } },
    { id: 'new', label: 'New Admissions (2025–26)', value: '2,840', sub: 'Academic year intake', icon: UserPlus, color: 'text-blue-500', trend: { value: '+12% vs last year', isUp: true } },
    { id: 'active', label: 'Currently Active', value: '13,910', sub: '340 on academic leave', icon: Users, color: 'text-emerald-500' },
    { id: 'grad', label: 'Graduated (2024–25)', value: '3,120', sub: '94.2% on-time graduation rate', icon: Award, color: 'text-purple-500', trend: { value: '+2.1% rate improvement', isUp: true } },
];

const ENROLLMENT_DATA: DeptEnrollment[] = [
    { name: 'Computer Science & Engg', shortName: 'CS & Engg', count: 3240 },
    { name: 'Electronics & Comm Engg', shortName: 'ECE', count: 2180 },
    { name: 'Mechanical Engineering', shortName: 'Mechanical', count: 1950 },
    { name: 'Civil Engineering', shortName: 'Civil', count: 1620 },
    { name: 'Master of Business Admin', shortName: 'MBA', count: 1840 },
    { name: 'Master of Computer Apps', shortName: 'MCA', count: 1420 },
    { name: 'Law', shortName: 'Law', count: 1000 },
];

const ADMISSION_TRENDS: AdmissionTrend[] = [
    { month: 'Jan', count: 120 }, { month: 'Feb', count: 95 }, { month: 'Mar', count: 180 },
    { month: 'Apr', count: 340 }, { month: 'May', count: 890 }, { month: 'Jun', count: 1240 },
    { month: 'Jul', count: 480 }, { month: 'Aug', count: 210 }, { month: 'Sep', count: 160 },
    { month: 'Oct', count: 95 }, { month: 'Nov', count: 80 }, { month: 'Dec', count: 60 },
];

const ACADEMIC_PERFORMANCE: AcademicPerformance[] = [
    { dept: 'CS & Engg', slug: 'cs-engg', students: 3240, cgpa: 8.72, passRate: 96, backlogs: 18, topStudent: 'Arjun Mehta', performance: 'Excellent' },
    { dept: 'ECE', slug: 'ece', students: 2180, cgpa: 8.41, passRate: 93, backlogs: 31, topStudent: 'Priya Sharma', performance: 'Excellent' },
    { dept: 'Mechanical', slug: 'mech', students: 1950, cgpa: 7.89, passRate: 88, backlogs: 67, topStudent: 'Rahul Verma', performance: 'Good' },
    { dept: 'Civil', slug: 'civil', students: 1620, cgpa: 7.65, passRate: 85, backlogs: 82, topStudent: 'Sneha Patel', performance: 'Good' },
    { dept: 'MBA', slug: 'mba', students: 1840, cgpa: 8.15, passRate: 91, backlogs: 24, topStudent: 'Kavya Nair', performance: 'Excellent' },
    { dept: 'MCA', slug: 'mca', students: 1420, cgpa: 8.33, passRate: 94, backlogs: 15, topStudent: 'Vikram Reddy', performance: 'Excellent' },
    { dept: 'Law', slug: 'law', students: 1000, cgpa: 7.48, passRate: 82, backlogs: 91, topStudent: 'Ananya Singh', performance: 'Needs Attention' },
];

const GENDER_DATA = [
    { name: 'Male', value: 8265, percentage: 58, color: 'hsl(var(--primary))' },
    { name: 'Female', value: 5700, percentage: 40, color: 'hsl(var(--success))' },
    { name: 'Other', value: 285, percentage: 2, color: 'hsl(var(--warning-surface))' },
];

// --- Staff Overview Specific Types & Data ---

interface AttendanceKPI {
    id: string;
    label: string;
    value: string;
    sub: string;
    icon: any;
    color: string;
    trend?: { value: string; isUp: boolean };
}

interface DeptAttendance {
    dept: string;
    studentsPresent: number;
    studentsTotal: number;
    studentsPercentage: number;
    staffPresent: number;
    staffTotal: number;
    staffPercentage: number;
    lateArrivals: number;
}

interface AttendanceTrend {
    day: string;
    student: number;
    staff: number;
}

interface LateComerStat {
    dept: string;
    count: number;
}

const ATTENDANCE_KPIS: AttendanceKPI[] = [
    { id: 'avg-daily', label: 'Avg Daily Attendance', value: '94.2%', sub: 'Last 30 academic days', icon: ClipboardCheck, color: 'text-amber-500', trend: { value: '+1.2% vs last month', isUp: true } },
    { id: 'staff-present', label: 'Faculty Present Today', value: '473/487', sub: '97.1% staff presence', icon: UserCheck, color: 'text-emerald-500' },
    { id: 'student-present', label: 'Students Present Today', value: '13,423', sub: '94.2% student presence', icon: Users, color: 'text-blue-500' },
    { id: 'on-time', label: 'On-Time Arrival Rate', value: '88.6%', sub: 'Within 10 mins of lecture start', icon: Clock, color: 'text-purple-500', trend: { value: '-2% vs last week', isUp: false } },
];

const DEPT_ATTENDANCE_DATA: DeptAttendance[] = [
    { dept: 'CS & Engg', studentsPresent: 3110, studentsTotal: 3240, studentsPercentage: 96.0, staffPresent: 92, staffTotal: 94, staffPercentage: 97.8, lateArrivals: 42 },
    { dept: 'ECE', studentsPresent: 2049, studentsTotal: 2180, studentsPercentage: 94.0, staffPresent: 76, staffTotal: 78, staffPercentage: 97.4, lateArrivals: 28 },
    { dept: 'Mechanical', studentsPresent: 1716, studentsTotal: 1950, studentsPercentage: 88.0, staffPresent: 68, staffTotal: 71, staffPercentage: 95.8, lateArrivals: 84 },
    { dept: 'Civil', studentsPresent: 1425, studentsTotal: 1620, studentsPercentage: 88.0, staffPresent: 62, staffTotal: 65, staffPercentage: 95.4, lateArrivals: 76 },
    { dept: 'MBA', studentsPresent: 1748, studentsTotal: 1840, studentsPercentage: 95.0, staffPresent: 80, staffTotal: 82, staffPercentage: 97.5, lateArrivals: 15 },
    { dept: 'MCA', studentsPresent: 1334, studentsTotal: 1420, studentsPercentage: 94.0, staffPresent: 56, staffTotal: 58, staffPercentage: 96.5, lateArrivals: 12 },
    { dept: 'Law', studentsPresent: 780, studentsTotal: 1000, studentsPercentage: 78.0, staffPresent: 34, staffTotal: 39, staffPercentage: 87.2, lateArrivals: 56 },
];

const ATTENDANCE_TREND_DATA: AttendanceTrend[] = [
    { day: 'Mon', student: 95.2, staff: 98.1 },
    { day: 'Tue', student: 94.8, staff: 97.8 },
    { day: 'Wed', student: 93.1, staff: 97.2 },
    { day: 'Thu', student: 94.2, staff: 97.5 },
    { day: 'Fri', student: 92.4, staff: 96.8 },
    { day: 'Sat', student: 88.6, staff: 92.4 },
];

const LATE_COMER_STATS_DATA: LateComerStat[] = [
    { dept: 'CS', count: 42 },
    { dept: 'ECE', count: 28 },
    { dept: 'ME', count: 84 },
    { dept: 'CE', count: 76 },
    { dept: 'MBA', count: 15 },
    { dept: 'MCA', count: 12 },
    { dept: 'Law', count: 56 },
];

const ATTENDANCE_ALERTS = [
    { id: 1, type: 'CRITICAL', title: 'Low Attendance — Law Dept', desc: 'Law student attendance dropped to 78% this week. Below 80% threshold.', time: 'Today' },
    { id: 2, type: 'WARNING', title: 'High Late Arrivals — ME Dept', desc: 'Mechanical department recorded 84 late arrivals today.', time: 'Today' },
    { id: 3, type: 'INFO', title: 'Staff Attendance Review', desc: 'Monthly staff attendance reports generated for all HODs.', time: 'Yesterday' },
];

// --- Staff Overview Specific Types & Data ---

interface StaffKPI {
    id: string;
    label: string;
    value: string;
    sub: string;
    icon: any;
    color: string;
    trend?: { value: string; isUp: boolean };
    badge?: { label: string; variant: 'success' | 'danger' | 'warning' };
}

interface FacultyWorkloadRow {
    id: string;
    name: string;
    empId: string;
    dept: string;
    designation: string;
    courses: number;
    hours: number;
    mentees: number;
    leaveBal: number;
    status: 'Active' | 'On Leave' | 'Part-time' | 'Probation';
}

const STAFF_KPIS: StaffKPI[] = [
    { id: 'faculty', label: 'Total Teaching Faculty', value: '487', sub: 'Across all 7 departments', icon: GraduationCap, color: 'text-amber-500', trend: { value: '23 new hires this year', isUp: true } },
    { id: 'non-teaching', label: 'Administrative & Support Staff', value: '312', sub: 'Labs, Library, Office, Security', icon: Users, color: 'text-blue-500', badge: { label: 'Stable', variant: 'success' } },
    { id: 'leave', label: 'On Leave Today', value: '14', sub: '8 faculty · 6 staff', icon: CalendarOff, color: 'text-amber-500', badge: { label: 'Normal', variant: 'success' } },
    { id: 'vacancies', label: 'Open Positions', value: '23', sub: '16 faculty · 7 staff roles', icon: UserX, color: 'text-red-500', trend: { value: 'Needs immediate hiring action', isUp: false } },
];

const FACULTY_DISTRIBUTION = [
    { name: 'Computer Science & Engg', shortName: 'CS & Engg', count: 94 },
    { name: 'Electronics & Comm Engg', shortName: 'ECE', count: 78 },
    { name: 'Mechanical Engineering', shortName: 'Mechanical', count: 71 },
    { name: 'Civil Engineering', shortName: 'Civil', count: 65 },
    { name: 'Master of Business Admin', shortName: 'MBA', count: 82 },
    { name: 'Master of Computer Apps', shortName: 'MCA', count: 58 },
    { name: 'Law', shortName: 'Law', count: 39 },
];

const STAFF_COMPOSITION = [
    { name: 'Teaching Faculty', value: 487, color: 'hsl(var(--warning-surface))', percentage: 61 },
    { name: 'Administrative Staff', value: 142, color: 'hsl(var(--info-surface))', percentage: 18 },
    { name: 'Lab Technicians', value: 68, color: 'hsl(var(--success))', percentage: 8 },
    { name: 'Library Staff', value: 24, color: 'hsl(var(--primary))', percentage: 3 },
    { name: 'Security & Maintenance', value: 78, color: 'hsl(var(--slate-500))', percentage: 10 },
];

const FACULTY_WORKLOAD: FacultyWorkloadRow[] = [
    { id: '1', name: 'Dr. Sarah Thompson', empId: 'EMP001', dept: 'CS & Engg', designation: 'Assoc. Prof', courses: 4, hours: 16, mentees: 18, leaveBal: 12, status: 'Active' },
    { id: '2', name: 'Prof. Rajesh Kumar', empId: 'EMP042', dept: 'ECE', designation: 'Professor', courses: 6, hours: 24, mentees: 22, leaveBal: 3, status: 'Active' },
    { id: '3', name: 'Dr. Meena Iyer', empId: 'EMP156', dept: 'MBA', designation: 'Asst. Prof', courses: 3, hours: 12, mentees: 15, leaveBal: 18, status: 'Active' },
    { id: '4', name: 'Mr. Arjun Pillai', empId: 'EMP302', dept: 'Mechanical', designation: 'Lecturer', courses: 5, hours: 20, mentees: 12, leaveBal: 8, status: 'Active' },
    { id: '5', name: 'Dr. Priya Nambiar', empId: 'EMP088', dept: 'CS & Engg', designation: 'Professor', courses: 4, hours: 16, mentees: 24, leaveBal: 10, status: 'On Leave' },
    { id: '6', name: 'Prof. Vikram Das', empId: 'EMP212', dept: 'Civil', designation: 'Assoc. Prof', courses: 6, hours: 22, mentees: 19, leaveBal: 2, status: 'Active' },
    { id: '7', name: 'Dr. Kavitha Menon', empId: 'EMP445', dept: 'MCA', designation: 'Asst. Prof', courses: 3, hours: 12, mentees: 10, leaveBal: 14, status: 'Active' },
    { id: '8', name: 'Mr. Suresh Babu', empId: 'EMP501', dept: 'Law', designation: 'Senior Lecturer', courses: 5, hours: 20, mentees: 8, leaveBal: 7, status: 'Active' },
    { id: '9', name: 'Dr. Anand Krishnan', empId: 'EMP112', dept: 'ECE', designation: 'Professor', courses: 7, hours: 26, mentees: 28, leaveBal: 1, status: 'Active' },
    { id: '10', name: 'Ms. Divya Sharma', empId: 'EMP228', dept: 'MBA', designation: 'Asst. Prof', courses: 2, hours: 8, mentees: 6, leaveBal: 20, status: 'Part-time' },
];

const ATTENDANCE_TRENDS = [
    { name: 'Week 1', value: 96.2 },
    { name: 'Week 2', value: 94.8 },
    { name: 'Week 3', value: 93.1 },
    { name: 'Week 4', value: 95.2 },
];

// --- Timetable Specific Types & Data ---

interface TimetableKPI {
    id: string;
    label: string;
    value: string;
    sub: string;
    icon: any;
    color: string;
    trend?: { value: string; isUp: boolean };
}

interface ScheduleEntry {
    id: string;
    subject: string;
    code: string;
    room: string;
    faculty?: string;
    type: 'lecture' | 'lab' | 'exam';
    start: string;
    end: string;
    day: string;
    period: number;
}

interface Conflict {
    id: string;
    type: 'Double Booking' | 'Faculty Overlap' | 'Capacity Issue';
    desc: string;
    depts: string[];
    period: string;
    day: string;
    status: 'Unresolved' | 'Resolved';
}

const TIMETABLE_KPIS: TimetableKPI[] = [
    { id: 'total-classes', label: 'Total Weekly Classes', value: '1,284', sub: 'Across 7 departments', icon: Layers, color: 'text-amber-500', trend: { value: '+24 vs last week', isUp: true } },
    { id: 'active-rooms', label: 'Active Classrooms', value: '68/72', sub: '94.4% room occupancy', icon: Building, color: 'text-emerald-500' },
    { id: 'faculty-util', label: 'Faculty Utilization', value: '84.2%', sub: 'Avg 16.5 hrs/week', icon: Activity, color: 'text-blue-500', trend: { value: 'Optimal range', isUp: true } },
    { id: 'conflicts', label: 'Schedule Conflicts', value: '7', sub: 'Unresolved issues detected', icon: AlertTriangle, color: 'text-red-500', trend: { value: '-3 from yesterday', isUp: false } },
];

const CLASS_SCHEDULE_MOCK: Record<string, ScheduleEntry[]> = {
    'CSE': [
        { id: '1', subject: 'Data Structures', code: 'CS301', room: '204', type: 'lecture', start: '09:00', end: '10:00', day: 'Mon', period: 1 },
        { id: '2', subject: 'Algorithms', code: 'CS302', room: '205', type: 'lecture', start: '10:00', end: '11:00', day: 'Mon', period: 2 },
        { id: '3', subject: 'Operating Systems', code: 'CS304', room: 'Lab 1', type: 'lab', start: '11:15', end: '01:15', day: 'Mon', period: 3 },
        { id: '4', subject: 'Database Mgmt', code: 'CS305', room: '204', type: 'lecture', start: '09:00', end: '10:00', day: 'Tue', period: 1 },
    ],
    'ECE': [
        { id: '101', subject: 'Digital Electronics', code: 'EC201', room: '102', type: 'lecture', start: '09:00', end: '10:00', day: 'Mon', period: 1 },
        { id: '102', subject: 'Signals & Systems', code: 'EC203', room: '103', type: 'lecture', start: '10:00', end: '11:00', day: 'Mon', period: 2 },
    ]
};

const EXAM_SCHEDULE_MOCK: ScheduleEntry[] = [
    { id: 'e1', subject: 'Computer Networks', code: 'CS401', room: 'Hall A', type: 'exam', start: '09:00', end: '12:00', day: 'Wed', period: 1, faculty: 'Dr. Ramesh' },
    { id: 'e2', subject: 'Marketing Mgmt', code: 'MB102', room: 'Hall B', type: 'exam', start: '02:00', end: '05:00', day: 'Wed', period: 4, faculty: 'Prof. Anita' },
];

const STAFF_SCHEDULE_MOCK: Record<string, ScheduleEntry[]> = {
    'Dr. Ramesh Iyer': [
        { id: 's1', subject: 'Computer Networks', code: 'CS401', room: '204', type: 'lecture', start: '09:00', end: '10:00', day: 'Mon', period: 1 },
        { id: 's2', subject: 'Net Security', code: 'CS405', room: 'Lab 2', type: 'lab', start: '11:15', end: '01:15', day: 'Tue', period: 3 },
    ]
};

const CLASSROOM_UTILIZATION = [
    { building: 'Block A', util: 92 },
    { building: 'Block B', util: 85 },
    { building: 'Block C', util: 78 },
    { building: 'Lab Wing', util: 94 },
    { building: 'MBA Block', util: 72 },
];

const FACULTY_LOAD_DIST = [
    { name: 'Normal', value: 340, fill: 'hsl(var(--success))' },
    { name: 'Overloaded', value: 85, fill: 'hsl(var(--danger-surface))' },
    { name: 'Under-utilized', value: 62, fill: 'hsl(var(--info-surface))' },
];

const TIMETABLE_ALERTS = [
    { id: 1, type: 'danger', title: 'Room Conflict', desc: 'Room 204 double-booked on Wednesday Period 4', time: 'Today' },
    { id: 2, type: 'warning', title: 'Faculty Overlap', desc: 'Dr. Sharma assigned to 2 parallel lectures on Friday', time: 'Today' },
];

const CONFLICTS_DATA: Conflict[] = [
    { id: 'c1', type: 'Double Booking', desc: 'CS301 and EC201 both assigned to Room 102', depts: ['CSE', 'ECE'], period: 'P1 (09:00)', day: 'Monday', status: 'Unresolved' },
    { id: 'c2', type: 'Faculty Overlap', desc: 'Dr. Ramesh assigned to Lecture and Exam Lab', depts: ['CSE'], period: 'P3 (11:15)', day: 'Tuesday', status: 'Unresolved' },
    { id: 'c3', type: 'Capacity Issue', desc: 'Class size (65) exceeds Room 302 capacity (50)', depts: ['ME'], period: 'P2 (10:00)', day: 'Monday', status: 'Resolved' },
];

// 6 days x 8 periods intensities
const HEATMAP_DATA = Array.from({ length: 48 }, (_, i) => ({
    day: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][Math.floor(i / 8)],
    period: (i % 8) + 1,
    intensity: Math.floor(Math.random() * 100),
}));

interface AcademicKPI {
    id: string;
    label: string;
    value: string;
    sub: string;
    icon: any;
    color: string;
    trend?: { value: string; isUp: boolean };
    badge?: { label: string; variant: 'success' | 'danger' | 'warning' };
}

interface DeptAcademicProfile {
    id: string;
    name: string;
    hod: string;
    courses: number;
    subjects: number;
    semesters: number;
    curriculumProgress: number;
    status: 'Up to Date' | 'Review Pending' | 'Outdated';
    naacGrade: 'A++' | 'A+' | 'A' | 'B+' | 'B';
    icon: any;
}

interface SemesterProgressRow {
    id: string;
    dept: string;
    deptSlug: string;
    semester: number;
    startDate: string;
    endDate: string;
    currentWeek: number;
    totalWeeks: number;
    completion: number;
    status: 'On Track' | 'Slightly Behind' | 'Behind Schedule' | 'Completed';
}

const ACADEMIC_KPIS: AcademicKPI[] = [
    { id: 'courses', label: 'Active Courses', value: '184', sub: 'Across all departments & semesters', icon: BookOpen, color: 'text-amber-500', badge: { label: 'Stable', variant: 'success' } },
    { id: 'depts', label: 'Academic Departments', value: '7', sub: 'UG · PG · Professional', icon: Building, color: 'text-blue-500', badge: { label: 'Accredited', variant: 'success' } },
    { id: 'semesters', label: 'Running Semesters', value: '14', sub: 'Odd semester · AY 2025–26', icon: CalendarDays, color: 'text-amber-500', badge: { label: 'On Schedule', variant: 'success' } },
    { id: 'subjects', label: 'Total Subjects', value: '312', sub: 'Core · Elective · Lab', icon: Layers, color: 'text-purple-500', trend: { value: '18 new subjects added', isUp: true } },
];

const DEPT_ACADEMIC_PROFILES: DeptAcademicProfile[] = [
    { id: '1', name: 'CS & Engg', hod: 'Dr. Ramesh Iyer', courses: 28, subjects: 84, semesters: 8, curriculumProgress: 96, status: 'Up to Date', naacGrade: 'A++', icon: Cpu },
    { id: '2', name: 'ECE', hod: 'Dr. Sunita Rao', courses: 24, subjects: 72, semesters: 8, curriculumProgress: 91, status: 'Up to Date', naacGrade: 'A+', icon: Zap },
    { id: '3', name: 'Mechanical Engg', hod: 'Prof. Kartik Menon', courses: 26, subjects: 78, semesters: 8, curriculumProgress: 83, status: 'Review Pending', naacGrade: 'A', icon: Settings },
    { id: '4', name: 'Civil Engg', hod: 'Dr. Leela Krishnan', courses: 22, subjects: 66, semesters: 8, curriculumProgress: 79, status: 'Review Pending', naacGrade: 'A', icon: Building },
    { id: '5', name: 'MBA', hod: 'Prof. Anita Desai', courses: 32, subjects: 64, semesters: 4, curriculumProgress: 94, status: 'Up to Date', naacGrade: 'A+', icon: Briefcase },
    { id: '6', name: 'MCA', hod: 'Dr. Vijay Sharma', courses: 24, subjects: 48, semesters: 6, curriculumProgress: 88, status: 'Up to Date', naacGrade: 'A', icon: Monitor },
    { id: '7', name: 'Law', hod: 'Prof. Deepak Pillai', courses: 28, subjects: 56, semesters: 6, curriculumProgress: 71, status: 'Outdated', naacGrade: 'B+', icon: Scale },
];

const SEMESTER_PROGRESS: SemesterProgressRow[] = [
    { id: '1', dept: 'CS & Engg', deptSlug: 'cs-engg', semester: 5, startDate: '2025-08-01', endDate: '2025-11-30', currentWeek: 14, totalWeeks: 16, completion: 88, status: 'On Track' },
    { id: '2', dept: 'CS & Engg', deptSlug: 'cs-engg', semester: 3, startDate: '2025-08-01', endDate: '2025-11-30', currentWeek: 14, totalWeeks: 16, completion: 85, status: 'On Track' },
    { id: '3', dept: 'ECE', deptSlug: 'ece', semester: 5, startDate: '2025-08-01', endDate: '2025-11-30', currentWeek: 13, totalWeeks: 16, completion: 81, status: 'On Track' },
    { id: '4', dept: 'Mechanical', deptSlug: 'mechanical', semester: 5, startDate: '2025-08-01', endDate: '2025-11-30', currentWeek: 12, totalWeeks: 16, completion: 72, status: 'Slightly Behind' },
    { id: '5', dept: 'Civil', deptSlug: 'civil', semester: 5, startDate: '2025-08-01', endDate: '2025-11-30', currentWeek: 11, totalWeeks: 16, completion: 67, status: 'Slightly Behind' },
    { id: '6', dept: 'MBA', deptSlug: 'mba', semester: 3, startDate: '2025-08-01', endDate: '2025-11-30', currentWeek: 14, totalWeeks: 16, completion: 89, status: 'On Track' },
    { id: '7', dept: 'MCA', deptSlug: 'mca', semester: 5, startDate: '2025-08-01', endDate: '2025-11-30', currentWeek: 10, totalWeeks: 16, completion: 61, status: 'Behind Schedule' },
    { id: '8', dept: 'Law', deptSlug: 'law', semester: 5, startDate: '2025-08-01', endDate: '2025-11-30', currentWeek: 9, totalWeeks: 16, completion: 54, status: 'Behind Schedule' },
    { id: '9', dept: 'ECE', deptSlug: 'ece', semester: 1, startDate: '2025-08-01', endDate: '2025-11-30', currentWeek: 14, totalWeeks: 16, completion: 86, status: 'On Track' },
];

const SUBJECT_DISTRIBUTION = [
    { name: 'CS & Engg', core: 48, elective: 24, lab: 12 },
    { name: 'ECE', core: 44, elective: 18, lab: 10 },
    { name: 'Mechanical', core: 46, elective: 20, lab: 12 },
    { name: 'Civil', core: 40, elective: 16, lab: 10 },
    { name: 'MBA', core: 38, elective: 22, lab: 4 },
    { name: 'MCA', core: 30, elective: 12, lab: 6 },
    { name: 'Law', core: 42, elective: 10, lab: 4 },
];

const CURRICULUM_HEALTH = [
    { name: 'CS & Engg', value: 96, fill: 'hsl(var(--success))' },
    { name: 'ECE', value: 91, fill: 'hsl(var(--success))' },
    { name: 'MBA', value: 94, fill: 'hsl(var(--success))' },
    { name: 'MCA', value: 88, fill: 'hsl(var(--warning-surface))' },
    { name: 'Mechanical', value: 83, fill: 'hsl(var(--warning-surface))' },
    { name: 'Civil', value: 79, fill: 'hsl(var(--warning-surface))' },
    { name: 'Law', value: 71, fill: 'hsl(var(--danger-surface))' },
];



// --- Components ---
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900 border border-white/10 p-3 rounded-lg shadow-xl text-sm">
                <p className="font-semibold text-white mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-white/80">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="capitalize">{entry.name}:</span>
                        <span className="font-medium text-white">
                            {entry.name === 'revenue' || entry.name === 'expenses' ? '$' : ''}{entry.value}{entry.name === 'revenue' || entry.name === 'expenses' ? 'k' : '%'}
                        </span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

const StudentOverviewContent = ({ loading }: { loading: boolean }) => {
    const shouldSkipAnimations = useReducedMotion();

    if (loading) {
        return (
            <div className="space-y-6">
                <Skeleton className="h-10 w-full rounded-lg bg-slate-200 dark:bg-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-xl bg-slate-200 dark:bg-white/5" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px] rounded-xl bg-slate-200 dark:bg-white/5" />
                    <Skeleton className="h-[400px] rounded-xl bg-slate-200 dark:bg-white/5" />
                </div>
                <Skeleton className="h-[500px] w-full rounded-xl bg-slate-200 dark:bg-white/5" />
            </div>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial={shouldSkipAnimations ? "visible" : "hidden"}
            animate="visible"
            className="space-y-6"
        >
            {/* Preview Banner */}
            <motion.div variants={fadeSlideUp} className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 flex items-center gap-3">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <span className="text-sm text-amber-700 dark:text-amber-500 italic">
                    Preview Mode — Showing representative institutional data. Connect backend endpoints for live figures.
                </span>
            </motion.div>

            {/* ROW 1 — KPI STAT CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {STUDENT_KPIS.map((kpi) => (
                    <motion.div key={kpi.id} variants={fadeSlideUp}>
                        <Card className="bg-[hsl(var(--surface-raised))] border-border border-l-4 border-l-amber-500 shadow-md rounded-xl p-6 transition-all hover:shadow-lg h-full group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                                </div>
                                {kpi.trend ? (
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {kpi.trend.value.split(' ')[0]}
                                    </div>
                                ) : (
                                    <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold">Healthy</Badge>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{kpi.value}</h3>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{kpi.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{kpi.sub}</p>
                                {kpi.trend && (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">{kpi.trend.value}</p>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ROW 2 — DEPARTMENT BREAKDOWN + ADMISSION TREND */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Enrollment Bar Chart */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-amber-500" />
                                    Department-wise Enrollment
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[320px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={ENROLLMENT_DATA} layout="vertical" margin={{ left: 20, right: 30 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="shortName"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            width={80}
                                            tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }}
                                        />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(255, 191, 0, 0.05)' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-[hsl(var(--surface-raised))] border-border shadow-md p-3 rounded-lg text-xs border">
                                                            <p className="font-bold text-slate-900 dark:text-white mb-1">{payload[0].payload.name}</p>
                                                            <p className="text-amber-600 dark:text-amber-400 font-medium">
                                                                {formatNumber(payload[0].value as number)} students
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="hsl(var(--warning-surface))"
                                            radius={[0, 4, 4, 0]}
                                            barSize={24}
                                        />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Admission Trend Line Chart */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                Admission Trend — 2025
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[320px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsLineChart data={ADMISSION_TRENDS}>
                                        <defs>
                                            <linearGradient id="admissionGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--warning-surface))" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="hsl(var(--warning-surface))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }} />
                                        <RechartsTooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-[hsl(var(--surface-raised))] border-border shadow-md p-3 rounded-lg text-xs border">
                                                            <p className="font-bold text-slate-900 dark:text-white mb-1">{label} 2025</p>
                                                            <p className="text-amber-600 dark:text-amber-400 font-medium">
                                                                {formatNumber(payload[0].value as number)} admissions
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area type="monotone" dataKey="count" fill="url(#admissionGradient)" stroke="none" />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="hsl(var(--warning-surface))"
                                            strokeWidth={3}
                                            dot={{ fill: 'hsl(var(--warning-surface))', r: 4, strokeWidth: 0 }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </RechartsLineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ROW 3 — ACADEMIC PERFORMANCE TABLE */}
            <motion.div variants={fadeSlideUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-base font-bold">Academic Performance by Department</CardTitle>
                        <span className="text-muted-foreground text-xs">Last Updated: Semester 5, 2025–26</span>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02]">
                                    <TableRow className="border-border">
                                        <TableHead className="font-bold text-xs">Department</TableHead>
                                        <TableHead className="text-right font-bold text-xs">Students</TableHead>
                                        <TableHead className="text-right font-bold text-xs">Avg CGPA</TableHead>
                                        <TableHead className="font-bold text-xs w-[180px]">Pass Rate</TableHead>
                                        <TableHead className="text-center font-bold text-xs">Backlogs</TableHead>
                                        <TableHead className="font-bold text-xs">Top Student</TableHead>
                                        <TableHead className="text-right font-bold text-xs">Performance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ACADEMIC_PERFORMANCE.map((row) => (
                                        <TableRow key={row.dept} className="border-border hover:bg-slate-50/50 dark:hover:bg-white/[0.01]" data-testid={`dept-row-${row.slug}`}>
                                            <TableCell className="font-semibold text-slate-900 dark:text-white">{row.dept}</TableCell>
                                            <TableCell className="text-right text-slate-600 dark:text-slate-400 font-mono text-xs">{formatNumber(row.students)}</TableCell>
                                            <TableCell className={`text-right font-bold ${row.cgpa >= 8.5 ? 'text-emerald-500' : row.cgpa >= 7.5 ? 'text-amber-500' : 'text-red-500'}`}>
                                                {row.cgpa.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1.5 pt-1">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span>{formatPercent(row.passRate, 0)}</span>
                                                    </div>
                                                    <Progress value={row.passRate} className={`h-1.5 ${row.passRate >= 90 ? '[&>div]:bg-emerald-500' : row.passRate >= 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'} bg-slate-100 dark:bg-white/5 transition-all`} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="secondary"
                                                    className={`
                                                        border-none px-2 py-0.5 text-[10px] font-bold
                                                        ${row.backlogs > 50 ? 'bg-red-500/10 text-red-600' : row.backlogs > 10 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}
                                                    `}
                                                >
                                                    {row.backlogs}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{row.topStudent}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    className={`
                                                        rounded-lg text-[10px] font-bold border-none
                                                        ${row.performance === 'Excellent' ? 'bg-emerald-500/10 text-emerald-600' : row.performance === 'Good' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}
                                                    `}
                                                >
                                                    {row.performance}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="bg-[hsl(var(--surface-sunken))] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm font-bold border-t border-border gap-4">
                            <span>Institution Average</span>
                            <div className="flex flex-wrap gap-4 sm:gap-8">
                                <span className="flex items-center gap-2">Students: <span className="font-mono text-amber-600 dark:text-amber-400">{formatNumber(14250)}</span></span>
                                <span className="flex items-center gap-2">Avg CGPA: <span className="text-emerald-500">8.24</span></span>
                                <span className="flex items-center gap-2">Pass Rate: <span className="text-emerald-500">90.4%</span></span>
                                <span className="flex items-center gap-2">Total Backlogs: <span className="text-amber-500 font-bold">328</span></span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>




            {/* ROW 2 — DEPARTMENT BREAKDOWN + ADMISSION TREND */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Department Enrollment Bar Chart */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <GraduationCap className="w-5 h-5 text-amber-500" />
                                    Department-wise Enrollment
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[320px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={ENROLLMENT_DATA} layout="vertical" margin={{ left: 20, right: 30 }}>
                                        <XAxis type="number" hide />
                                        <YAxis
                                            dataKey="shortName"
                                            type="category"
                                            axisLine={false}
                                            tickLine={false}
                                            width={80}
                                            tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }}
                                        />
                                        <RechartsTooltip
                                            cursor={{ fill: 'rgba(255, 191, 0, 0.05)' }}
                                            content={({ active, payload }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-[hsl(var(--surface-raised))] border-border shadow-md p-3 rounded-lg text-xs border">
                                                            <p className="font-bold text-slate-900 dark:text-white mb-1">{payload[0].payload.name}</p>
                                                            <p className="text-amber-600 dark:text-amber-400 font-medium">
                                                                {formatNumber(payload[0].value as number)} students
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Bar
                                            dataKey="count"
                                            fill="hsl(var(--warning-surface))"
                                            radius={[0, 4, 4, 0]}
                                            barSize={24}
                                        />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Admission Trend Line Chart */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                Admission Trend — 2025
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[320px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsLineChart data={ADMISSION_TRENDS}>
                                        <defs>
                                            <linearGradient id="admissionGradient" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--warning-surface))" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="hsl(var(--warning-surface))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }} />
                                        <RechartsTooltip
                                            content={({ active, payload, label }) => {
                                                if (active && payload && payload.length) {
                                                    return (
                                                        <div className="bg-[hsl(var(--surface-raised))] border-border shadow-md p-3 rounded-lg text-xs border">
                                                            <p className="font-bold text-slate-900 dark:text-white mb-1">{label} 2025</p>
                                                            <p className="text-amber-600 dark:text-amber-400 font-medium">
                                                                {formatNumber(payload[0].value as number)} admissions
                                                            </p>
                                                        </div>
                                                    );
                                                }
                                                return null;
                                            }}
                                        />
                                        <Area type="monotone" dataKey="count" fill="url(#admissionGradient)" stroke="none" />
                                        <Line
                                            type="monotone"
                                            dataKey="count"
                                            stroke="hsl(var(--warning-surface))"
                                            strokeWidth={3}
                                            dot={{ fill: 'hsl(var(--warning-surface))', r: 4, strokeWidth: 0 }}
                                            activeDot={{ r: 6, strokeWidth: 0 }}
                                        />
                                    </RechartsLineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ROW 3 — ACADEMIC PERFORMANCE TABLE */}
            <motion.div variants={fadeSlideUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <CardTitle className="text-base font-bold">Academic Performance by Department</CardTitle>
                        <span className="text-muted-foreground text-xs">Last Updated: Semester 5, 2025–26</span>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02]">
                                    <TableRow className="border-border">
                                        <TableHead className="font-bold text-xs">Department</TableHead>
                                        <TableHead className="text-right font-bold text-xs">Students</TableHead>
                                        <TableHead className="text-right font-bold text-xs">Avg CGPA</TableHead>
                                        <TableHead className="font-bold text-xs w-[180px]">Pass Rate</TableHead>
                                        <TableHead className="text-center font-bold text-xs">Backlogs</TableHead>
                                        <TableHead className="font-bold text-xs">Top Student</TableHead>
                                        <TableHead className="text-right font-bold text-xs">Performance</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {ACADEMIC_PERFORMANCE.map((row) => (
                                        <TableRow key={row.dept} className="border-border hover:bg-slate-50/50 dark:hover:bg-white/[0.01]" data-testid={`dept-row-${row.slug}`}>
                                            <TableCell className="font-semibold text-slate-900 dark:text-white">{row.dept}</TableCell>
                                            <TableCell className="text-right text-slate-600 dark:text-slate-400 font-mono text-xs">{formatNumber(row.students)}</TableCell>
                                            <TableCell className={`text-right font-bold ${row.cgpa >= 8.5 ? 'text-emerald-500' : row.cgpa >= 7.5 ? 'text-amber-500' : 'text-red-500'}`}>
                                                {row.cgpa.toFixed(2)}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1.5 pt-1">
                                                    <div className="flex justify-between text-[10px] font-bold">
                                                        <span>{formatPercent(row.passRate, 0)}</span>
                                                    </div>
                                                    <Progress value={row.passRate} className={`h-1.5 ${row.passRate >= 90 ? '[&>div]:bg-emerald-500' : row.passRate >= 80 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'} bg-slate-100 dark:bg-white/5 transition-all`} />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <Badge
                                                    variant="secondary"
                                                    className={`
                                                        border-none px-2 py-0.5 text-[10px] font-bold
                                                        ${row.backlogs > 50 ? 'bg-red-500/10 text-red-600' : row.backlogs > 10 ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}
                                                    `}
                                                >
                                                    {row.backlogs}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-xs text-muted-foreground">{row.topStudent}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge
                                                    className={`
                                                        rounded-lg text-[10px] font-bold border-none
                                                        ${row.performance === 'Excellent' ? 'bg-emerald-500/10 text-emerald-600' : row.performance === 'Good' ? 'bg-amber-500/10 text-amber-600' : 'bg-red-500/10 text-red-600'}
                                                    `}
                                                >
                                                    {row.performance}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="bg-[hsl(var(--surface-sunken))] p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center text-sm font-bold border-t border-border gap-4">
                            <span>Institution Average</span>
                            <div className="flex flex-wrap gap-4 sm:gap-8">
                                <span className="flex items-center gap-2">Students: <span className="font-mono text-amber-600 dark:text-amber-400">{formatNumber(14250)}</span></span>
                                <span className="flex items-center gap-2">Avg CGPA: <span className="text-emerald-500">8.24</span></span>
                                <span className="flex items-center gap-2">Pass Rate: <span className="text-emerald-500">90.4%</span></span>
                                <span className="flex items-center gap-2">Total Backlogs: <span className="text-amber-500 font-bold">328</span></span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ROW 4 — ATTENDANCE SNAPSHOT + GENDER DISTRIBUTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: Attendance Snapshot */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-amber-500" />
                                Attendance Snapshot — Current Semester
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <div className="space-y-3">
                                {[
                                    { label: 'Overall Institution Avg', value: 82.4, status: 'Good', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                    { label: 'Highest — CS & Engg', value: 91.2, status: 'Excellent', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'Lowest — Law', value: 71.8, status: 'At Risk', color: 'text-red-500', bg: 'bg-red-500/10', pulse: true }
                                ].map((stat, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-white/[0.02] p-3 rounded-lg border border-border">
                                        <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{stat.label}</span>
                                        <div className="flex items-center gap-3">
                                            <span className="text-base font-bold">{formatAttendance(stat.value)}</span>
                                            <Badge className={`${stat.bg} ${stat.color} border-none text-[10px] font-bold flex items-center gap-1.5`}>
                                                {stat.pulse && <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden="true" />}
                                                {stat.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-border w-full" />


                            <div className="space-y-4">
                                {ENROLLMENT_DATA.map((dept) => {
                                    // Mock attendance data matching text
                                    const att = dept.shortName === 'CS & Engg' ? 91.2 : dept.shortName === 'Law' ? 71.8 : 80 + Math.random() * 10;
                                    return (
                                        <div key={dept.shortName} className="space-y-1.5">
                                            <div className="flex justify-between text-[11px] font-bold text-slate-500">
                                                <span>{dept.shortName}</span>
                                                <span>{formatAttendance(att)}</span>
                                            </div>
                                            <Progress
                                                value={att}
                                                className={`h-1.5 ${att >= 85 ? '[&>div]:bg-emerald-500' : att >= 75 ? '[&>div]:bg-amber-500' : '[&>div]:bg-red-500'} bg-slate-100 dark:bg-white/5`}
                                            />
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mt-auto">
                                <div className="flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500 shrink-0" />
                                    <div className="space-y-3">
                                        <p className="text-xs font-bold text-red-700 dark:text-red-400 leading-relaxed">
                                            1,240 students are below 75% attendance threshold and are at risk of detention.
                                        </p>
                                        <Tooltip content="Backend endpoint pending">
                                            <Button variant="link" className="p-0 h-auto text-xs font-bold text-red-600 dark:text-red-400 underline decoration-2 cursor-not-allowed opacity-70">
                                                View At-Risk Students →
                                            </Button>
                                        </Tooltip>
                                    </div>

                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Card: Student Demographics */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-500" />
                                Student Demographics
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-8 flex flex-col justify-center">
                            <div className="relative h-[200px] flex items-center justify-center">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={GENDER_DATA}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {GENDER_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-bold text-slate-900 dark:text-white">14,250</span>
                                    <span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Students</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-3 max-w-[280px] mx-auto w-full">
                                {GENDER_DATA.map((item) => (
                                    <div key={item.name} className="flex items-center justify-between group">
                                        <div className="flex items-center gap-3">
                                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                                            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className="text-xs font-mono text-slate-500">{formatNumber(item.value)}</span>
                                            <span className="text-xs font-bold text-slate-900 dark:text-white w-8 text-right">{item.percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-border w-full" />


                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-border flex flex-col gap-2">
                                    <Users className="w-5 h-5 text-blue-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Day Scholars</p>
                                        <p className="text-lg font-bold">9,100 <span className="text-[10px] text-emerald-500">(64%)</span></p>
                                    </div>
                                </div>
                                <div className="p-4 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-border flex flex-col gap-2">
                                    <Home className="w-5 h-5 text-purple-500" />
                                    <div>
                                        <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">Hostellers</p>
                                        <p className="text-lg font-bold">5,150 <span className="text-[10px] text-emerald-500">(36%)</span></p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ROW 5 — QUICK ACTIONS + RECENT ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* Left Card: Quick Actions */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-amber-500" />
                                Institutional Quick Actions
                            </CardTitle>
                            <CardDescription className="text-xs font-medium">Common administrative workflows</CardDescription>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'Bulk Admission Export', icon: Download, sub: 'PDF/Excel Format', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                    { label: 'Attendance Audit', icon: ClipboardCheck, sub: 'Run institution-wide check', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                    { label: 'Academic Performance', icon: BarChart3, sub: 'Generate Dept wise reports', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                    { label: 'Verify Documents', icon: UserCheck, sub: 'Pending verifications: 14', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                ].map((action, i) => (
                                    <Button
                                        key={i}
                                        variant="outline"
                                        className="h-auto p-4 justify-start text-left border-border bg-slate-50 dark:bg-white/[0.02] hover:bg-amber-500/5 hover:border-amber-500/30 transition-all rounded-xl group"
                                    >
                                        <div className={`p-2.5 rounded-xl ${action.bg} ${action.color} mr-4 group-hover:scale-110 transition-transform`}>
                                            <action.icon className="w-5 h-5" />
                                        </div>
                                        <div className="space-y-0.5">
                                            <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{action.label}</span>
                                            <p className="text-[10px] text-muted-foreground font-medium">{action.sub}</p>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Card: Recent Student Alerts */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <Bell className="w-5 h-5 text-amber-500" />
                                    Recent Critical Alerts
                                </CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            {[
                                { id: 1, type: 'attendance', title: 'Critical Attendance Drop', desc: 'Mechanical Engineering (Batch 2023) average fell to 68%.', date: '2h ago', level: 'high' },
                                { id: 2, type: 'academic', title: 'Top Performer Identified', desc: 'Arjun Mehta (CS) scored 10/10 CGPA in Semester 5 finals.', date: '5h ago', level: 'success' },
                                { id: 3, type: 'grievance', title: 'New Mass Grievance', desc: 'Electronics Dept reported issues with lab equipment availability.', date: '1d ago', level: 'medium' },
                                { id: 4, type: 'admission', title: 'Target Reached', desc: 'Admission targets for MBA 2025–26 have been successfully fulfilled.', date: '2d ago', level: 'info' },
                            ].map((alert) => (
                                <div key={alert.id} className="flex gap-4 p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <div className={`
                                        w-1 h-auto rounded-full shrink-0
                                        ${alert.level === 'high' ? 'bg-red-500' : alert.level === 'success' ? 'bg-emerald-500' : alert.level === 'medium' ? 'bg-amber-500' : 'bg-blue-500'}
                                    `} aria-hidden="true" />
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">
                                                {alert.title}
                                            </h4>
                                            <span className="text-[10px] font-medium text-muted-foreground bg-slate-100 dark:bg-white/5 px-1.5 py-0.5 rounded">
                                                {alert.date}
                                            </span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            {alert.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-xs font-bold text-amber-600 hover:text-amber-700 hover:bg-amber-500/5">
                                View Full Activity Log
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};


// --- Staff Overview Content ---

const StaffOverviewContent = ({ loading }: { loading: boolean }) => {
    if (loading) {
        return (
            <div className="space-y-6 pt-4">
                {/* Row 1 Skels */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl bg-slate-200 dark:bg-white/5" />
                    ))}
                </div>
                {/* Row 2 Skels */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px] w-full rounded-xl bg-slate-200 dark:bg-white/5" />
                    <Skeleton className="h-[400px] w-full rounded-xl bg-slate-200 dark:bg-white/5" />
                </div>
                {/* Row 3 Skel */}
                <Skeleton className="h-[600px] w-full rounded-xl bg-slate-200 dark:bg-white/5" />
            </div>
        );
    }

    const overloadedFaculty = FACULTY_WORKLOAD.filter(f => f.courses >= 5 || f.hours > 20);
    const underUtilizedFaculty = FACULTY_WORKLOAD.filter(f => f.courses <= 2 || f.hours < 10);

    const FacultyTable = ({ rows }: { rows: FacultyWorkloadRow[] }) => (
        <div className="overflow-x-auto custom-scrollbar">
            <Table>
                <TableHeader>
                    <TableRow className="bg-slate-50 dark:bg-white/[0.02]">
                        <TableHead className="font-bold">Faculty Member</TableHead>
                        <TableHead className="font-bold">Department</TableHead>
                        <TableHead className="font-bold">Designation</TableHead>
                        <TableHead className="font-bold">Courses</TableHead>
                        <TableHead className="font-bold">Weekly Hrs</TableHead>
                        <TableHead className="font-bold">Mentees</TableHead>
                        <TableHead className="font-bold">Leave Bal</TableHead>
                        <TableHead className="font-bold text-right">Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {rows.map((faculty, i) => (
                        <TableRow key={faculty.id} data-testid={`faculty-row-${i}`} className="hover:bg-amber-500/5 transition-colors group">
                            <TableCell>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-2 border-slate-100 dark:border-white/5 group-hover:border-amber-500/30 transition-colors">
                                        <AvatarFallback className="bg-amber-500/10 text-amber-600 font-bold text-xs">
                                            {faculty.name.split(' ').map(n => n[0]).join('')}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900 dark:text-white leading-none mb-1 group-hover:text-amber-600 dark:group-hover:text-amber-500 transition-colors">{faculty.name}</p>
                                        <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">{faculty.empId}</p>
                                    </div>
                                </div>
                            </TableCell>
                            <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-400">{faculty.dept}</TableCell>
                            <TableCell className="text-xs font-medium text-slate-500">{faculty.designation}</TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`text-xs font-black ${faculty.courses >= 5 ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 'bg-slate-50 dark:bg-white/5 border-none'}`}>
                                    {faculty.courses}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`text-xs font-black ${faculty.hours > 20 ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20'}`}>
                                    {faculty.hours}h
                                </Badge>
                            </TableCell>
                            <TableCell className="text-xs font-bold tabular-nums">{faculty.mentees}</TableCell>
                            <TableCell>
                                <span className={`text-xs font-black ${faculty.leaveBal < 5 ? 'text-red-500' : 'text-emerald-500'}`}>
                                    {faculty.leaveBal}d
                                </span>
                            </TableCell>
                            <TableCell className="text-right">
                                <Badge className={`font-bold text-[10px] uppercase tracking-tighter ${faculty.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600' : faculty.status === 'On Leave' ? 'bg-amber-500/10 text-amber-600' : faculty.status === 'Part-time' ? 'bg-blue-500/10 text-blue-600' : 'bg-red-500/10 text-red-600'}`}>
                                    {faculty.status}
                                </Badge>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableBody>
                    <TableRow className="bg-slate-50 dark:bg-white/[0.02] border-t-2 border-border">
                        <TableCell colSpan={3} className="text-xs font-black uppercase tracking-wider text-slate-500">Department Average</TableCell>
                        <TableCell className="text-xs font-black">4.5</TableCell>
                        <TableCell className="text-xs font-black">17.6h</TableCell>
                        <TableCell className="text-xs font-black">16.2</TableCell>
                        <TableCell className="text-xs font-black text-emerald-600">9.5d</TableCell>
                        <TableCell />
                    </TableRow>
                </TableBody>
            </Table>
        </div>
    );
    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 pt-4"
        >
            {/* PREVIEW BANNER */}
            <motion.div
                variants={fadeSlideUp}
                className="bg-warning-surface/10 border border-warning-surface/30 rounded-lg px-4 py-2 flex items-center gap-2"
            >
                <Info className="w-4 h-4 text-amber-500" />
                <span className="text-sm text-amber-600 dark:text-amber-400 italic font-medium">
                    Preview Mode — Showing representative institutional data. Connect backend endpoints for live figures.
                </span>
            </motion.div>

            {/* ROW 1 — STAFF KPI STAT CARDS */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {STAFF_KPIS.map((kpi) => (
                    <motion.div key={kpi.id} variants={fadeSlideUp}>
                        <Card className={`bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden h-full flex flex-col p-6 border-l-4 ${kpi.id === 'vacancies' ? 'border-l-red-500' : 'border-l-amber-500'}`}>
                            <div className="flex justify-between items-start mb-2">
                                <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 ${kpi.color}`}>
                                    <kpi.icon className="w-5 h-5 font-bold" />
                                </div>
                                {kpi.trend && (
                                    <div className={`flex items-center gap-0.5 text-[10px] font-bold ${kpi.trend.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {kpi.trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        <span className="text-[9px] uppercase tracking-tighter tabular-nums">Trend Available</span>
                                    </div>
                                )}
                                {kpi.badge && (
                                    <Badge variant="outline" className={`text-[10px] font-bold ${kpi.badge.variant === 'success' ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20' : 'bg-red-500/10 text-red-600 border-red-500/20'}`}>
                                        {kpi.badge.label}
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{formatNumber(parseInt(kpi.value))}</h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest leading-none">{kpi.label}</p>
                                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 leading-tight">{kpi.sub}</p>
                                {kpi.trend && (
                                    <p className={`text-[10px] font-bold mt-2 ${kpi.trend.isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                        {kpi.trend.value}
                                    </p>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ROW 2 — FACULTY DISTRIBUTION CHARTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: Department-wise Faculty Count */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-amber-500" />
                                Faculty Distribution by Department
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 min-h-[300px]">
                            <ResponsiveContainer width="100%" height={300}>
                                <RechartsBarChart
                                    data={FACULTY_DISTRIBUTION}
                                    layout="vertical"
                                    margin={{ left: 20, right: 20 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis type="number" hide />
                                    <YAxis
                                        dataKey="shortName"
                                        type="category"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }}
                                        width={100}
                                    />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Bar
                                        dataKey="count"
                                        fill="hsl(var(--warning-surface))"
                                        radius={[0, 4, 4, 0]}
                                        barSize={24}
                                    />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Card: Staff Type Breakdown */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <PieChartIcon className="w-5 h-5 text-amber-500" />
                                Staff Composition
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center">
                            <div className="relative w-full h-[220px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={STAFF_COMPOSITION}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={55}
                                            outerRadius={85}
                                            paddingAngle={4}
                                            dataKey="value"
                                        >
                                            {STAFF_COMPOSITION.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                                            ))}
                                        </Pie>
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white leading-none">799</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tighter">Total Staff</span>
                                </div>
                            </div>

                            {/* Custom Legend */}
                            <div className="w-full mt-4 space-y-2 px-2">
                                {STAFF_COMPOSITION.map((item, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs group">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-2.5 h-2.5 rounded-full shrink-0 group-hover:scale-125 transition-transform" style={{ backgroundColor: item.color }} />
                                            <span className="font-bold text-slate-700 dark:text-slate-300">{item.name}</span>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-900 dark:text-white tabular-nums">{item.value}</span>
                                            <span className="text-[10px] font-bold text-slate-400 tabular-nums w-8 text-right bg-slate-100 dark:bg-white/5 px-1 py-0.5 rounded">{item.percentage}%</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full mt-6 pt-6 border-t border-border grid grid-cols-2 gap-4">
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-border group hover:border-amber-500/30 transition-colors">
                                    <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 group-hover:scale-110 transition-transform">
                                        <GraduationCap className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">PhD Holders</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">186</span>
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] px-1 h-auto font-bold">Strength</Badge>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-border group hover:border-amber-500/30 transition-colors">
                                    <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:scale-110 transition-transform">
                                        <Briefcase className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">Industry Experts</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black text-slate-900 dark:text-white">94</span>
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] px-1 h-auto font-bold">Strength</Badge>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ROW 3 — FACULTY WORKLOAD TABLE */}
            <motion.div variants={fadeSlideUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7">
                        <div>
                            <CardTitle className="text-lg font-bold">Faculty Workload Overview</CardTitle>
                            <CardDescription className="text-xs font-medium">Monitoring academic commitments & utilization</CardDescription>
                        </div>
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] mb-1 leading-none">Current Semester</p>
                            <p className="text-sm font-black text-slate-900 dark:text-white leading-none">AY 2025–26</p>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="bg-slate-100 dark:bg-white/5 p-1 rounded-xl mb-6 flex-wrap h-auto">
                                <TabsTrigger value="all" className="rounded-lg font-bold text-xs uppercase tracking-tight py-2 px-4">All Faculty</TabsTrigger>
                                <TabsTrigger value="overloaded" className="rounded-lg font-bold text-xs uppercase tracking-tight py-2 px-4 focus:ring-red-500/30">Overloaded</TabsTrigger>
                                <TabsTrigger value="underutilized" className="rounded-lg font-bold text-xs uppercase tracking-tight py-2 px-4 focus:ring-blue-500/30">Under-utilized</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all">
                                <FacultyTable rows={FACULTY_WORKLOAD} />
                            </TabsContent>

                            <TabsContent value="overloaded" className="space-y-4 animate-in fade-in-50 duration-300">
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-xs font-bold text-red-700 dark:text-red-400">
                                        3 faculty members are overloaded (≥5 courses or {'>'}20 hrs). This may impact teaching quality and faculty wellbeing. Consider redistributing course assignments.
                                    </p>
                                </div>
                                <FacultyTable rows={overloadedFaculty} />
                            </TabsContent>

                            <TabsContent value="underutilized" className="space-y-4 animate-in fade-in-50 duration-300">
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex gap-3">
                                    <Info className="w-5 h-5 text-blue-500 shrink-0" />
                                    <p className="text-xs font-bold text-blue-700 dark:text-blue-400">
                                        1 faculty member appears under-utilized (≤2 courses or {'<'}10 hrs). Review their assignment status or consider additional course allocation.
                                    </p>
                                </div>
                                <FacultyTable rows={underUtilizedFaculty} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ROW 4 — LEAVE SUMMARY + ATTENDANCE */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Left Card: Leave Summary */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <CalendarDays className="w-5 h-5 text-amber-500" />
                                Leave Summary — Current Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-6">
                            <div className="space-y-3">
                                {[
                                    { label: 'Pending Requests', value: 7, badge: 'Needs Action', variant: 'warning' },
                                    { label: 'Approved This Month', value: 23, badge: 'Processed', variant: 'success' },
                                    { label: 'Rejected', value: 4, variant: 'danger' },
                                ].map((stat, i) => (
                                    <div key={i} className="flex justify-between items-center bg-slate-50 dark:bg-white/[0.02] p-3 rounded-xl border border-border/50">
                                        <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-sm font-black tabular-nums">{stat.value}</span>
                                            {stat.badge && (
                                                <Badge className={`text-[9px] font-black uppercase tracking-tighter ${stat.variant === 'warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                                    {stat.badge}
                                                </Badge>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="h-px bg-border w-full" />

                            <div className="space-y-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground">Recent Leave Requests</p>
                                {[
                                    { name: 'Dr. Anand Krishnan', dept: 'ECE', type: 'Medical Leave', days: '3 days', status: 'Pending', variant: 'warning' },
                                    { name: 'Prof. Rajesh Kumar', dept: 'ECE', type: 'Personal Leave', days: '1 day', status: 'Approved', variant: 'success' },
                                    { name: 'Dr. Priya Nambiar', dept: 'CS', type: 'Maternity', days: '90 days', status: 'Approved', variant: 'success' },
                                    { name: 'Mr. Suresh Babu', dept: 'Law', type: 'Casual Leave', days: '2 days', status: 'Pending', variant: 'warning' },
                                    { name: 'Dr. Meena Iyer', dept: 'MBA', type: 'Conference', days: '4 days', status: 'Approved', variant: 'success' },
                                ].map((req, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs group">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarFallback className="text-[10px] font-bold bg-slate-100 text-slate-600">
                                                    {req.name.split(' ').map(n => n[0]).join('')}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-amber-500 transition-colors">{req.name}</p>
                                                <p className="text-[9px] font-medium text-muted-foreground uppercase">{req.dept} · {req.type}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-slate-400 text-[10px] tabular-nums">{req.days}</span>
                                            <Badge className={`text-[9px] font-black uppercase tracking-tighter ${req.variant === 'warning' ? 'bg-amber-500/10 text-amber-600' : 'bg-emerald-500/10 text-emerald-600'}`}>
                                                {req.status}
                                            </Badge>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <Tooltip content="Backend endpoint pending">
                                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 hover:bg-amber-500/5 cursor-not-allowed opacity-70 min-h-[44px]">
                                    View All Leave Requests →
                                </Button>
                            </Tooltip>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Card: Staff Attendance */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <ClipboardCheck className="w-5 h-5 text-amber-500" />
                                Staff Attendance — This Month
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-8 flex flex-col items-center pt-8">
                            <div className="text-center space-y-1">
                                <h3 className="text-5xl font-black text-emerald-500 tracking-tighter tabular-nums">94.8%</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none">Overall Faculty Attendance</p>
                            </div>

                            <div className="w-full min-h-[220px]">
                                <ResponsiveContainer width="100%" height={220}>
                                    <RechartsBarChart data={ATTENDANCE_TRENDS} margin={{ top: 20 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis
                                            dataKey="name"
                                            axisLine={false}
                                            tickLine={false}
                                            tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }}
                                        />
                                        <YAxis domain={[80, 100]} hide />
                                        <RechartsTooltip cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }} content={<CustomTooltip />} />
                                        <Bar
                                            dataKey="value"
                                            fill="hsl(var(--warning-surface))"
                                            radius={[4, 4, 0, 0]}
                                            barSize={32}
                                        />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="w-full grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Present Today', val: 472, dot: 'bg-emerald-500' },
                                    { label: 'On Leave', val: 14, dot: 'bg-amber-500' },
                                    { label: 'Absent', val: 1, dot: 'bg-red-500' },
                                ].map((dot, i) => (
                                    <div key={i} className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-border/50">
                                        <div className="flex items-center gap-1.5 mb-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${dot.dot} animate-pulse`} />
                                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-tight">{dot.label}</span>
                                        </div>
                                        <span className="text-sm font-black tabular-nums">{dot.val}</span>
                                    </div>
                                ))}
                            </div>

                            <div className="w-full p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <AlertTriangle className="w-4 h-4 text-red-500" />
                                    <span className="text-[10px] font-bold text-red-700 dark:text-red-400 uppercase tracking-tight">Attendance Threshold</span>
                                </div>
                                <span className="text-xs font-black text-red-600">90%</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ROW 5 — QUICK ACTIONS + STAFF ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* Left Card: Quick Actions */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-amber-500" />
                                Quick Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'View Faculty Reports', icon: FileText },
                                    { label: 'Export Staff Directory', icon: Download },
                                    { label: 'Initiate Hiring Process', icon: UserPlus },
                                    { label: 'Manage Leave Calendar', icon: Calendar },
                                    { label: 'Performance Appraisals', icon: Award },
                                    { label: 'Workload Analysis', icon: BarChart3 },
                                ].map((action, i) => (
                                    <Tooltip key={i} content="Backend endpoint pending">
                                        <Button
                                            variant="outline"
                                            className="h-auto p-4 justify-start text-left border-border bg-slate-50 dark:bg-white/[0.02] hover:bg-amber-500/5 hover:border-primary transition-all rounded-xl group min-h-[44px] cursor-not-allowed opacity-70"
                                            disabled
                                        >
                                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 mr-4 group-hover:scale-110 transition-transform">
                                                <action.icon className="w-5 h-5" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">{action.label}</span>
                                        </Button>
                                    </Tooltip>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Right Card: Staff Alerts */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Bell className="w-5 h-5 text-amber-500" />
                                Staff Alerts
                            </CardTitle>
                            <Badge className="bg-red-500 text-white border-none font-bold text-[10px] px-2">3</Badge>
                        </CardHeader>
                        <CardContent className="flex-1 space-y-4">
                            {[
                                { level: 'CRITICAL', label: '🔴 CRITICAL', title: 'Vacancy Crisis', desc: '23 open positions unfilled — academic delivery at risk', date: 'Today, 08:00 AM', color: 'bg-red-500' },
                                { level: 'CRITICAL', label: '🔴 CRITICAL', title: 'Overloaded Faculty', desc: '3 faculty members exceeding 20 weekly teaching hours', date: 'Today, 09:30 AM', color: 'bg-red-500' },
                                { level: 'WARNING', label: '🟡 WARNING', title: 'Low Leave Balance', desc: 'Dr. Anand Krishnan has only 1 leave day remaining', date: 'Yesterday, 05:00 PM', color: 'bg-amber-500' },
                                { level: 'INFO', label: '🔵 INFO', title: 'Performance Review Due', desc: 'Annual appraisal cycle opens 15 March 2026', date: '3 days ago', color: 'bg-blue-500' },
                            ].map((alert, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl border border-border bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <div className="shrink-0 flex flex-col items-center gap-1">
                                        <div className={`w-2 h-2 rounded-full ${alert.color} animate-pulse`} />
                                        <span className="text-[8px] font-black uppercase text-slate-400">{alert.level}</span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">
                                                {alert.title}
                                            </h4>
                                            <Button disabled variant="link" className="h-auto p-0 text-[10px] font-bold text-amber-600 cursor-not-allowed opacity-50">View</Button>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-medium">
                                            {alert.desc}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground pt-1">{alert.date}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};


// --- Academic Overview Content ---

const AcademicContent = ({ loading }: { loading: boolean }) => {
    const shouldSkipAnimations = useReducedMotion();

    if (loading) {
        return (
            <div className="space-y-6 pt-4">
                <Skeleton className="h-10 w-full rounded-lg bg-slate-200 dark:bg-white/5" />
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-40 rounded-xl bg-slate-200 dark:bg-white/5 shadow-md" />)}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3, 4, 5, 6, 7].map(i => <Skeleton key={i} className="h-64 rounded-xl bg-slate-200 dark:bg-white/5 shadow-md" />)}
                </div>
                <Skeleton className="h-[500px] w-full rounded-xl bg-slate-200 dark:bg-white/5 shadow-md" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px] rounded-xl bg-slate-200 dark:bg-white/5 shadow-md" />
                    <Skeleton className="h-[400px] rounded-xl bg-slate-200 dark:bg-white/5 shadow-md" />
                </div>
            </div>
        );
    }

    // Filtered data for Semester Progress Table
    const onTrackSemesters = SEMESTER_PROGRESS.filter(s => s.status === 'On Track');
    const behindSemesters = SEMESTER_PROGRESS.filter(s => s.status === 'Behind Schedule');

    return (
        <motion.div
            variants={staggerContainer}
            initial={shouldSkipAnimations ? "visible" : "hidden"}
            animate="visible"
            className="space-y-6 pt-4"
        >
            {/* Preview Banner */}
            <motion.div variants={fadeSlideUp} className="bg-amber-500/10 border border-amber-500/30 rounded-lg px-4 py-2 flex items-center gap-3">
                <Info className="w-4 h-4 text-amber-600 dark:text-amber-500" />
                <span className="text-sm text-amber-700 dark:text-amber-500 italic">
                    Preview Mode — Showing representative institutional data. Connect backend endpoints for live figures.
                </span>
            </motion.div>

            {/* ROW 1 — Academic KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ACADEMIC_KPIS.map((kpi) => (
                    <motion.div key={kpi.id} variants={fadeSlideUp}>
                        <Card className="bg-[hsl(var(--surface-raised))] border-border border-l-4 border-l-amber-500 shadow-md rounded-xl p-6 transition-all hover:shadow-lg h-full group">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 group-hover:bg-amber-500/10 transition-colors`}>
                                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                                </div>
                                {kpi.badge && (
                                    <Badge className={`bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold`}>{kpi.badge.label}</Badge>
                                )}
                                {kpi.trend && (
                                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
                                        <ArrowUpRight className="w-3 h-3" />
                                        {kpi.trend.value.split(' ')[0]}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{kpi.value}</h3>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{kpi.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{kpi.sub}</p>
                                {kpi.trend && (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">{kpi.trend.value}</p>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ROW 2 — DEPARTMENT CARDS GRID */}
            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <h2 className="text-lg font-bold">Department Academic Profiles</h2>
                    <p className="text-sm text-muted-foreground">Courses, subjects, HOD, and curriculum status per department</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {DEPT_ACADEMIC_PROFILES.map((dept) => (
                        <motion.div key={dept.id} variants={fadeSlideUp}>
                            <Card className={`bg-[hsl(var(--surface-raised))] border-border border-l-4 ${dept.id === '7' ? 'border-l-red-500' : 'border-l-amber-500'} shadow-md rounded-xl p-5 hover:shadow-lg transition-all h-full`}>
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600">
                                            <dept.icon className="w-5 h-5 font-bold" />
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-tight">{dept.name}</h4>
                                            <p className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">HOD: {dept.hod}</p>
                                        </div>
                                    </div>
                                    <Badge className={`${dept.status === 'Up to Date' ? 'bg-emerald-500/10 text-emerald-600' :
                                            dept.status === 'Review Pending' ? 'bg-amber-500/10 text-amber-600' :
                                                'bg-red-500/10 text-red-600'
                                        } border-none text-[9px] font-black uppercase tracking-tight`}>
                                        {dept.status}
                                    </Badge>
                                </div>
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-2 text-[11px] font-bold text-slate-600 dark:text-slate-400">
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-900 dark:text-slate-200">{dept.courses}</span> courses
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <span className="text-slate-900 dark:text-slate-200">{dept.subjects}</span> subjects
                                        </div>
                                        <div className="flex items-center gap-2 col-span-2">
                                            <span className="text-slate-900 dark:text-slate-200">{dept.semesters}</span> active semesters
                                        </div>
                                    </div>
                                    <div className="h-px bg-border w-full opacity-50" />
                                    <div className="space-y-2">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                            <span>Curriculum</span>
                                            <span>{dept.curriculumProgress}%</span>
                                        </div>
                                        <Progress
                                            value={dept.curriculumProgress}
                                            className="h-1.5"
                                        />
                                    </div>
                                    <div className="flex justify-between items-center pt-1">
                                        <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">NAAC Grade</span>
                                        <Badge className={`font-black text-[10px] border-none ${dept.naacGrade.startsWith('A') ? 'bg-emerald-500/10 text-emerald-600' :
                                                'bg-amber-500/10 text-amber-600'
                                            }`}>
                                            {dept.naacGrade}
                                        </Badge>
                                    </div>
                                </div>
                            </Card>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* ROW 3 — SEMESTER PROGRESS TABLE */}
            <motion.div variants={fadeSlideUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-7 border-b border-border/50">
                        <div className="space-y-1">
                            <CardTitle className="text-lg font-bold">Active Semester Progress</CardTitle>
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">AY 2025–26 · Odd Semester</p>
                        </div>
                    </CardHeader>
                    <CardContent className="pt-6">
                        <Tabs defaultValue="all" className="w-full">
                            <TabsList className="bg-slate-100 dark:bg-white/5 p-1 rounded-xl mb-6 flex-wrap h-auto">
                                <TabsTrigger value="all" className="rounded-lg font-bold text-xs uppercase py-2 px-4">All Departments</TabsTrigger>
                                <TabsTrigger value="ontrack" className="rounded-lg font-bold text-xs uppercase py-2 px-4 text-emerald-600">On Track</TabsTrigger>
                                <TabsTrigger value="behind" className="rounded-lg font-bold text-xs uppercase py-2 px-4 text-red-600">Behind Schedule</TabsTrigger>
                            </TabsList>

                            <TabsContent value="all" className="overflow-x-auto custom-scrollbar">
                                <SemesterTable data={SEMESTER_PROGRESS} />
                            </TabsContent>

                            <TabsContent value="ontrack" className="space-y-4">
                                <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4 flex gap-3">
                                    <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                                    <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        {onTrackSemesters.length} of {SEMESTER_PROGRESS.length} active semesters are on track.
                                    </p>
                                </div>
                                <SemesterTable data={onTrackSemesters} />
                            </TabsContent>

                            <TabsContent value="behind" className="space-y-4">
                                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 flex gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-xs font-bold text-red-700 dark:text-red-400">
                                        {behindSemesters.length} semesters are significantly behind schedule. Immediate intervention required.
                                    </p>
                                </div>
                                <SemesterTable data={behindSemesters} />
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ROW 4 — SUBJECT ALLOCATION + CURRICULUM HEALTH */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Allocation Breakdown */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Layers className="w-5 h-5 text-amber-500" />
                                Subject Type Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[280px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={SUBJECT_DISTRIBUTION}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }} />
                                        <RechartsTooltip cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }} content={<CustomTooltip />} />
                                        <Bar dataKey="core" name="Core" stackId="a" fill="hsl(var(--warning-surface))" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="elective" name="Elective" stackId="a" fill="hsl(var(--info-surface))" radius={[0, 0, 0, 0]} />
                                        <Bar dataKey="lab" name="Lab" stackId="a" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex justify-center gap-6 mt-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-amber-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Core</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Elective</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded-full bg-emerald-500" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Lab</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Curriculum Health Summary */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-amber-500" />
                                Curriculum Health
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-between pb-6">
                            <div className="text-center pt-4">
                                <h3 className="text-4xl font-black text-amber-500 tracking-tighter">86.0%</h3>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mt-1">Average Coverage</p>
                            </div>

                            <div className="h-[220px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RadialBarChart cx="50%" cy="50%" innerRadius="30%" outerRadius="100%" barSize={10} data={CURRICULUM_HEALTH} startAngle={180} endAngle={0}>
                                        <RadialBar background dataKey="value" />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>

                            <div className="w-full space-y-4">
                                <div className="flex justify-between items-center px-2">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                                        <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-tight">4 Healthy</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                                        <span className="text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-tight">2 Needs Review</span>
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        <span className="text-[9px] font-bold text-red-600 dark:text-red-400 uppercase tracking-tight">1 Outdated</span>
                                    </div>
                                </div>

                                <div className="p-4 rounded-xl bg-red-500/5 border border-red-500/10 flex items-center gap-3">
                                    <AlertTriangle className="w-5 h-5 text-red-500 shrink-0" />
                                    <p className="text-[11px] font-bold text-red-700 dark:text-red-400 leading-tight">
                                        Law curriculum coverage is critically low. Immediate update required.
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ROW 5 — QUICK ACTIONS + ACADEMIC ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* Quick Actions */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Activity className="w-5 h-5 text-amber-500" />
                                Academic Actions
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {[
                                    { label: 'View Course Catalogue', icon: BookOpen },
                                    { label: 'Export Academic Report', icon: Download },
                                    { label: 'Academic Calendar', icon: Calendar },
                                    { label: 'Curriculum Review', icon: FileText },
                                    { label: 'NAAC Compliance', icon: Award },
                                    { label: 'Academic Analytics', icon: BarChart3 },
                                ].map((action, i) => (
                                    <Tooltip key={i} content="Backend implementation pending">
                                        <Button
                                            variant="outline"
                                            className="h-auto p-4 justify-start text-left border-border bg-slate-50/50 dark:bg-white/[0.02] hover:bg-amber-500/5 hover:border-amber-500/30 transition-all rounded-xl group disabled:opacity-70 disabled:cursor-not-allowed min-h-[44px]"
                                            disabled
                                        >
                                            <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-500 group-hover:scale-110 transition-transform">
                                                <action.icon className="w-5 h-5 font-bold" />
                                            </div>
                                            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 ml-4">{action.label}</span>
                                        </Button>
                                    </Tooltip>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Academic Alerts */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Bell className="w-5 h-5 text-amber-500" />
                                Academic Alerts
                            </CardTitle>
                            <Badge className="bg-red-500 text-white border-none font-bold text-[10px] px-2">4</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { status: 'CRITICAL', title: 'Curriculum Outdated — Law', desc: 'Law curriculum last updated 3 years ago — NAAC risk identified', time: 'Today', color: 'bg-red-500' },
                                { status: 'CRITICAL', title: 'Semesters Behind Schedule', desc: 'MCA Sem 5 and Law Sem 5 are >3 weeks behind syllabus', time: 'Today', color: 'bg-red-500' },
                                { status: 'WARNING', title: 'Review Overdue — 2 Depts', desc: 'Mechanical/Civil curriculum reviews overdue by 6 months', time: '2d ago', color: 'bg-amber-500' },
                                { status: 'INFO', title: 'New Course Proposals', desc: '14 new elective subject proposals pending approval', time: '4d ago', color: 'bg-blue-500' },
                            ].map((alert, i) => (
                                <div key={i} className="flex gap-4 p-4 rounded-xl border border-border/50 bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <div className="shrink-0 pt-1">
                                        <div className={`w-2.5 h-2.5 rounded-full ${alert.color} animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]`} />
                                    </div>
                                    <div className="flex-1 space-y-1.5">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{alert.status}</p>
                                                <h4 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-tight">{alert.title}</h4>
                                            </div>
                                            <Button disabled variant="link" className="h-auto p-0 text-[10px] font-bold text-amber-600 opacity-50 uppercase tracking-widest cursor-not-allowed">View</Button>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                                            {alert.desc}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

const SemesterTable = ({ data }: { data: SemesterProgressRow[] }) => (
    <div className="rounded-xl border border-border overflow-hidden">
        <Table>
            <TableHeader className="bg-slate-50 dark:bg-white/5">
                <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Department</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Semester</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Dates</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Week</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Completion</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10">Status</TableHead>
                    <TableHead className="text-[10px] font-black uppercase tracking-widest h-10 text-right">Actions</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {data.map((row) => (
                    <TableRow key={row.id} className="border-border hover:bg-slate-50/50 dark:hover:bg-white/[0.02] transition-colors group">
                        <TableCell className="py-4">
                            <p className="text-sm font-bold text-slate-900 dark:text-white">{row.dept}</p>
                        </TableCell>
                        <TableCell>
                            <Badge variant="outline" className="text-[11px] font-bold border-amber-500/20 text-amber-600 bg-amber-500/5">
                                Sem {row.semester}
                            </Badge>
                        </TableCell>
                        <TableCell>
                            <div className="space-y-0.5">
                                <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">Start: {new Date(row.startDate).toLocaleDateString('en-IN')}</p>
                                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-tight">End: {new Date(row.endDate).toLocaleDateString('en-IN')}</p>
                            </div>
                        </TableCell>
                        <TableCell>
                            <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Week {row.currentWeek} of {row.totalWeeks}</p>
                        </TableCell>
                        <TableCell className="min-w-[140px]">
                            <div className="space-y-2">
                                <div className="flex justify-between items-center text-[10px] font-bold">
                                    <span className="text-slate-500 uppercase">Coverage</span>
                                    <span className="text-slate-900 dark:text-white">{row.completion}%</span>
                                </div>
                                <Progress
                                    value={row.completion}
                                    className="h-1.5"
                                />
                            </div>
                        </TableCell>
                        <TableCell>
                            <Badge className={`${row.status === 'On Track' ? 'bg-emerald-500/10 text-emerald-600' :
                                    row.status === 'Slightly Behind' ? 'bg-amber-500/10 text-amber-600' :
                                        'bg-red-500/10 text-red-600'
                                } border-none text-[9px] font-black uppercase tracking-tight`}>
                                {row.status}
                            </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                            <Tooltip content="Backend implementation pending">
                                <Button disabled variant="outline" size="sm" className="h-8 text-[10px] font-bold uppercase tracking-widest border-border opacity-70 cursor-not-allowed">
                                    Details
                                </Button>
                            </Tooltip>
                        </TableCell>
                    </TableRow>
                ))}
            </TableBody>
        </Table>
    </div>
);


// --- Examinations Content ---

const ExaminationsContent = ({ loading }: { loading: boolean }) => {
    const shouldSkipAnimations = useReducedMotion();

    if (loading) {
        return (
            <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-white/5" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-[400px] rounded-xl lg:col-span-2 bg-slate-200 dark:bg-white/5" />
                    <Skeleton className="h-[400px] rounded-xl lg:col-span-1 bg-slate-200 dark:bg-white/5" />
                </div>
                <Skeleton className="h-[500px] w-full rounded-xl bg-slate-200 dark:bg-white/5" />
            </div>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial={shouldSkipAnimations ? "visible" : "hidden"}
            animate="visible"
            className="space-y-6 pt-4"
        >
            {/* ROW 1 — EXAM KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {EXAM_KPIS.map((kpi) => (
                    <motion.div key={kpi.id} variants={fadeSlideUp}>
                        <Card className="bg-[hsl(var(--surface-raised))] border-border border-l-4 border-l-amber-500 shadow-md rounded-xl p-6 transition-all hover:shadow-lg h-full group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                                </div>
                                {kpi.trend && (
                                    <div className={`flex items-center gap-1 text-[11px] font-bold ${kpi.trend.isUp ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-amber-600 dark:text-amber-400 bg-amber-500/10'} px-2 py-0.5 rounded-full`}>
                                        {kpi.trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                                        {kpi.trend.statusLabel || kpi.trend.value.split(' ')[0]}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{kpi.value}</h3>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{kpi.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{kpi.sub}</p>
                                {kpi.trend && kpi.trend.value !== 'None' && (
                                    <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium mt-2">{kpi.trend.value}</p>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ROW 2 — EXAM SCHEDULE + RESULTS BREAKDOWN */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Exam Schedule Table */}
                <motion.div variants={fadeSlideUp} className="lg:col-span-2">
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-6 border-b border-border/50">
                            <div className="space-y-1">
                                <CardTitle className="text-base font-bold flex items-center gap-2">
                                    <CalendarDays className="w-5 h-5 text-amber-500" />
                                    Upcoming Examination Schedule
                                </CardTitle>
                                <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Next 14 Days</p>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                            <Table>
                                <TableHeader className="bg-slate-50 dark:bg-white/[0.02]">
                                    <TableRow className="border-border">
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Subject</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Dept</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Date & Time</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest">Venue</TableHead>
                                        <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {UPCOMING_EXAMS_DATA.map((exam) => (
                                        <TableRow key={exam.id} className="border-border hover:bg-amber-500/5 transition-colors group">
                                            <TableCell className="py-4">
                                                <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">{exam.name}</p>
                                                <p className="text-[10px] font-medium text-muted-foreground">Students: {exam.students}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] font-bold border-amber-500/20 text-amber-600 bg-amber-500/5">
                                                    {exam.dept}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-0.5">
                                                    <p className="text-[11px] font-bold text-slate-700 dark:text-slate-300">{exam.date}</p>
                                                    <p className="text-[10px] font-medium text-slate-500">{exam.time.split(' – ')[0]}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-xs font-bold text-slate-600 dark:text-slate-400">{exam.venue}</TableCell>
                                            <TableCell className="text-right">
                                                <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[9px] font-black uppercase tracking-tight">
                                                    {exam.status}
                                                </Badge>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Results Summary (Donut Chart) */}
                <motion.div variants={fadeSlideUp} className="lg:col-span-1">
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Award className="w-5 h-5 text-amber-500" />
                                Last Sem Results Summary
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1 flex flex-col items-center justify-between pb-6">
                            <div className="relative w-full h-[220px] mt-2">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={GPA_DISTRIBUTION_DATA}
                                            innerRadius={60}
                                            outerRadius={90}
                                            paddingAngle={5}
                                            dataKey="count"
                                            stroke="none"
                                        >
                                            {GPA_DISTRIBUTION_DATA.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                    <span className="text-2xl font-black text-slate-900 dark:text-white">88.4%</span>
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Avg Pass</span>
                                </div>
                            </div>
                            <div className="w-full space-y-4 mt-4">
                                <div className="grid grid-cols-2 gap-2">
                                    {TOP_PERFORMERS.map((perf, i) => (
                                        <div key={i} className="bg-slate-50 dark:bg-white/[0.02] border border-border p-3 rounded-xl col-span-2 flex items-center justify-between group hover:border-amber-500/30 transition-all">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center text-xs font-bold">
                                                    {perf.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">{perf.name}</p>
                                                    <p className="text-[9px] font-medium text-muted-foreground uppercase">{perf.dept}</p>
                                                </div>
                                            </div>
                                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black text-[10px]">{perf.score} GPA</Badge>
                                        </div>
                                    ))}
                                </div>
                                <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 hover:bg-amber-500/5 h-10">
                                    Full Performers List →
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ROW 3 — DEPARTMENT PERFORMANCE TABLE */}
            <motion.div variants={fadeSlideUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden">
                    <CardHeader className="pb-6 border-b border-border/50">
                        <CardTitle className="text-lg font-bold">Department Examination Performance</CardTitle>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Institutional Audit Results · AY 2024–25</p>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-white/[0.02]">
                                <TableRow className="border-border">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Department</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Appeared</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Pass</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Fail/Absent</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Pass Rate</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Avg Score</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Status</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {DEPT_EXAM_PERFORMANCE_DATA.map((row) => (
                                    <TableRow key={row.slug} className="border-border hover:bg-amber-500/5 transition-colors group">
                                        <TableCell className="py-4">
                                            <p className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors">{row.dept}</p>
                                            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-tighter">Rank #{row.rank}</p>
                                        </TableCell>
                                        <TableCell className="text-sm font-bold tabular-nums text-slate-700 dark:text-slate-300">{formatNumber(row.appeared)}</TableCell>
                                        <TableCell className="text-sm font-bold tabular-nums text-emerald-600">{formatNumber(row.pass)}</TableCell>
                                        <TableCell className="text-sm font-bold tabular-nums text-red-500/80">{row.fail + row.absent}</TableCell>
                                        <TableCell>
                                            <div className="space-y-1.5 min-w-[100px]">
                                                <div className="flex justify-between text-[10px] font-black">
                                                    <span>{row.passRate}%</span>
                                                </div>
                                                <Progress value={row.passRate} className="h-1.5" />
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-black text-slate-900 dark:text-white">{row.avgScore}</TableCell>
                                        <TableCell className="text-right">
                                            <Badge className={`${row.status === 'Excellent' ? 'bg-emerald-500/10 text-emerald-600' :
                                                    row.status === 'Good' ? 'bg-amber-500/10 text-amber-600' :
                                                        'bg-red-500/10 text-red-600'
                                                } border-none text-[9px] font-black uppercase tracking-tight`}>
                                                {row.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ROW 4 — TRENDS + ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6">
                {/* Performance Trends Chart */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                Pass Rate Trends
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full mt-4">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsLineChart data={PASS_RATE_TREND_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="sem" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }} />
                                        <YAxis domain={[60, 100]} axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }} />
                                        <RechartsTooltip />
                                        <Line type="monotone" dataKey="inst" name="Institution" stroke="hsl(var(--warning-surface))" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                                        <Line type="monotone" dataKey="cs" name="CS Dept" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                                        <Line type="monotone" dataKey="law" name="Law Dept" stroke="hsl(var(--danger-surface))" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                                    </RechartsLineChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Examination Alerts */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full">
                        <CardHeader className="flex flex-row items-center justify-between pb-6">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Bell className="w-5 h-5 text-amber-500" />
                                Examination Alerts
                            </CardTitle>
                            <Badge className="bg-red-500 text-white border-none font-bold text-[10px] px-2">2</Badge>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {[
                                { id: 1, type: 'CRITICAL', title: 'Result Delay — Law Dept', desc: 'Semester 4 results for Law department are overdue by 5 days. High volume of student queries reported.', time: 'Today', status: 'Priority' },
                                { id: 2, type: 'WARNING', title: 'Exam Hall Overflow', desc: 'Hall A capacity reached for CS Digital Electronics exam. 24 students needing reassignment.', time: 'Today', status: 'Needs Action' },
                                { id: 3, type: 'INFO', title: 'New Invigilation Guidelines', desc: 'Updated digital monitoring guidelines issued for upcoming final exams.', time: 'Yesterday', status: 'Read' },
                                { id: 4, type: 'INFO', title: 'Question Paper Audit', desc: 'Audit for all UG core subjects question banks completed successfully.', time: '2 days ago', status: 'Audit Done' },
                            ].map((alert) => (
                                <div key={alert.id} className="flex gap-4 p-4 rounded-xl border border-border bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                    <div className="shrink-0 flex flex-col items-center pt-1">
                                        <div className={`w-2.5 h-2.5 rounded-full ${alert.type === 'CRITICAL' ? 'bg-red-500 animate-pulse' : alert.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'} shadow-[0_0_8px_rgba(239,68,68,0.4)]`} />
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <div className="flex justify-between items-start">
                                            <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight">{alert.title}</h4>
                                            <span className="text-[9px] font-black uppercase text-amber-600 bg-amber-500/5 px-2 py-0.5 rounded border border-amber-500/10 tabular-nums">{alert.status}</span>
                                        </div>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                                            {alert.desc}
                                        </p>
                                        <p className="text-[10px] font-bold text-muted-foreground pt-1">{alert.time}</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};


// --- Attendance Section Content ---

const AttendanceSection = ({ loading }: { loading: boolean }) => {
    const shouldSkipAnimations = useReducedMotion();

    if (loading) {
        return (
            <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-white/5" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[400px] w-full rounded-xl bg-slate-200 dark:bg-white/5" />
                    <Skeleton className="h-[400px] w-full rounded-xl bg-slate-200 dark:bg-white/5" />
                </div>
                <Skeleton className="h-[500px] w-full rounded-xl bg-slate-200 dark:bg-white/5" />
            </div>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial={shouldSkipAnimations ? "visible" : "hidden"}
            animate="visible"
            className="space-y-6 pt-4"
        >
            {/* ROW 1 — ATTENDANCE KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {ATTENDANCE_KPIS.map((kpi) => (
                    <motion.div key={kpi.id} variants={fadeSlideUp}>
                        <Card className="bg-[hsl(var(--surface-raised))] border-border border-l-4 border-l-amber-500 shadow-md rounded-xl p-6 transition-all hover:shadow-lg h-full group">
                            <div className="flex justify-between items-start mb-4">
                                <div className="p-2.5 rounded-xl bg-amber-500/10 group-hover:bg-amber-500/20 transition-colors">
                                    <kpi.icon className={`w-6 h-6 ${kpi.color}`} />
                                </div>
                                {kpi.trend && (
                                    <div className={`flex items-center gap-1 text-[11px] font-bold ${kpi.trend.isUp ? 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'} px-2 py-0.5 rounded-full`}>
                                        {kpi.trend.isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                        {kpi.trend.value.split(' ')[0]}
                                    </div>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">{kpi.value}</h3>
                                <p className="text-sm font-bold text-slate-700 dark:text-slate-200">{kpi.label}</p>
                                <p className="text-xs text-slate-500 dark:text-slate-400">{kpi.sub}</p>
                                {kpi.trend && (
                                    <p className={`text-[11px] font-medium mt-2 ${kpi.trend.isUp ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>{kpi.trend.value}</p>
                                )}
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ROW 2 — TRENDS + DISTRIBUTION */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Attendance Trend Chart */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden h-full">
                        <CardHeader className="pb-6 border-b border-border/50">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <TrendingUp className="w-5 h-5 text-amber-500" />
                                Weekly Attendance Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={ATTENDANCE_TREND_DATA}>
                                        <defs>
                                            <linearGradient id="studentAtt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--warning-surface))" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="hsl(var(--warning-surface))" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="staffAtt" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="hsl(var(--success))" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="hsl(var(--success))" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }} />
                                        <YAxis domain={[80, 100]} axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }} />
                                        <RechartsTooltip />
                                        <Area type="monotone" dataKey="student" name="Student" stroke="hsl(var(--warning-surface))" strokeWidth={3} fillOpacity={1} fill="url(#studentAtt)" />
                                        <Area type="monotone" dataKey="staff" name="Staff" stroke="hsl(var(--success))" strokeWidth={2} strokeDasharray="5 5" fillOpacity={1} fill="url(#staffAtt)" />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Late Arrival Distribution */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden h-full">
                        <CardHeader className="pb-6 border-b border-border/50">
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-amber-500" />
                                Late Arrival Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={LATE_COMER_STATS_DATA}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                        <XAxis dataKey="dept" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 11, opacity: 0.7 }} />
                                        <RechartsTooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} />
                                        <Bar dataKey="count" name="Late Arrivals" fill="hsl(var(--danger-surface))" radius={[4, 4, 0, 0]} />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ROW 3 — DEPARTMENT ATTENDANCE TABLE */}
            <motion.div variants={fadeSlideUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden">
                    <CardHeader className="pb-6 border-b border-border/50">
                        <CardTitle className="text-lg font-bold">Departmental Attendance Overview</CardTitle>
                        <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Live Campus Monitoring · Today</p>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-white/[0.02]">
                                <TableRow className="border-border">
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Department</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Students Present</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Student %</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Staff Present</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest">Staff %</TableHead>
                                    <TableHead className="text-[10px] font-black uppercase tracking-widest text-right">Late Arrivals</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {DEPT_ATTENDANCE_DATA.map((row) => (
                                    <TableRow key={row.dept} className="border-border hover:bg-amber-500/5 transition-colors group">
                                        <TableCell className="py-4 font-bold text-slate-900 dark:text-white">{row.dept}</TableCell>
                                        <TableCell className="text-sm font-medium tabular-nums text-slate-700 dark:text-slate-300">
                                            {formatNumber(row.studentsPresent)} / {formatNumber(row.studentsTotal)}
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex gap-2 items-center">
                                                <div className="flex-1 min-w-[60px]">
                                                    <Progress value={row.studentsPercentage} className={`h-1.5 ${row.studentsPercentage < 80 ? '[&>div]:bg-red-500' : ''}`} />
                                                </div>
                                                <span className={`text-[10px] font-black w-8 ${row.studentsPercentage < 80 ? 'text-red-500' : ''}`}>{row.studentsPercentage}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-sm font-medium tabular-nums text-slate-700 dark:text-slate-300">
                                            {row.staffPresent} / {row.staffTotal}
                                        </TableCell>
                                        <TableCell className="text-[11px] font-black text-emerald-600">{row.staffPercentage}%</TableCell>
                                        <TableCell className="text-right">
                                            <Badge variant="outline" className={`text-[10px] font-bold ${row.lateArrivals > 50 ? 'bg-red-500/10 text-red-600 border-red-500/20' : 'bg-slate-100 dark:bg-white/5 border-none'}`}>
                                                {row.lateArrivals}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ROW 4 — ALERTS */}
            <motion.div variants={fadeSlideUp} className="pb-6">
                <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl">
                    <CardHeader className="flex flex-row items-center justify-between pb-6">
                        <CardTitle className="text-base font-bold flex items-center gap-2">
                            <Bell className="w-5 h-5 text-amber-500" />
                            Attendance Alerts & Notifications
                        </CardTitle>
                        <Badge className="bg-amber-500 text-white border-none font-bold text-[10px] px-2">3 New</Badge>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {ATTENDANCE_ALERTS.map((alert) => (
                            <div key={alert.id} className="flex gap-4 p-4 rounded-xl border border-border bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors group">
                                <div className="shrink-0 pt-1">
                                    <div className={`w-2.5 h-2.5 rounded-full ${alert.type === 'CRITICAL' ? 'bg-red-500 animate-pulse' : alert.type === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'} shadow-[0_0_8px_rgba(239,68,68,0.4)]`} />
                                </div>
                                <div className="flex-1 space-y-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="text-sm font-black text-slate-900 dark:text-white group-hover:text-amber-500 transition-colors uppercase tracking-tight">{alert.title}</h4>
                                        <span className="text-[10px] font-bold text-muted-foreground">{alert.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-bold">
                                        {alert.desc}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
};

// --- Timetable Content Component ---

const TimetableContent = ({
    loading,
    type,
    setType,
    dept,
    setDept,
    year,
    setYear,
    search,
    setSearch,
    editMode,
    setEditMode
}: {
    loading: boolean;
    type: 'classes' | 'exams' | 'staff';
    setType: (t: 'classes' | 'exams' | 'staff') => void;
    dept: string;
    setDept: (d: string) => void;
    year: string;
    setYear: (y: string) => void;
    search: string;
    setSearch: (s: string) => void;
    editMode: boolean;
    setEditMode: (e: boolean) => void;
}) => {
    if (loading) {
        return (
            <div className="space-y-6 pt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map((i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-xl bg-slate-200 dark:bg-white/5" />
                    ))}
                </div>
                <Skeleton className="h-[600px] w-full rounded-xl bg-slate-200 dark:bg-white/5" />
            </div>
        );
    }

    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const periods = Array.from({ length: 8 }, (_, i) => i + 1);

    const getEntryForCell = (day: string, period: number) => {
        if (type === 'classes') {
            return (CLASS_SCHEDULE_MOCK[dept] || []).find(e => e.day === day && e.period === period);
        } else if (type === 'exams') {
            return EXAM_SCHEDULE_MOCK.find(e => e.day === day && e.period === period);
        } else {
            // Simple staff mock logic: search by name
            const staffEntries = Object.entries(STAFF_SCHEDULE_MOCK).find(([name]) => name.toLowerCase().includes(search.toLowerCase()))?.[1] || [];
            return staffEntries.find(e => e.day === day && e.period === period);
        }
    };

    return (
        <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-6 pt-4 pb-12"
        >
            {/* ROW 1 — KPI CARDS */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {TIMETABLE_KPIS.map((kpi) => (
                    <motion.div key={kpi.id} variants={fadeSlideUp}>
                        <Card className="bg-[hsl(var(--surface-raised))] border-border border-l-4 border-l-amber-500 shadow-md rounded-xl p-6 hover:shadow-lg transition-all group h-full">
                            <div className="flex justify-between items-start mb-4">
                                <div className={`p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 ${kpi.color}`}>
                                    <kpi.icon className="w-5 h-5 font-bold" />
                                </div>
                                {kpi.trend && (
                                    <Badge className={`border-none text-[10px] font-bold ${kpi.trend.isUp ? 'bg-emerald-500/10 text-emerald-600' : 'bg-red-500/10 text-red-600'}`}>
                                        {kpi.trend.value}
                                    </Badge>
                                )}
                            </div>
                            <div className="space-y-1">
                                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{kpi.value}</h3>
                                <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">{kpi.label}</p>
                                <p className="text-[10px] font-medium text-slate-400 dark:text-slate-500 italic mt-1">{kpi.sub}</p>
                            </div>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* ROW 2 — VIEW SWITCHER & FILTERS */}
            <motion.div variants={fadeSlideUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl overflow-hidden p-4">
                    <div className="flex flex-col lg:flex-row gap-6 items-center justify-between">
                        {/* Type Switcher */}
                        <div className="flex p-1 bg-slate-100 dark:bg-white/5 rounded-xl self-start lg:self-center">
                            {(['classes', 'exams', 'staff'] as const).map((t) => (
                                <button
                                    key={t}
                                    onClick={() => setType(t)}
                                    className={`px-6 py-2 rounded-lg text-xs font-black uppercase tracking-wider transition-all ${
                                        type === t 
                                        ? 'bg-amber-500 text-white shadow-lg shadow-amber-500/20' 
                                        : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                                    }`}
                                >
                                    {t}
                                </button>
                            ))}
                        </div>

                        {/* Filters */}
                        <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
                            <div className="flex items-center gap-2 bg-slate-50 dark:bg-white/[0.02] border border-border px-3 py-1.5 rounded-xl group focus-within:border-amber-500/50 transition-colors">
                                <Filter className="w-4 h-4 text-slate-400 group-focus-within:text-amber-500" />
                                <select 
                                    value={dept} 
                                    onChange={(e) => setDept(e.target.value)}
                                    className="bg-slate-100 dark:bg-slate-800 border-none text-xs font-bold focus:ring-0 cursor-pointer outline-none text-slate-900 dark:text-white rounded-lg px-2 py-1 [&>option]:bg-[hsl(var(--surface-raised))] [&>option]:text-slate-900 dark:[&>option]:text-white"
                                >
                                    <option value="CSE">Computer Science</option>
                                    <option value="ECE">Electronics</option>
                                    <option value="ME">Mechanical</option>
                                    <option value="CE">Civil Engg</option>
                                </select>
                            </div>

                            {type === 'classes' && (
                                <select 
                                    value={year} 
                                    onChange={(e) => setYear(e.target.value)}
                                    className="bg-slate-100 dark:bg-slate-800 border border-border px-4 py-2 rounded-xl text-xs font-bold outline-none focus:border-amber-500/50 transition-colors text-slate-900 dark:text-white [&>option]:bg-[hsl(var(--surface-raised))] [&>option]:text-slate-900 dark:[&>option]:text-white"
                                >
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            )}

                            {type === 'staff' && (
                                <div className="relative flex-1 min-w-[200px]">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input 
                                        type="text"
                                        placeholder="Search Staff Member..."
                                        value={search}
                                        onChange={(e) => setSearch(e.target.value)}
                                        className="w-full bg-slate-50 dark:bg-white/[0.02] border border-border pl-10 pr-4 py-2 rounded-xl text-xs font-bold focus:border-amber-500/50 outline-none transition-colors"
                                    />
                                </div>
                            )}

                            <div className="h-8 w-px bg-border mx-2 hidden sm:block" />

                            <Button 
                                variant={editMode ? 'default' : 'outline'}
                                onClick={() => setEditMode(!editMode)}
                                className={`rounded-xl h-10 px-4 text-xs font-black uppercase tracking-widest gap-2 transition-all ${
                                    editMode ? 'bg-amber-500 hover:bg-amber-600 text-white border-none' : 'hover:border-amber-500/50 hover:bg-amber-500/5'
                                }`}
                            >
                                {editMode ? <Save className="w-4 h-4" /> : <Edit2 className="w-4 h-4" />}
                                {editMode ? 'Save Changes' : 'Edit Mode'}
                            </Button>
                        </div>
                    </div>
                </Card>
            </motion.div>

            {/* ROW 3 — MASTER SCHEDULE GRID */}
            <motion.div variants={fadeSlideUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-xl rounded-xl overflow-hidden">
                    <CardHeader className="bg-[hsl(var(--surface-sunken))] border-b border-border flex flex-row items-center justify-between py-4">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                                <CalendarDays className="w-5 h-5 text-amber-500" />
                            </div>
                            <div>
                                <CardTitle className="text-base font-black uppercase tracking-tight">
                                    {type === 'classes' ? `${dept} — ${year} Schedule` : type === 'exams' ? 'Institution Exam Master' : 'Staff Individual Schedule'}
                                </CardTitle>
                                <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mt-1">Semester 5, 2025–26 · Current Week</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                             <Button variant="ghost" size="sm" className="text-xs font-bold text-slate-500 hover:text-amber-600 hover:bg-amber-500/5">
                                <RefreshCw className="w-3.5 h-3.5 mr-2" /> Reset
                             </Button>
                             <Button variant="outline" size="sm" className="text-xs font-bold border-border hover:border-amber-500/50 hover:bg-amber-500/5">
                                <Share2 className="w-3.5 h-3.5 mr-2" /> Share
                             </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-slate-50/50 dark:bg-white/[0.02] border-border hover:bg-transparent">
                                    <TableHead className="w-[120px] font-black text-[11px] uppercase tracking-widest text-center border-r border-border">Period / Day</TableHead>
                                    {days.map(day => (
                                        <TableHead key={day} className="text-center font-black text-[11px] uppercase tracking-widest min-w-[160px]">{day}</TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {periods.map(period => (
                                    <TableRow key={period} className="border-border hover:bg-transparent group/row">
                                        <TableCell className="bg-slate-50/50 dark:bg-white/[0.01] border-r border-border p-4 text-center">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">P{period}</p>
                                            <p className="text-xs font-bold text-slate-700 dark:text-slate-300 tabular-nums">
                                                {period === 1 ? '09:00' : period === 2 ? '10:00' : period === 3 ? '11:15' : period === 4 ? '12:15' : '...'}
                                            </p>
                                        </TableCell>
                                        {days.map(day => {
                                            const entry = getEntryForCell(day, period);
                                            return (
                                                <TableCell 
                                                    key={`${day}-${period}`} 
                                                    className={`p-2 transition-all ${editMode ? 'cursor-pointer hover:bg-amber-500/5' : ''}`}
                                                >
                                                    {entry ? (
                                                        <div className={`p-3 rounded-xl border ${
                                                            entry.type === 'lecture' ? 'bg-blue-500/5 border-blue-500/20 text-blue-600' : 
                                                            entry.type === 'lab' ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-600' : 
                                                            'bg-red-500/5 border-red-500/20 text-red-600'
                                                        } group relative h-full min-h-[80px] flex flex-col justify-between overflow-hidden`}>
                                                            <div>
                                                                <div className="flex justify-between items-start mb-1">
                                                                    <span className="text-[10px] font-black uppercase tracking-widest opacity-70 leading-none">{entry.code}</span>
                                                                    <Badge className={`px-1 py-0 h-3 text-[8px] font-bold border-none uppercase ${
                                                                        entry.type === 'lecture' ? 'bg-blue-500/10' : 'bg-emerald-500/10'
                                                                    }`}>
                                                                        {entry.type}
                                                                    </Badge>
                                                                </div>
                                                                <h4 className="text-xs font-bold leading-tight line-clamp-2 text-slate-900 dark:text-white mb-1">{entry.subject}</h4>
                                                            </div>
                                                            <div className="flex items-center gap-2 mt-auto">
                                                                <div className="flex items-center gap-1 opacity-80">
                                                                    <Building className="w-3 h-3" />
                                                                    <span className="text-[10px] font-black uppercase tracking-tighter">Room {entry.room}</span>
                                                                </div>
                                                                {entry.faculty && (
                                                                    <div className="flex items-center gap-1 opacity-80">
                                                                        <User className="w-3 h-3" />
                                                                        <span className="text-[10px] font-black uppercase tracking-tighter truncate max-w-[80px]">{entry.faculty}</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {editMode && (
                                                                <div className="absolute inset-0 bg-amber-500/10 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[1px]">
                                                                    <Button size="icon" variant="secondary" className="h-8 w-8 rounded-lg bg-white dark:bg-slate-900 shadow-md">
                                                                        <Edit2 className="w-4 h-4 text-amber-500" />
                                                                    </Button>
                                                                </div>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <div className="h-full min-h-[80px] rounded-xl border-2 border-dashed border-slate-100 dark:border-white/5 flex items-center justify-center opacity-30 hover:opacity-100 hover:border-amber-500/30 transition-all group">
                                                            {editMode && <Plus className="w-5 h-5 text-amber-500 group-hover:scale-110 transition-transform" />}
                                                        </div>
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </motion.div>

            {/* ROW 4 — RESOURCE & CONFLICT ANALYSIS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Resource Allocation Charts */}
                <motion.div variants={fadeSlideUp} className="space-y-6">
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Building className="w-5 h-5 text-amber-500" />
                                Classroom Utilization (%)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[240px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsBarChart data={CLASSROOM_UTILIZATION} margin={{ top: 20 }}>
                                        <XAxis dataKey="building" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }} />
                                        <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', fontSize: 10 }} />
                                        <RechartsTooltip cursor={{ fill: 'rgba(255,191,0,0.05)' }} />
                                        <Bar dataKey="util" fill="hsl(var(--warning-surface))" radius={[4, 4, 0, 0]} barSize={40} />
                                    </RechartsBarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl">
                        <CardHeader>
                            <CardTitle className="text-base font-bold flex items-center gap-2">
                                <Users className="w-5 h-5 text-amber-500" />
                                Faculty Workload Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex flex-col md:flex-row items-center justify-around gap-6">
                            <div className="h-[200px] w-[200px]">
                                <ResponsiveContainer width="100%" height="100%">
                                    <RechartsPieChart>
                                        <Pie
                                            data={FACULTY_LOAD_DIST}
                                            innerRadius={60}
                                            outerRadius={80}
                                            paddingAngle={8}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {FACULTY_LOAD_DIST.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.fill} />
                                            ))}
                                        </Pie>
                                        <RechartsTooltip />
                                    </RechartsPieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="space-y-3 w-full max-w-[200px]">
                                {FACULTY_LOAD_DIST.map((item, i) => (
                                    <div key={i} className="flex justify-between items-center group">
                                        <div className="flex items-center gap-2">
                                            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.fill }} />
                                            <span className="text-xs font-bold text-slate-600 dark:text-slate-400">{item.name}</span>
                                        </div>
                                        <span className="text-xs font-black tabular-nums">{item.value}</span>
                                    </div>
                                ))}
                                <div className="pt-4 border-t border-border">
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest flex justify-between items-center">
                                        Active Faculty <span>487</span>
                                    </p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Conflict Analysis & Heatmap */}
                <motion.div variants={fadeSlideUp} className="flex flex-col gap-6">
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl flex flex-col h-full">
                        <CardHeader className="flex flex-row items-center justify-between">
                             <CardTitle className="text-base font-bold flex items-center gap-2">
                                <AlertTriangle className="w-5 h-5 text-red-500" />
                                Conflict Monitoring
                            </CardTitle>
                            <Badge className="bg-red-500 text-white border-none font-bold text-[10px]">7 Critical</Badge>
                        </CardHeader>
                        <CardContent className="p-0 flex-1 custom-scrollbar">
                            <Tabs defaultValue="all" className="w-full">
                                <TabsList className="bg-slate-100 dark:bg-white/5 border-b border-border w-full flex justify-start rounded-none h-12 px-4 gap-4">
                                    <TabsTrigger value="all" className="data-[state=active]:bg-transparent data-[state=active]:text-amber-600 data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none h-full text-[10px] font-black uppercase tracking-widest px-4">All</TabsTrigger>
                                    <TabsTrigger value="unresolved" className="data-[state=active]:bg-transparent data-[state=active]:text-amber-600 data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none h-full text-[10px] font-black uppercase tracking-widest px-4">Unresolved</TabsTrigger>
                                    <TabsTrigger value="resolved" className="data-[state=active]:bg-transparent data-[state=active]:text-amber-600 data-[state=active]:border-b-2 data-[state=active]:border-amber-500 rounded-none h-full text-[10px] font-black uppercase tracking-widest px-4">Resolved</TabsTrigger>
                                </TabsList>
                                <TabsContent value="all" className="m-0 bg-[hsl(var(--surface-sunken))]">
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        <Table>
                                            <TableBody>
                                                {CONFLICTS_DATA.map((c) => (
                                                    <TableRow key={c.id} className="border-border hover:bg-white/[0.02]">
                                                        <TableCell className="py-4">
                                                            <div className="flex gap-4">
                                                                <div className={`w-1 h-auto rounded-full ${c.status === 'Resolved' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-0.5">{c.type}</p>
                                                                    <p className="text-[11px] text-slate-500 font-medium leading-tight mb-2">{c.desc}</p>
                                                                    <div className="flex flex-wrap gap-3">
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase"><Calendar className="w-3 h-3 text-amber-500" /> {c.day}</span>
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase"><Clock className="w-3 h-3 text-amber-500" /> {c.period}</span>
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase"><Users className="w-3 h-3 text-amber-500" /> {c.depts.join(', ')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right align-top pt-4 pr-4">
                                                            <Button size="sm" variant="ghost" className="h-7 text-[9px] font-black uppercase tracking-widest hover:text-amber-600">Resolve →</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                                <TabsContent value="unresolved" className="m-0 bg-[hsl(var(--surface-sunken))]">
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        <Table>
                                            <TableBody>
                                                {CONFLICTS_DATA.filter(c => c.status !== 'Resolved').map((c) => (
                                                    <TableRow key={c.id} className="border-border hover:bg-white/[0.02]">
                                                        <TableCell className="py-4">
                                                            <div className="flex gap-4">
                                                                <div className="w-1 h-auto rounded-full bg-red-500" />
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-0.5">{c.type}</p>
                                                                    <p className="text-[11px] text-slate-500 font-medium leading-tight mb-2">{c.desc}</p>
                                                                    <div className="flex flex-wrap gap-3">
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase"><Calendar className="w-3 h-3 text-amber-500" /> {c.day}</span>
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase"><Clock className="w-3 h-3 text-amber-500" /> {c.period}</span>
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase"><Users className="w-3 h-3 text-amber-500" /> {c.depts.join(', ')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right align-top pt-4 pr-4">
                                                            <Button size="sm" variant="ghost" className="h-7 text-[9px] font-black uppercase tracking-widest hover:text-amber-600">Resolve →</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                                <TabsContent value="resolved" className="m-0 bg-[hsl(var(--surface-sunken))]">
                                    <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                                        <Table>
                                            <TableBody>
                                                {CONFLICTS_DATA.filter(c => c.status === 'Resolved').map((c) => (
                                                    <TableRow key={c.id} className="border-border hover:bg-white/[0.02]">
                                                        <TableCell className="py-4">
                                                            <div className="flex gap-4">
                                                                <div className="w-1 h-auto rounded-full bg-emerald-500" />
                                                                <div>
                                                                    <p className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight mb-0.5">{c.type}</p>
                                                                    <p className="text-[11px] text-slate-500 font-medium leading-tight mb-2">{c.desc}</p>
                                                                    <div className="flex flex-wrap gap-3">
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase"><Calendar className="w-3 h-3 text-amber-500" /> {c.day}</span>
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase"><Clock className="w-3 h-3 text-amber-500" /> {c.period}</span>
                                                                        <span className="flex items-center gap-1 text-[9px] font-bold text-muted-foreground uppercase"><Users className="w-3 h-3 text-amber-500" /> {c.depts.join(', ')}</span>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right align-top pt-4 pr-4">
                                                            <Button size="sm" variant="ghost" className="h-7 text-[9px] font-black uppercase tracking-widest hover:text-emerald-600">View Details →</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>

                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl">
                        <CardHeader className="py-2.5 flex flex-row items-center justify-between">
                            <CardTitle className="text-sm font-bold flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Busy Intensity Heatmap
                            </CardTitle>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4].map(v => <div key={v} className="w-2.5 h-2.5 rounded-sm" style={{ backgroundColor: `hsl(var(--warning-surface) / ${v * 0.25})` }} />)}
                            </div>
                        </CardHeader>
                        <CardContent className="py-2">
                            <div className="grid grid-cols-8 gap-1 pb-2">
                                <div />
                                {Array.from({ length: 8 }, (_, i) => i + 1).map(p => (
                                    <div key={p} className="text-[9px] font-black text-slate-400 text-center uppercase">P{p}</div>
                                ))}
                                {days.map(day => (
                                    <Fragment key={day}>
                                        <div className="text-[9px] font-black text-slate-400 uppercase flex items-center">{day}</div>
                                        {Array.from({ length: 8 }, (_, p) => (
                                            <Tooltip key={`${day}-${p}`} content={`${day} Period ${p + 1}: ${HEATMAP_DATA.find(h => h.day === day && h.period === p + 1)?.intensity}% Occupancy`}>
                                                <div 
                                                    className="aspect-square rounded-[2px] cursor-help transition-all hover:scale-125"
                                                    style={{ backgroundColor: `hsl(var(--warning-surface) / ${ (HEATMAP_DATA.find(h => h.day === day && h.period === p + 1)?.intensity || 0) / 100 })` }}
                                                />
                                            </Tooltip>
                                        ))}
                                    </Fragment>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* ROW 5 — QUICK ACTIONS & RECENT ALERTS */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader>
                            <CardTitle className="text-base font-bold">Management Quick Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { label: 'Generate Master PDF', icon: FileText, sub: 'Institution-wide schedule', color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                { label: 'Sync to Mobile App', icon: Share2, sub: 'Push live updates to all', color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                { label: 'Export Dept Wise', icon: Download, sub: '7 individual PDF files', color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                { label: 'Auditor View', icon: UserCheck, sub: 'Verify room compliance', color: 'text-purple-500', bg: 'bg-purple-500/10' },
                            ].map((action, i) => (
                                <Button 
                                    key={i} 
                                    variant="outline" 
                                    className="h-auto p-4 justify-start text-left border-border bg-slate-50 dark:bg-white/[0.02] hover:bg-amber-500/5 hover:border-amber-500/30 transition-all rounded-xl group"
                                >
                                    <div className={`p-2.5 rounded-xl ${action.bg} ${action.color} mr-4 group-hover:scale-110 transition-transform`}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-0.5">
                                        <span className="text-sm font-bold text-slate-800 dark:text-slate-200">{action.label}</span>
                                        <p className="text-[10px] text-muted-foreground font-medium">{action.sub}</p>
                                    </div>
                                </Button>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-border shadow-md rounded-xl h-full flex flex-col">
                        <CardHeader className="flex flex-row items-center justify-between">
                            <CardTitle className="text-base font-bold">Timetable Management Alerts</CardTitle>
                            <Bell className="w-5 h-5 text-amber-500" />
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {TIMETABLE_ALERTS.map((alert) => (
                                <div key={alert.id} className="flex gap-4 p-3 rounded-xl border border-border bg-slate-50/50 dark:bg-white/[0.01] hover:bg-slate-50 transition-colors group">
                                     <div className={`w-1 h-auto rounded-full shrink-0 ${alert.type === 'danger' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                     <div className="flex-1">
                                        <div className="flex justify-between items-center mb-1">
                                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-tight">{alert.title}</h4>
                                            <span className="text-[9px] font-bold text-muted-foreground bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded uppercase">{alert.time}</span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{alert.desc}</p>
                                     </div>
                                </div>
                            ))}
                            <Button variant="ghost" className="w-full text-[10px] font-black uppercase tracking-widest text-amber-600 hover:text-amber-700 hover:bg-amber-500/5 mt-2">
                                View Full Resource Log →
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
};

export default function ManagementDashboard() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<ManagementData | null>(null);
    const [activeSection, setActiveSection] = useState('overview');
    const [loadingStudentOverview, setLoadingStudentOverview] = useState(true);
    const [loadingStaffOverview, setLoadingStaffOverview] = useState(true);
    const [loadingAcademic, setLoadingAcademic] = useState(true);
    const [loadingExaminations, setLoadingExaminations] = useState(true);
    const [loadingAttendance, setLoadingAttendance] = useState(true);
    const [loadingTimetable, setLoadingTimetable] = useState(true);

    // Timetable Filters & View State
    const [timetableType, setTimetableType] = useState<'classes' | 'exams' | 'staff'>('classes');
    const [timetableDeptFilter, setTimetableDeptFilter] = useState('CSE');
    const [timetableYearFilter, setTimetableYearFilter] = useState('3rd Year');
    const [timetableStaffSearch, setTimetableStaffSearch] = useState('');
    const [isEditMode, setIsEditMode] = useState(false);

    // Simulation Loading States
    useEffect(() => {
        if (activeSection === 'student overview') {
            setLoadingStudentOverview(true);
            const timer = setTimeout(() => setLoadingStudentOverview(false), 800);
            return () => clearTimeout(timer);
        }
        if (activeSection === 'staff overview') {
            setLoadingStaffOverview(true);
            const timer = setTimeout(() => setLoadingStaffOverview(false), 800);
            return () => clearTimeout(timer);
        }
        if (activeSection === 'academic') {
            setLoadingAcademic(true);
            const timer = setTimeout(() => setLoadingAcademic(false), 800);
            return () => clearTimeout(timer);
        }
        if (activeSection === 'examinations') {
            setLoadingExaminations(true);
            const timer = setTimeout(() => setLoadingExaminations(false), 800);
            return () => clearTimeout(timer);
        }
        if (activeSection === 'attendance') {
            setLoadingAttendance(true);
            const timer = setTimeout(() => setLoadingAttendance(false), 800);
            return () => clearTimeout(timer);
        }
        if (activeSection === 'timetable') {
            setLoadingTimetable(true);
            const timer = setTimeout(() => setLoadingTimetable(false), 800);
            return () => clearTimeout(timer);
        }
    }, [activeSection]);



    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole') || 'Management';

    // Derived state for Header
    const displayUserName = data?.user?.name || userRole.charAt(0).toUpperCase() + userRole.slice(1);
    const initials = displayUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                if (userId) {
                    const res = await fetch(`http://localhost:5000/api/dashboard/management/${userId}`);
                    const json = await res.json();
                    if (json.success) {
                        setData(json.data);
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch API, falling back to mock");
            }

            // Fallback mock data
            setTimeout(() => {
                setData({
                    user: { name: 'Dr. Sarah Connor', email: 'director@university.edu', role: 'management' },
                    kpis: {
                        total_students: { value: '14,250', trend: 'up' },
                        revenue_collected: { value: '$4.2M', trend: 'up' },
                        placement_percentage: { value: '92%', trend: 'up' },
                        faculty_strength: { value: '450', trend: 'down' }
                    }
                });
                setLoading(false);
            }, 800);
        }
        fetchDashboard();
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        toast.info("Logged out successfully");
        navigate('/');
    };

    // Executive Colors
    // Amber/Gold for primary revenue/highlights
    // Slate/Zinc for backgrounds

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-[#0B0F19] text-slate-900 dark:text-slate-200 flex transition-colors duration-300 font-sans selection:bg-amber-500/30">
            {/* Background Effects (Executive/Slate/Gold theme) */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-[#0B0F19] dark:via-[#111827] dark:to-[#0B0F19]" />
                <div className="absolute top-0 right-1/4 w-[800px] h-[800px] rounded-full bg-amber-500/5 dark:bg-amber-500/[0.03] blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-slate-400/10 dark:bg-slate-500/5 blur-[100px]" />
            </div>

            {/* Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
                        onClick={() => setMobileMenuOpen(false)}
                    />
                )}
            </AnimatePresence>

            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: isMobile ? 280 : (sidebarOpen ? 240 : 72) }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`
                    fixed top-0 left-0 h-full z-50 flex flex-col 
                    bg-white dark:bg-[#111827] border-r border-slate-200 dark:border-white/[0.05]
                    ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0
                    transition-transform lg:transition-none
                `}
            >
                <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-white/[0.05]">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-amber-500/20">
                        <Building className="w-5 h-5" />
                    </div>
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-sm tracking-wide whitespace-nowrap text-slate-800 dark:text-white"
                            >
                                Executive Board
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
                    {[
                        { icon: LayoutDashboard, label: 'Overview' },
                        { icon: TrendingUp, label: 'Analytics' },
                        { icon: DollarSign, label: 'Financials' },
                        { icon: Users, label: 'Departments' },
                        { icon: GraduationCap, label: 'Student Overview' },
                        { icon: Briefcase, label: 'Staff Overview' },
                        { icon: BookOpen, label: 'Academic' },
                        { icon: ClipboardCheck, label: 'Attendance' },
                        { icon: FileText, label: 'Examinations' },
                        { icon: Wallet, label: 'Fee Management' },
                        { icon: Library, label: 'Library' },
                        { icon: Calendar, label: 'Timetable' },
                        { icon: Award, label: 'Placements' },
                        { icon: Megaphone, label: 'Announcements' },
                        { icon: BarChart, label: 'Reports' },
                        { icon: Server, label: 'System Monitor' },
                        { icon: User, label: 'My Profile' },
                    ].map((item) => {
                        const isActive = activeSection === item.label.toLowerCase();
                        return (
                            <button
                                key={item.label}
                                onClick={() => {
                                    setActiveSection(item.label.toLowerCase());
                                    if (isMobile) setMobileMenuOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200
                                    ${isActive
                                        ? 'bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 shadow-sm'
                                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-white/[0.02]'
                                    }
                                `}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-amber-600 dark:text-amber-400' : ''}`} />
                                <AnimatePresence>
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            className="whitespace-nowrap"
                                        >
                                            {item.label}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </button>
                        );
                    })}
                </nav>

                <div className="hidden lg:flex p-3 border-t border-slate-200 dark:border-white/[0.05]">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center py-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/[0.02] transition-colors"
                    >
                        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <motion.div
                initial={false}
                animate={{ marginLeft: isMobile ? 0 : (sidebarOpen ? 240 : 72) }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex-1 flex flex-col min-h-screen min-w-0"
            >
                {/* Header */}
                <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-slate-200 dark:border-white/[0.05] bg-white dark:bg-[#0B0F19]">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05]"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>
                        <h1 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white hidden sm:block">Institutional Overview</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <button onClick={handleLogout} className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>

                        <button className="relative p-2 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#0B0F19]" />
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer outline-none">
                                    <Avatar className="w-8 h-8 ring-2 ring-amber-500/20">
                                        <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-600 text-white text-xs font-bold">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left relative z-10">
                                        <p className="text-xs font-medium text-slate-900 dark:text-white/90 leading-tight">{displayUserName}</p>
                                        <p className="text-[10px] text-slate-500 dark:text-white/40 capitalize">Board Member</p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#111827] border-slate-200 dark:border-white/[0.05]">
                                <DropdownMenuLabel className="text-slate-900 dark:text-white">Management Account</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-slate-200 dark:bg-white/[0.05]" />
                                <DropdownMenuItem className="focus:bg-slate-100 dark:focus:bg-white/[0.05] dark:text-slate-300">Download Report (PDF)</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Dashboard Map */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        {loading ? (
                            <motion.div
                                key="loading"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="space-y-6"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl bg-slate-200 dark:bg-white/5" />)}
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Skeleton className="h-[400px] rounded-xl lg:col-span-2 bg-slate-200 dark:bg-white/5" />
                                    <Skeleton className="h-[400px] rounded-xl lg:col-span-1 bg-slate-200 dark:bg-white/5" />
                                </div>
                            </motion.div>
                        ) : activeSection === 'overview' ? (
                            data ? (
                                <motion.div
                                    key="overview"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    {/* Top KPI Cards */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { key: 'total_students', label: 'Total Students', icon: Users, color: 'text-blue-500', bg: 'bg-blue-500/10' },
                                            { key: 'revenue_collected', label: 'Revenue Collected', icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
                                            { key: 'placement_percentage', label: 'Placement %', icon: TrendingUp, color: 'text-amber-500', bg: 'bg-amber-500/10' },
                                            { key: 'faculty_strength', label: 'Faculty Strength', icon: Activity, color: 'text-purple-500', bg: 'bg-purple-500/10' },
                                        ].map((item) => {
                                            const kpi = data.kpis[item.key] || { value: 'N/A', trend: 'up' };
                                            const isUp = kpi.trend === 'up';
                                            return (
                                                <Card key={item.key} className="bg-[hsl(var(--surface-raised))] border-slate-200 dark:border-white/[0.05] hover:shadow-lg transition-all group overflow-hidden relative">
                                                    <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/5 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                                    <CardHeader className="flex flex-row items-center justify-between pb-2 relative z-10">
                                                        <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{item.label}</CardTitle>
                                                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${item.bg}`}>
                                                            <item.icon className={`w-4 h-4 ${item.color}`} />
                                                        </div>
                                                    </CardHeader>
                                                    <CardContent className="relative z-10">
                                                        <div className="flex items-baseline gap-2">
                                                            <div className="text-3xl font-bold text-slate-800 dark:text-white tracking-tight">{kpi.value}</div>
                                                            <div className={`flex items-center text-xs font-medium ${isUp ? 'text-emerald-500' : 'text-red-500'}`}>
                                                                {isUp ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })}
                                    </div>

                                    {/* Charts Row */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Financial Health (Area Chart) */}
                                        <Card className="lg:col-span-2 bg-[hsl(var(--surface-raised))] border-slate-200 dark:border-white/[0.05]">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-base font-semibold text-slate-800 dark:text-white">Financial Health Overview</CardTitle>
                                                <CardDescription className="text-xs dark:text-slate-400">Revenue vs. Expenses (Last 8 Months)</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-[300px] w-full">
                                                    <ResponsiveContainer width="100%" height="100%">
                                                        <AreaChart data={financeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                            <defs>
                                                                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                                                </linearGradient>
                                                                <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                                                                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                                                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                                                </linearGradient>
                                                            </defs>
                                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                                            <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} dy={10} />
                                                            <YAxis axisLine={false} tickLine={false} tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 12 }} />
                                                            <RechartsTooltip content={<CustomTooltip />} />
                                                            <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                                                            <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExpenses)" />
                                                        </AreaChart>
                                                    </ResponsiveContainer>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Admission Funnel */}
                                        <Card className="lg:col-span-1 bg-[hsl(var(--surface-raised))] border-slate-200 dark:border-white/[0.05]">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-base font-semibold text-slate-800 dark:text-white">Admission Pipeline</CardTitle>
                                                <CardDescription className="text-xs dark:text-slate-400">Conversion funnel for current year</CardDescription>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="h-[300px] w-full flex flex-col justify-center">
                                                    {funnelData.map((step, idx) => {
                                                        const maxCount = funnelData[0].count;
                                                        const widthPercentage = Math.max((step.count / maxCount) * 100, 15);
                                                        return (
                                                            <div key={idx} className="flex flex-col items-center mb-4 last:mb-0 w-full relative group">
                                                                <div className="flex justify-between w-full px-4 text-[11px] font-medium text-slate-500 dark:text-slate-400 mb-1 z-10">
                                                                    <span>{step.stage}</span>
                                                                    <span>{step.count.toLocaleString()}</span>
                                                                </div>
                                                                <motion.div
                                                                    initial={{ width: 0 }}
                                                                    animate={{ width: `${widthPercentage}%` }}
                                                                    transition={{ duration: 1, delay: idx * 0.2 }}
                                                                    className="h-10 rounded-lg relative overflow-hidden transition-all duration-300 group-hover:brightness-110 shadow-lg"
                                                                    style={{ backgroundColor: step.fill }}
                                                                >
                                                                    <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                                                                </motion.div>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* Bottom Row */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Departmental Table */}
                                        <Card className="lg:col-span-2 bg-[hsl(var(--surface-raised))] border-slate-200 dark:border-white/[0.05]">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-base font-semibold text-slate-800 dark:text-white">Departmental Performance</CardTitle>
                                            </CardHeader>
                                            <CardContent className="p-0">
                                                <Table>
                                                    <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02]">
                                                        <TableRow className="border-slate-100 dark:border-white/[0.05] hover:bg-transparent">
                                                            <TableHead className="text-slate-500 dark:text-slate-400">Department</TableHead>
                                                            <TableHead className="text-slate-500 dark:text-slate-400">Attendance Focus</TableHead>
                                                            <TableHead className="text-slate-500 dark:text-slate-400">Pass Rate</TableHead>
                                                            <TableHead className="text-right text-slate-500 dark:text-slate-400">Grievances</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {departmentStats.map((dept, i) => (
                                                            <TableRow key={i} className="border-slate-100 dark:border-white/[0.05] hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                                                <TableCell className="font-medium text-slate-800 dark:text-slate-200">{dept.name}</TableCell>
                                                                <TableCell>
                                                                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 max-w-[100px]">
                                                                        <div className={`h-1.5 rounded-full ${dept.attendance > 85 ? 'bg-emerald-500' : 'bg-amber-500'}`} style={{ width: `${dept.attendance}%` }} />
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell className="text-slate-600 dark:text-slate-300">{dept.pass_percentage}%</TableCell>
                                                                <TableCell className="text-right">
                                                                    <Badge variant={dept.grievances > 10 ? "destructive" : "secondary"} className="bg-opacity-10 shadow-none text-xs px-2 py-0 border-0">
                                                                        {dept.grievances}
                                                                    </Badge>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>

                                        {/* Critical Alerts */}
                                        <Card className="lg:col-span-1 bg-[hsl(var(--surface-raised))] border-slate-200 dark:border-white/[0.05]">
                                            <CardHeader className="pb-4">
                                                <CardTitle className="text-base font-semibold text-slate-800 dark:text-white flex items-center gap-2">
                                                    <Bell className="w-4 h-4 text-amber-500" />
                                                    Institutional Alerts
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="space-y-4">
                                                    {criticalAlerts.map(alert => (
                                                        <div key={alert.id} className="flex items-start gap-4 p-3 rounded-lg bg-white/40 dark:bg-white/[0.02] border border-slate-100 dark:border-white/[0.02] hover:bg-white/80 dark:hover:bg-white/[0.04] transition-colors cursor-pointer">
                                                            <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${alert.type === 'danger' ? 'bg-red-500 animate-pulse' : alert.type === 'warning' ? 'bg-amber-500' : 'bg-blue-500'}`} />
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{alert.title}</p>
                                                                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{alert.desc}</p>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-center items-center h-full text-slate-500"
                                >
                                    Institutional data link severed.
                                </motion.div>
                            )
                        ) : activeSection === 'analytics' ? (
                            <Suspense fallback={<LazyFallback />}><ManagementAnalytics /></Suspense>
                        ) : activeSection === 'financials' ? (
                            <Suspense fallback={<LazyFallback />}><ManagementFinancials /></Suspense>
                        ) : activeSection === 'departments' ? (
                            <Suspense fallback={<LazyFallback />}><ManagementDepartments /></Suspense>
                        ) : activeSection === 'student overview' ? (
                            <StudentOverviewContent loading={loadingStudentOverview} />
                        ) : activeSection === 'staff overview' ? (
                            <StaffOverviewContent loading={loadingStaffOverview} />
                        ) : activeSection === 'academic' ? (
                            <AcademicContent loading={loadingAcademic} />
                        ) : activeSection === 'attendance' ? (
                            <AttendanceSection loading={loadingAttendance} />
                        ) : activeSection === 'examinations' ? (
                            <ExaminationsContent loading={loadingExaminations} />
                        ) : activeSection === 'fee management' ? (
                            <Suspense fallback={<LazyFallback />}><FeeManagement /></Suspense>
                        ) : activeSection === 'library' ? (
                            <Suspense fallback={<LazyFallback />}><LibraryOverview /></Suspense>
                        ) : activeSection === 'timetable' ? (
                            <TimetableContent 
                                loading={loadingTimetable}
                                type={timetableType}
                                setType={setTimetableType}
                                dept={timetableDeptFilter}
                                setDept={setTimetableDeptFilter}
                                year={timetableYearFilter}
                                setYear={setTimetableYearFilter}
                                search={timetableStaffSearch}
                                setSearch={setTimetableStaffSearch}
                                editMode={isEditMode}
                                setEditMode={setIsEditMode}
                            />
                        ) : activeSection === 'placements' ? (
                            <Suspense fallback={<LazyFallback />}><Placements /></Suspense>
                        ) : activeSection === 'announcements' ? (
                            <Suspense fallback={<LazyFallback />}><Announcements /></Suspense>
                        ) : activeSection === 'reports' ? (
                            <Suspense fallback={<LazyFallback />}><Reports /></Suspense>
                        ) : activeSection === 'system monitor' ? (
                            <Suspense fallback={<LazyFallback />}><SystemMonitor /></Suspense>
                        ) : activeSection === 'my profile' ? (
                            <Suspense fallback={<LazyFallback />}><ManagementProfile /></Suspense>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-6">
                                    {(() => {
                                        const Icon = [
                                            { icon: LayoutDashboard, label: 'Overview' },
                                            { icon: TrendingUp, label: 'Analytics' },
                                            { icon: DollarSign, label: 'Financials' },
                                            { icon: Users, label: 'Departments' },
                                        ].find(i => i.label.toLowerCase() === activeSection)?.icon || LayoutDashboard;
                                        return <Icon className="w-10 h-10 text-amber-600 dark:text-amber-400" />;
                                    })()}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 capitalize">
                                    {activeSection} Terminal
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
                                    This executive module is currently undergoing system upgrades. Institutional insights will be restored shortly.
                                </p>
                                <Button
                                    onClick={() => setActiveSection('overview')}
                                    className="gap-2 bg-amber-600 hover:bg-amber-700 text-white"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Return to Overview
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </motion.div>
        </div>
    );
}
