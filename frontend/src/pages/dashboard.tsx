import { useEffect, useState, useMemo, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, LayoutDashboard, Search, Bell, ChevronLeft, ChevronRight,
    GraduationCap, BookOpen, Calendar, ClipboardList, Zap, TrendingUp,
    FileText, CreditCard, Clock, AlertTriangle, CheckCircle2,
    Menu, Home, BarChart3, HelpCircle, Wallet, User
} from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ThemeToggle } from '@/components/theme-toggle';
import {
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area, AreaChart
} from 'recharts';

const StudentCourses = lazy(() => import('@/features/student/courses'));
const StudentAnalytics = lazy(() => import('@/features/student/analytics'));
const StudentCalendar = lazy(() => import('@/features/student/calendar'));
const StudentAssignments = lazy(() => import('@/features/student/assignments'));
const StudentFees = lazy(() => import('@/features/student/fees'));
const StudentProfile = lazy(() => import('@/features/student/profile'));


// ─── Types ────────────────────────────────────────────────────────────────
interface StudentProfile {
    cgpa: number;
    total_credits: number;
    semester: number;
    department: string;
    enrollment_year: number;
}

interface AttendanceRecord {
    subject_code: string;
    subject_name: string;
    classes_attended: number;
    total_classes: number;
    percentage: number;
    status_badge: 'Safe' | 'Low' | 'Critical';
}

interface ScheduleItem {
    class_name: string;
    instructor: string;
    room: string;
    start_time: string;
    end_time: string;
    day_of_week: string;
}

interface Assignment {
    title: string;
    subject: string;
    deadline_date: string;
    urgency: 'Today' | 'This Week' | 'Later';
    status: 'Pending' | 'Submitted' | 'Graded';
}

interface PerformanceTrend {
    semester: number;
    semester_label: string;
    gpa: number;
}

interface DashboardData {
    user: { id: number; name: string; email: string; role: string };
    profile: StudentProfile | null;
    attendance: AttendanceRecord[];
    schedule: ScheduleItem[];
    assignments: Assignment[];
    performance: PerformanceTrend[];
}

// ─── Sidebar Nav Items ────────────────────────────────────────────────────
const navItems = [
    { icon: Home, label: 'Dashboard' },
    { icon: BookOpen, label: 'Courses' },
    { icon: BarChart3, label: 'Analytics' },
    { icon: Calendar, label: 'Calendar' },
    { icon: ClipboardList, label: 'Assignments' },
    { icon: Wallet, label: 'Fees & Fines' },
    { icon: User, label: 'My Profile' },
    { icon: HelpCircle, label: 'Help' },
];

// ─── Helper: format time string ──────────────────────────────────────────
function formatTime(timeStr: string): string {
    const [h, m] = timeStr.split(':');
    const hour = parseInt(h, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${m} ${ampm}`;
}

// ─── Helper: is class currently ongoing ──────────────────────────────────
function isOngoing(startTime: string, endTime: string): boolean {
    const now = new Date();
    const [sh, sm] = startTime.split(':').map(Number);
    const [eh, em] = endTime.split(':').map(Number);
    const currentMinutes = now.getHours() * 60 + now.getMinutes();
    return currentMinutes >= sh * 60 + sm && currentMinutes <= eh * 60 + em;
}

// ─── CGPA Circular Gauge ─────────────────────────────────────────────────
function CgpaGauge({ value, max = 10 }: { value: number; max?: number }) {
    const percentage = (value / max) * 100;
    const radius = 58;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
        <div className="relative w-36 h-36 mx-auto">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                {/* Background track */}
                <circle cx="70" cy="70" r={radius} fill="none" stroke="rgba(99,102,241,0.15)" strokeWidth="10" />
                {/* Gradient definition */}
                <defs>
                    <linearGradient id="cgpaGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#6366f1" />
                        <stop offset="50%" stopColor="#8b5cf6" />
                        <stop offset="100%" stopColor="#a78bfa" />
                    </linearGradient>
                </defs>
                {/* Progress arc */}
                <circle
                    cx="70" cy="70" r={radius} fill="none"
                    stroke="url(#cgpaGradient)" strokeWidth="10"
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-1000 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-3xl font-bold text-slate-900 dark:text-white">{value.toFixed(2)}</span>
                <span className="text-xs text-slate-500 dark:text-white/50 uppercase tracking-widest">CGPA</span>
            </div>
        </div>
    );
}

// ─── Skeleton Loaders ────────────────────────────────────────────────────
function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Header skeleton */}
            <div className="flex items-center justify-between">
                <Skeleton className="h-8 w-48 bg-slate-200 dark:bg-white/5" />
                <Skeleton className="h-8 w-32 bg-slate-200 dark:bg-white/5" />
            </div>
            {/* Top row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Skeleton className="h-56 rounded-xl bg-slate-200 dark:bg-white/5" />
                <Skeleton className="h-56 rounded-xl bg-slate-200 dark:bg-white/5 lg:col-span-2" />
            </div>
            {/* Middle row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <Skeleton className="h-72 rounded-xl bg-slate-200 dark:bg-white/5" />
                <Skeleton className="h-72 rounded-xl bg-slate-200 dark:bg-white/5" />
                <Skeleton className="h-72 rounded-xl bg-slate-200 dark:bg-white/5" />
            </div>
            {/* Bottom */}
            <Skeleton className="h-80 rounded-xl bg-slate-200 dark:bg-white/5" />
        </div>
    );
}

// ══════════════════════════════════════════════════════════════════════════
// MAIN DASHBOARD COMPONENT
// ══════════════════════════════════════════════════════════════════════════
export default function Dashboard() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<DashboardData | null>(null);
    const [activeSection, setActiveSection] = useState('dashboard');

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole') || 'Student';

    // Derived state for Header
    const displayUserName = data?.user?.name || userRole.charAt(0).toUpperCase() + userRole.slice(1);
    const initials = displayUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        async function fetchDashboard() {
            // If we have a userId, try fetching from API
            if (userId) {
                try {
                    const res = await fetch(`http://localhost:5000/api/dashboard/student/${userId}`);
                    const json = await res.json();
                    if (json.success) {
                        // Normalize MySQL DECIMAL strings → JS numbers
                        const d = json.data;
                        if (d.profile) {
                            d.profile.cgpa = Number(d.profile.cgpa);
                            d.profile.total_credits = Number(d.profile.total_credits);
                            d.profile.semester = Number(d.profile.semester);
                            d.profile.enrollment_year = Number(d.profile.enrollment_year);
                        }
                        if (d.attendance) {
                            d.attendance = d.attendance.map((a: AttendanceRecord) => ({
                                ...a,
                                classes_attended: Number(a.classes_attended),
                                total_classes: Number(a.total_classes),
                                percentage: Number(a.percentage),
                            }));
                        }
                        if (d.performance) {
                            d.performance = d.performance.map((p: PerformanceTrend) => ({
                                ...p,
                                semester: Number(p.semester),
                                gpa: Number(p.gpa),
                            }));
                        }
                        setData(d);
                        setLoading(false);
                        return;
                    }
                } catch {
                    // Fall through to demo data
                }
            }

            // Fallback: use demo data so the dashboard always renders
            const today = new Date();
            const fmt = (d: Date) => d.toISOString().split('T')[0];
            const add = (d: Date, n: number) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

            setData({
                user: { id: 0, name: displayUserName, email: 'student@erp.edu', role: 'student' },
                profile: { cgpa: 8.72, total_credits: 96, semester: 5, department: 'Computer Science', enrollment_year: 2024 },
                attendance: [
                    { subject_code: 'CS301', subject_name: 'Data Structures', classes_attended: 38, total_classes: 42, percentage: 90.48, status_badge: 'Safe' },
                    { subject_code: 'CS302', subject_name: 'Operating Systems', classes_attended: 35, total_classes: 42, percentage: 83.33, status_badge: 'Safe' },
                    { subject_code: 'CS303', subject_name: 'Database Systems', classes_attended: 30, total_classes: 42, percentage: 71.43, status_badge: 'Low' },
                    { subject_code: 'MA301', subject_name: 'Discrete Mathematics', classes_attended: 40, total_classes: 42, percentage: 95.24, status_badge: 'Safe' },
                    { subject_code: 'CS304', subject_name: 'Computer Networks', classes_attended: 28, total_classes: 42, percentage: 66.67, status_badge: 'Critical' },
                    { subject_code: 'HS301', subject_name: 'Technical Writing', classes_attended: 39, total_classes: 42, percentage: 92.86, status_badge: 'Safe' },
                ],
                schedule: [
                    { class_name: 'Data Structures', instructor: 'Dr. Sharma', room: 'Room 301', start_time: '09:00:00', end_time: '10:00:00', day_of_week: 'Monday' },
                    { class_name: 'Operating Systems', instructor: 'Prof. Gupta', room: 'Room 204', start_time: '10:15:00', end_time: '11:15:00', day_of_week: 'Monday' },
                    { class_name: 'Database Systems', instructor: 'Dr. Patel', room: 'Lab 102', start_time: '11:30:00', end_time: '12:30:00', day_of_week: 'Monday' },
                    { class_name: 'Discrete Mathematics', instructor: 'Prof. Rao', room: 'Room 405', start_time: '14:00:00', end_time: '15:00:00', day_of_week: 'Monday' },
                    { class_name: 'Computer Networks', instructor: 'Dr. Kumar', room: 'Room 301', start_time: '15:15:00', end_time: '16:15:00', day_of_week: 'Monday' },
                ],
                assignments: [
                    { title: 'Binary Tree Implementation', subject: 'Data Structures', deadline_date: fmt(today), urgency: 'Today', status: 'Pending' },
                    { title: 'ER Diagram for Library System', subject: 'Database Systems', deadline_date: fmt(add(today, 1)), urgency: 'This Week', status: 'Pending' },
                    { title: 'Process Scheduling Simulation', subject: 'Operating Systems', deadline_date: fmt(add(today, 3)), urgency: 'This Week', status: 'Pending' },
                    { title: 'Graph Theory Problem Set', subject: 'Discrete Mathematics', deadline_date: fmt(add(today, 5)), urgency: 'This Week', status: 'Pending' },
                    { title: 'Network Protocol Analysis', subject: 'Computer Networks', deadline_date: fmt(add(today, 10)), urgency: 'Later', status: 'Pending' },
                    { title: 'Technical Report Draft', subject: 'Technical Writing', deadline_date: fmt(add(today, 14)), urgency: 'Later', status: 'Submitted' },
                ],
                performance: [
                    { semester: 1, semester_label: 'Sem 1', gpa: 7.80 },
                    { semester: 2, semester_label: 'Sem 2', gpa: 8.10 },
                    { semester: 3, semester_label: 'Sem 3', gpa: 8.45 },
                    { semester: 4, semester_label: 'Sem 4', gpa: 8.90 },
                    { semester: 5, semester_label: 'Sem 5', gpa: 8.72 },
                ],
            });
            setLoading(false);
        }
        const timer = setTimeout(fetchDashboard, 800);
        return () => clearTimeout(timer);
    }, [userId, displayUserName]);

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        toast.info("Logged out successfully");
        navigate('/');
    };

    // Group assignments by urgency
    const groupedAssignments = useMemo(() => {
        if (!data) return { Today: [], 'This Week': [], Later: [] };
        const groups: Record<string, Assignment[]> = { Today: [], 'This Week': [], Later: [] };
        data.assignments.forEach(a => {
            if (groups[a.urgency]) groups[a.urgency].push(a);
        });
        return groups;
    }, [data]);

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex transition-colors duration-300">
            {/* ── Background Effects ─────────────────────────────────────────── */}
            <div className="fixed inset-0 -z-10 bg-slate-50 dark:bg-transparent transition-colors duration-300">
                <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 transition-colors duration-500" />
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/8 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 dark:bg-purple-600/8 blur-[100px]" />
            </div>

            {/* ── Sidebar ────────────────────────────────────────────────────── */}
            {/* Mobile overlay */}
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

            <motion.aside
                initial={false}
                animate={{ width: isMobile ? 280 : (sidebarOpen ? 240 : 72) }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className={`
          fixed top-0 left-0 h-full z-50 flex flex-col
          bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border-r border-slate-200 dark:border-white/[0.06]
          ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0
          transition-transform lg:transition-none
        `}
            >
                {/* Logo area */}
                <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-white/[0.06]">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                        <GraduationCap className="w-5 h-5 text-white" />
                    </div>
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-sm tracking-wide whitespace-nowrap text-slate-800 dark:text-white"
                            >
                                Student Portal
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                {/* Nav items */}
                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
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
                                        ? 'bg-indigo-500/10 dark:bg-indigo-500/15 text-indigo-600 dark:text-indigo-400 shadow-sm shadow-indigo-500/10'
                                        : 'text-slate-500 dark:text-white/50 hover:text-slate-900 dark:hover:text-white/80 hover:bg-slate-100 dark:hover:bg-white/[0.04]'
                                    }
                                `}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : ''}`} />
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

                {/* Collapse toggle (desktop) */}
                <div className="hidden lg:flex p-3 border-t border-slate-200 dark:border-white/[0.06]">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center py-2 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
                    >
                        {sidebarOpen ? <ChevronLeft className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>
                </div>
            </motion.aside>

            {/* ── Main Content Area ──────────────────────────────────────────── */}
            <motion.div
                initial={false}
                animate={{ marginLeft: isMobile ? 0 : (sidebarOpen ? 240 : 72) }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="flex-1 flex flex-col min-h-screen min-w-0"
            >
                {/* ── Top Header ──────────────────────────────────────────────── */}
                <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
                    {/* Mobile menu button */}
                    <button
                        className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white"
                        onClick={() => setMobileMenuOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-md hidden sm:block">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                            <input
                                type="text"
                                placeholder="Search courses, assignments..."
                                className="w-full h-9 pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-2 md:gap-3">
                        {/* Theme Toggle */}
                        <ThemeToggle />

                        {/* Notifications */}
                        <button className="relative p-2 rounded-lg text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-950" />
                        </button>

                        {/* Profile */}
                        <div className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors cursor-pointer outline-none">
                            <Avatar className="w-8 h-8">
                                <AvatarFallback className="bg-gradient-to-br from-indigo-500 to-purple-600 text-white text-xs font-bold">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden md:block text-left relative z-10">
                                <p className="text-xs font-medium text-slate-900 dark:text-white/90 leading-tight">{displayUserName}</p>
                                <p className="text-[10px] text-slate-500 dark:text-white/40 capitalize">{userRole}</p>
                            </div>
                        </div>

                        {/* Logout */}
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg text-slate-500 dark:text-white/40 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-red-500 dark:hover:text-red-400 transition-colors"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </header>

                {/* ── Page Content ────────────────────────────────────────────── */}
                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    {loading ? (
                        <DashboardSkeleton />
                    ) : !data ? (
                        <div className="flex flex-col items-center justify-center h-[60vh] text-center">
                            <LayoutDashboard className="w-16 h-16 text-slate-200 dark:text-white/20 mb-4" />
                            <h2 className="text-xl font-semibold text-slate-600 dark:text-white/60">No Dashboard Data</h2>
                            <p className="text-sm text-slate-400 dark:text-white/30 mt-2">Please log in with a student account to view dashboard data.</p>
                        </div>
                    ) : (
                        <AnimatePresence mode="wait">
                            {activeSection === 'dashboard' ? (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, y: 12 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -12 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6"
                                >
                                    <div className="px-1">
                                        <h1 className="text-xl md:text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
                                            Welcome back, <span className="bg-gradient-to-r from-indigo-500 to-purple-600 dark:from-indigo-400 dark:to-purple-400 bg-clip-text text-transparent">{displayUserName}</span>
                                        </h1>
                                        <p className="text-xs md:text-sm text-slate-500 dark:text-white/40 mt-1">
                                            Here's your academic overview for Semester {data.profile?.semester || '—'}
                                        </p>
                                    </div>

                                    {/* ═══ ROW 1: Academic Health + Attendance ═══════════════ */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Academic Health Card */}
                                        <Card className="bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl overflow-hidden relative group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <CardHeader className="pb-2">
                                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60 flex items-center gap-2">
                                                    <GraduationCap className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                    Academic Health
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <CgpaGauge value={data.profile?.cgpa || 0} />
                                                <div className="mt-4 flex items-center justify-center gap-6">
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.profile?.total_credits || 0}</p>
                                                        <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wider">Credits</p>
                                                    </div>
                                                    <div className="w-px h-10 bg-slate-200 dark:bg-white/10" />
                                                    <div className="text-center">
                                                        <p className="text-2xl font-bold text-slate-900 dark:text-white">{data.profile?.semester || 0}</p>
                                                        <p className="text-[10px] text-slate-400 dark:text-white/40 uppercase tracking-wider">Semester</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Attendance Tracker */}
                                        <Card className="bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl lg:col-span-2">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60 flex items-center gap-2">
                                                    <BookOpen className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                    Attendance Tracker
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
                                                    {data.attendance.map((att) => (
                                                        <div
                                                            key={att.subject_code}
                                                            className="p-3 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] transition-all duration-200 group/att"
                                                        >
                                                            <div className="flex items-start justify-between mb-2">
                                                                <div className="flex-1 min-w-0">
                                                                    <p className="text-xs font-semibold text-slate-900 dark:text-white/80 truncate">{att.subject_name}</p>
                                                                    <p className="text-[10px] text-slate-500 dark:text-white/30 mt-0.5">{att.subject_code}</p>
                                                                </div>
                                                                <Badge
                                                                    className={`text-[10px] px-1.5 py-0 border-0 ${att.status_badge === 'Safe'
                                                                        ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400'
                                                                        : att.status_badge === 'Low'
                                                                            ? 'bg-amber-100 text-amber-600 dark:bg-amber-500/15 dark:text-amber-400'
                                                                            : 'bg-red-100 text-red-600 dark:bg-red-500/15 dark:text-red-400'
                                                                        }`}
                                                                >
                                                                    {att.status_badge}
                                                                </Badge>
                                                            </div>
                                                            <div className="flex items-end justify-between">
                                                                <span className="text-xl font-bold text-slate-900 dark:text-white">
                                                                    {att.percentage.toFixed(1)}%
                                                                </span>
                                                                <span className="text-[10px] text-slate-500 dark:text-white/30">
                                                                    {att.classes_attended}/{att.total_classes}
                                                                </span>
                                                            </div>
                                                            <Progress
                                                                value={att.percentage}
                                                                className={`mt-2 h-1.5 ${att.status_badge === 'Safe'
                                                                    ? '[&>div]:bg-emerald-500'
                                                                    : att.status_badge === 'Low'
                                                                        ? '[&>div]:bg-amber-500'
                                                                        : '[&>div]:bg-red-500'
                                                                    }`}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* ═══ ROW 2: Schedule + Assignments + Quick Actions ═════ */}
                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Smart Schedule */}
                                        <Card className="bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60 flex items-center gap-2">
                                                    <Calendar className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                    Today's Classes
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                {data.schedule.length === 0 ? (
                                                    <div className="text-center py-8">
                                                        <Calendar className="w-10 h-10 text-slate-200 dark:text-white/10 mx-auto mb-2" />
                                                        <p className="text-sm text-slate-400 dark:text-white/30">No classes today</p>
                                                    </div>
                                                ) : (
                                                    <div className="relative space-y-0">
                                                        {/* Timeline line */}
                                                        <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/[0.08]" />

                                                        {data.schedule.map((cls, i) => {
                                                            const ongoing = isOngoing(cls.start_time, cls.end_time);
                                                            return (
                                                                <div key={i} className="relative flex items-start gap-4 py-2.5">
                                                                    {/* Dot */}
                                                                    <div className={`
                                                                        relative z-10 w-[9px] h-[9px] rounded-full mt-1.5 flex-shrink-0
                                                                        ${ongoing
                                                                            ? 'bg-indigo-500 dark:bg-indigo-400 ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/30'
                                                                            : 'bg-slate-300 dark:bg-white/20 ring-2 ring-slate-100 dark:ring-white/[0.06]'
                                                                        }
                                                                      `} style={{ marginLeft: '11px' }} />

                                                                    {/* Content */}
                                                                    <div className={`flex-1 p-2.5 rounded-lg transition-all duration-200 ${ongoing
                                                                        ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20'
                                                                        : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'
                                                                        }`}>
                                                                        <div className="flex items-center gap-2">
                                                                            <p className={`text-xs font-semibold ${ongoing ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-white/70'}`}>
                                                                                {cls.class_name}
                                                                            </p>
                                                                            {ongoing && (
                                                                                <Badge className="bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-300 text-[9px] px-1.5 py-0 border-0 animate-pulse">
                                                                                    LIVE
                                                                                </Badge>
                                                                            )}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-500 dark:text-white/30">
                                                                            <Clock className="w-3 h-3" />
                                                                            <span>{formatTime(cls.start_time)} – {formatTime(cls.end_time)}</span>
                                                                            <span>•</span>
                                                                            <span>{cls.room}</span>
                                                                        </div>
                                                                        <p className="text-[10px] text-slate-400 dark:text-white/20 mt-0.5">{cls.instructor}</p>
                                                                    </div>
                                                                </div>
                                                            );
                                                        })}
                                                    </div>
                                                )}
                                            </CardContent>
                                        </Card>

                                        {/* Assignment Heatmap */}
                                        <Card className="bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60 flex items-center gap-2">
                                                    <ClipboardList className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                    Upcoming Deadlines
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent>
                                                <Tabs defaultValue="Today">
                                                    <TabsList className="w-full bg-slate-100 dark:bg-white/[0.04] border border-transparent dark:border-white/[0.06]">
                                                        {(['Today', 'This Week', 'Later'] as const).map(tab => (
                                                            <TabsTrigger
                                                                key={tab}
                                                                value={tab}
                                                                className="flex-1 text-xs data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-500/20 data-[state=active]:text-indigo-700 dark:data-[state=active]:text-indigo-300"
                                                            >
                                                                {tab}
                                                                {groupedAssignments[tab].length > 0 && (
                                                                    <span className="ml-1.5 w-4 h-4 rounded-full bg-slate-200 dark:bg-white/10 text-[9px] flex items-center justify-center">
                                                                        {groupedAssignments[tab].length}
                                                                    </span>
                                                                )}
                                                            </TabsTrigger>
                                                        ))}
                                                    </TabsList>
                                                    {(['Today', 'This Week', 'Later'] as const).map(tab => (
                                                        <TabsContent key={tab} value={tab} className="mt-3 space-y-2">
                                                            {groupedAssignments[tab].length === 0 ? (
                                                                <div className="text-center py-6">
                                                                    <CheckCircle2 className="w-8 h-8 text-emerald-500/30 mx-auto mb-2" />
                                                                    <p className="text-xs text-slate-400 dark:text-white/30">All clear!</p>
                                                                </div>
                                                            ) : (
                                                                groupedAssignments[tab].map((a, i) => (
                                                                    <div
                                                                        key={i}
                                                                        className={`p-3 rounded-lg border transition-all duration-200 hover:scale-[1.01] ${tab === 'Today'
                                                                            ? 'bg-red-50 dark:bg-red-500/5 border-red-200 dark:border-red-500/15 hover:border-red-300 dark:hover:border-red-500/30'
                                                                            : tab === 'This Week'
                                                                                ? 'bg-amber-50 dark:bg-amber-500/5 border-amber-200 dark:border-amber-500/15 hover:border-amber-300 dark:hover:border-amber-500/30'
                                                                                : 'bg-slate-50 dark:bg-white/[0.02] border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12]'
                                                                            }`}
                                                                    >
                                                                        <div className="flex items-start justify-between">
                                                                            <div className="flex-1 min-w-0">
                                                                                <p className="text-xs font-semibold text-slate-900 dark:text-white/80 truncate">{a.title}</p>
                                                                                <p className="text-[10px] text-slate-500 dark:text-white/30 mt-0.5">{a.subject}</p>
                                                                            </div>
                                                                            {a.status === 'Submitted' ? (
                                                                                <CheckCircle2 className="w-4 h-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                                                                            ) : tab === 'Today' ? (
                                                                                <AlertTriangle className="w-4 h-4 text-red-500 dark:text-red-400 flex-shrink-0" />
                                                                            ) : null}
                                                                        </div>
                                                                        <div className="flex items-center gap-1 mt-1.5 text-[10px] text-slate-400 dark:text-white/25">
                                                                            <Clock className="w-3 h-3" />
                                                                            <span>{new Date(a.deadline_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                                                                        </div>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </TabsContent>
                                                    ))}
                                                </Tabs>
                                            </CardContent>
                                        </Card>

                                        {/* Quick Actions */}
                                        <Card className="bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl">
                                            <CardHeader className="pb-3">
                                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60 flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                    Quick Actions
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="space-y-3">
                                                {[
                                                    { icon: FileText, label: 'Apply Leave', desc: 'Submit a leave application', gradient: 'from-blue-500 to-indigo-600', shadow: 'shadow-blue-500/20' },
                                                    { icon: CreditCard, label: 'View Hall Ticket', desc: 'Download exam hall ticket', gradient: 'from-purple-500 to-pink-600', shadow: 'shadow-purple-500/20' },
                                                    { icon: CreditCard, label: 'Pay Fees', desc: 'Online fee payment portal', gradient: 'from-emerald-500 to-teal-600', shadow: 'shadow-emerald-500/20' },
                                                ].map((action) => (
                                                    <button
                                                        key={action.label}
                                                        className="w-full flex items-center gap-4 p-3.5 rounded-xl bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] hover:border-slate-300 dark:hover:border-white/[0.12] hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-all duration-200 group/action text-left"
                                                    >
                                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${action.gradient} flex items-center justify-center flex-shrink-0 shadow-lg ${action.shadow} group-hover/action:scale-110 transition-transform duration-200`}>
                                                            <action.icon className="w-5 h-5 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-sm font-medium text-slate-900 dark:text-white/80 group-hover/action:text-indigo-600 dark:group-hover/action:text-white transition-colors">{action.label}</p>
                                                            <p className="text-[10px] text-slate-500 dark:text-white/30">{action.desc}</p>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-slate-400 dark:text-white/20 group-hover/action:text-indigo-500 dark:group-hover/action:text-white/50 group-hover/action:translate-x-0.5 transition-all" />
                                                    </button>
                                                ))}
                                            </CardContent>
                                        </Card>
                                    </div>

                                    {/* ═══ ROW 3: Performance Chart ══════════════════════════ */}
                                    <Card className="bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl">
                                        <CardHeader className="pb-2">
                                            <div className="flex items-center justify-between">
                                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60 flex items-center gap-2">
                                                    <TrendingUp className="w-4 h-4 text-indigo-500 dark:text-indigo-400" />
                                                    GPA Performance Trend
                                                </CardTitle>
                                                <Badge className="bg-indigo-100 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 border-indigo-200 dark:border-indigo-500/20 text-[10px]">
                                                    {data.performance.length} Semesters
                                                </Badge>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="h-64 md:h-72">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <AreaChart data={data.performance} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                                                        <defs>
                                                            <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                                                                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                                                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                                            </linearGradient>
                                                        </defs>
                                                        <CartesianGrid strokeDasharray="3 3" stroke="currentColor" className="opacity-5 dark:opacity-10 text-slate-900 dark:text-white" />
                                                        <XAxis
                                                            dataKey="semester_label"
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }}
                                                            className="text-slate-500 dark:text-white"
                                                        />
                                                        <YAxis
                                                            domain={[6, 10]}
                                                            axisLine={false}
                                                            tickLine={false}
                                                            tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }}
                                                            className="text-slate-500 dark:text-white"
                                                        />
                                                        <Tooltip
                                                            contentStyle={{
                                                                background: 'var(--tw-backdrop-blur)',
                                                                backgroundColor: 'rgba(var(--background-rgb, 15, 23, 42), 0.95)',
                                                                border: '1px solid currentColor',
                                                                borderColor: 'rgba(99, 102, 241, 0.3)',
                                                                borderRadius: '12px',
                                                                backdropFilter: 'blur(10px)',
                                                                boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                                                            }}
                                                            labelStyle={{ color: 'currentColor', opacity: 0.7, fontSize: 11 }}
                                                            itemStyle={{ color: '#6366f1', fontSize: 13, fontWeight: 600 }}
                                                            wrapperClassName="dark:!bg-slate-900/95 !bg-white/95 !border-indigo-500/30 !text-slate-900 dark:!text-white"
                                                        />
                                                        <Area
                                                            type="monotone"
                                                            dataKey="gpa"
                                                            stroke="#6366f1"
                                                            strokeWidth={2.5}
                                                            fill="url(#gpaGradient)"
                                                            dot={{ r: 4, fill: '#6366f1', strokeWidth: 2, stroke: 'currentColor', className: 'text-white dark:text-[#1e1b4b]' }}
                                                            activeDot={{ r: 6, fill: '#818cf8', strokeWidth: 2, stroke: 'currentColor', className: 'text-indigo-100 dark:text-[#312e81]' }}
                                                        />
                                                    </AreaChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ) : activeSection === 'courses' ? (
                                <Suspense fallback={<DashboardSkeleton />}><StudentCourses /></Suspense>
                            ) : activeSection === 'analytics' ? (
                                <Suspense fallback={<DashboardSkeleton />}><StudentAnalytics /></Suspense>
                            ) : activeSection === 'calendar' ? (
                                <Suspense fallback={<DashboardSkeleton />}><StudentCalendar /></Suspense>
                            ) : activeSection === 'assignments' ? (
                                <Suspense fallback={<DashboardSkeleton />}><StudentAssignments /></Suspense>
                            ) : activeSection === 'fees & fines' ? (
                                <Suspense fallback={<DashboardSkeleton />}>
                                    <StudentFees />
                                </Suspense>
                            ) : activeSection === 'my profile' ? (
                                <Suspense fallback={<DashboardSkeleton />}>
                                    <StudentProfile />
                                </Suspense>
                            ) : (
                                <motion.div
                                    key="placeholder"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    className="flex flex-col items-center justify-center h-[60vh] text-center"
                                >
                                    <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                                        {navItems.find(i => i.label.toLowerCase() === activeSection)?.icon && (
                                            (() => {
                                                const Icon = navItems.find(i => i.label.toLowerCase() === activeSection)!.icon;
                                                return <Icon className="w-10 h-10 text-indigo-500" />;
                                            })()
                                        )}
                                    </div>
                                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white capitalize">{activeSection} Section</h2>
                                    <p className="text-slate-500 dark:text-white/40 mt-2 max-w-md">
                                        The {activeSection} module is currently under development. This section will soon provide comprehensive tools and features tailored for your academic journey.
                                    </p>
                                    <button
                                        onClick={() => setActiveSection('dashboard')}
                                        className="mt-8 px-6 py-2 rounded-lg border border-indigo-500/30 text-indigo-600 dark:text-indigo-400 hover:bg-indigo-500/10 transition-colors font-medium"
                                    >
                                        Back to Dashboard
                                    </button>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    )}
                </main>
            </motion.div>
        </div >
    );
}
