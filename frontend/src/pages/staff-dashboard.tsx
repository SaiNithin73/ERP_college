import { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LogOut, Users, BookOpen, Calendar, ChevronLeft, ChevronRight,
    Search, Bell, Menu, CheckCircle2, XCircle, LayoutDashboard,
    Briefcase, FileText, BarChart3, Clock, TestTube,
    IndianRupee, GraduationCap, User, ClipboardEdit
} from 'lucide-react';
import { toast } from 'sonner';

// Shadcn UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList,
    BreadcrumbPage, BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Other components
import { ThemeToggle } from '@/components/theme-toggle';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';

const StaffAttendance = lazy(() => import('@/features/staff/attendance'));
const StaffLeaves = lazy(() => import('@/features/staff/leaves'));
const StaffResearch = lazy(() => import('@/features/staff/research'));
const StaffQuestionPapers = lazy(() => import('@/features/staff/question-papers'));
const StaffSalary = lazy(() => import('@/features/staff/salary'));
const StaffAnnouncements = lazy(() => import('@/features/staff/announcements'));
const StaffClassManagement = lazy(() => import('@/features/staff/class-management'));
const StaffProfile = lazy(() => import('@/features/staff/profile'));

const LazyFallback = () => <div className="h-[60vh] w-full animate-pulse bg-slate-100 dark:bg-white/5 rounded-xl" />;

// ─── Types ────────────────────────────────────────────────────────────────

interface ScheduleItem {
    id: number;
    class_name: string;
    room: string;
    start_time: string;
    end_time: string;
    attended: boolean;
}

interface PendingRequest {
    id: number;
    student_name: string;
    roll_number: string;
    type: 'Leave' | 'OD';
    reason: string;
    dates: string;
    status: 'Pending' | 'Approved' | 'Rejected';
}

interface StaffDashboardData {
    user?: { name: string; email: string; role: string; };
    stats: {
        assigned_courses: number;
        leave_balance: number;
        pending_tasks: number;
        total_mentees: number;
    };
    schedule: ScheduleItem[];
    pending_requests: PendingRequest[];
    attendance_trends: { subject: string; percentage: number }[];
}

// ─── Sidebar Nav Items ────────────────────────────────────────────────────
const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard' },
    { icon: Users, label: 'Attendance' },
    { icon: FileText, label: 'Leave Requests' },
    { icon: TestTube, label: 'Research' },
    { icon: ClipboardEdit, label: 'Question Papers' },
    { icon: IndianRupee, label: 'Salary' },
    { icon: Bell, label: 'Announcements' },
    { icon: GraduationCap, label: 'Class Management' },
    { icon: User, label: 'My Profile' },
];

export default function StaffDashboard() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<StaffDashboardData | null>(null);
    const [activeSection, setActiveSection] = useState('dashboard');

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole') || 'Staff';

    // Derived state for Header
    const displayUserName = data?.user?.name || userRole.charAt(0).toUpperCase() + userRole.slice(1);
    const initials = displayUserName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

    useEffect(() => {
        // Fetch or mock data
        async function fetchDashboard() {
            try {
                if (userId) {
                    const res = await fetch(`http://localhost:5000/api/dashboard/staff/${userId}`);
                    const json = await res.json();
                    if (json.success) {
                        setData(json.data);
                        setLoading(false);
                        return;
                    }
                }
            } catch (err) {
                console.error("Failed to fetch, using mock data");
            }

            // Fallback mock data
            setTimeout(() => {
                setData({
                    stats: { assigned_courses: 4, leave_balance: 12, pending_tasks: 7, total_mentees: 24 },
                    schedule: [
                        { id: 1, class_name: 'CS301 - Data Structures', room: 'Room 301', start_time: '09:00:00', end_time: '10:00:00', attended: true },
                        { id: 2, class_name: 'CS302 - Operating Systems', room: 'Room 204', start_time: '10:15:00', end_time: '11:15:00', attended: false },
                        { id: 3, class_name: 'Mentoring Batch A', room: 'Lab 102', start_time: '11:30:00', end_time: '12:30:00', attended: false },
                        { id: 4, class_name: 'Faculty Meeting', room: 'Conference Hall', start_time: '14:00:00', end_time: '15:00:00', attended: false },
                    ],
                    pending_requests: [
                        { id: 101, student_name: 'Alice Johnson', roll_number: 'CS24001', type: 'Leave', reason: 'Medical', dates: '12 Nov - 14 Nov', status: 'Pending' },
                        { id: 102, student_name: 'Bob Smith', roll_number: 'CS24045', type: 'OD', reason: 'Hackathon', dates: '15 Nov - 16 Nov', status: 'Pending' },
                        { id: 103, student_name: 'Charlie Davis', roll_number: 'CS24012', type: 'Leave', reason: 'Family Event', dates: '18 Nov', status: 'Pending' },
                    ],
                    attendance_trends: [
                        { subject: 'Data Structures', percentage: 92 },
                        { subject: 'Operating Sys.', percentage: 85 },
                        { subject: 'Algorithm Des.', percentage: 78 },
                        { subject: 'Computer Net.', percentage: 89 },
                    ]
                });
                setLoading(false);
            }, 800);
        }
        fetchDashboard();
    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('role');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        toast.info("Logged out successfully");
        navigate('/');
    };

    const handleAction = async (requestId: number, action: 'Approved' | 'Rejected') => {
        // Optimistic UI Update
        if (!data) return;
        const updatedRequests = data.pending_requests.map((req) =>
            req.id === requestId ? { ...req, status: action } : req
        );
        setData({ ...data, pending_requests: updatedRequests });

        try {
            await fetch(`http://localhost:5000/api/leave-status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ requestId, status: action, staffId: userId })
            });
            toast.success(`Request ${action.toLowerCase()}`);
        } catch (error) {
            toast.error("Failed to update status");
            // Revert on failure (simplified)
        }
    };

    const formatTime = (timeStr: string) => {
        const [h, m] = timeStr.split(':');
        const hour = parseInt(h, 10);
        const ampm = hour >= 12 ? 'PM' : 'AM';
        const displayHour = hour % 12 || 12;
        return `${displayHour}:${m} ${ampm}`;
    };

    const isOngoing = (startTime: string, endTime: string): boolean => {
        const now = new Date();
        const [sh, sm] = startTime.split(':').map(Number);
        const [eh, em] = endTime.split(':').map(Number);
        const currentMinutes = now.getHours() * 60 + now.getMinutes();
        return currentMinutes >= sh * 60 + sm && currentMinutes <= eh * 60 + em;
    };

    return (
        <div className="min-h-screen w-full bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white flex transition-colors duration-300">
            {/* ── Background Effects ─────────────────────────────────────────── */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 dark:bg-gradient-to-br dark:from-slate-950 dark:via-indigo-950/30 dark:to-slate-950 transition-colors duration-500" />
                <div className="absolute top-0 left-1/3 w-[600px] h-[600px] rounded-full bg-indigo-500/10 dark:bg-indigo-600/8 blur-[120px]" />
                <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full bg-purple-500/10 dark:bg-purple-600/8 blur-[100px]" />
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
                    bg-white/80 dark:bg-white/[0.03] backdrop-blur-xl border-r border-slate-200 dark:border-white/[0.06]
                    ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0
                    transition-transform lg:transition-none
                `}
            >
                <div className="h-16 flex items-center gap-3 px-4 border-b border-slate-200 dark:border-white/[0.06]">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-indigo-500/20">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-sm tracking-wide whitespace-nowrap"
                            >
                                Staff Portal
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

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

                <div className="hidden lg:flex p-3 border-t border-slate-200 dark:border-white/[0.06]">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center py-2 rounded-lg text-slate-400 dark:text-white/40 hover:text-slate-600 dark:hover:text-white/70 hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors"
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
                <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-slate-200 dark:border-white/[0.06] bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
                    <div className="flex items-center gap-4">
                        <button
                            className="lg:hidden p-2 rounded-lg text-slate-500 dark:text-white/60 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <Breadcrumb className="hidden md:flex">
                            <BreadcrumbList>
                                <BreadcrumbItem>
                                    <BreadcrumbLink href="#" className="text-slate-500 dark:text-white/60">Staff</BreadcrumbLink>
                                </BreadcrumbItem>
                                <BreadcrumbSeparator className="text-slate-500 dark:text-white/40" />
                                <BreadcrumbItem>
                                    <BreadcrumbPage className="text-slate-900 dark:text-white/90">Dashboard</BreadcrumbPage>
                                </BreadcrumbItem>
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="hidden sm:block relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 dark:text-white/30" />
                            <input
                                type="text"
                                placeholder="Search here..."
                                className="w-full h-9 pl-10 pr-4 rounded-lg bg-slate-100 dark:bg-white/[0.04] border border-transparent dark:border-white/[0.08] text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-white/30 focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition-all outline-none"
                            />
                        </div>

                        <ThemeToggle />

                        <button className="relative p-2 rounded-lg text-slate-500 dark:text-white/50 hover:bg-slate-100 dark:hover:bg-white/[0.04] hover:text-slate-900 dark:hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-500 ring-2 ring-white dark:ring-slate-950" />
                        </button>

                        <button 
                            onClick={handleLogout}
                            title="Logout"
                            className="p-2 rounded-lg text-red-500 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-300 transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
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
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-[hsl(var(--surface-raised))] border-border shadow-lg">
                                <DropdownMenuItem onClick={() => setActiveSection('my profile')} className="cursor-pointer">
                                    <User className="mr-2 h-4 w-4" />
                                    My Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem disabled title="Coming soon">
                                    <Bell className="mr-2 h-4 w-4" />
                                    Notifications
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem 
                                    onClick={handleLogout}
                                    className="text-destructive focus:text-destructive focus:bg-destructive/10 cursor-pointer"
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                {/* Dashboard Content */}
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
                                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl bg-slate-200 dark:bg-white/5" />)}
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Skeleton className="h-96 rounded-xl bg-slate-200 dark:bg-white/5" />
                                    <Skeleton className="h-96 rounded-xl lg:col-span-2 bg-slate-200 dark:bg-white/5" />
                                </div>
                            </motion.div>
                        ) : activeSection === 'dashboard' ? (
                            data ? (
                                <motion.div
                                    key="dashboard"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    {/* Stats Row */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 tracking-tight">
                                        <Card className="bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl hover:shadow-lg transition-shadow overflow-hidden relative group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60">Assigned Courses</CardTitle>
                                                <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-500/10 flex items-center justify-center">
                                                    <BookOpen className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                                                </div>
                                            </CardHeader>
                                            <CardContent><div className="text-3xl font-bold text-slate-900 dark:text-white">{data.stats.assigned_courses}</div></CardContent>
                                        </Card>
                                        <Card className="bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl hover:shadow-lg transition-shadow overflow-hidden relative group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60">Total Mentees</CardTitle>
                                                <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center">
                                                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                                </div>
                                            </CardHeader>
                                            <CardContent><div className="text-3xl font-bold text-slate-900 dark:text-white">{data.stats.total_mentees}</div></CardContent>
                                        </Card>
                                        <Card className="bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl hover:shadow-lg transition-shadow overflow-hidden relative group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60">Pending Tasks</CardTitle>
                                                <div className="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-500/10 flex items-center justify-center">
                                                    <CheckCircle2 className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                                                </div>
                                            </CardHeader>
                                            <CardContent><div className="text-3xl font-bold text-slate-900 dark:text-white">{data.stats.pending_tasks}</div></CardContent>
                                        </Card>
                                        <Card className="bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl hover:shadow-lg transition-shadow overflow-hidden relative group">
                                            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                            <CardHeader className="flex flex-row items-center justify-between pb-2">
                                                <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60">Leave Balance</CardTitle>
                                                <div className="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center">
                                                    <Calendar className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                </div>
                                            </CardHeader>
                                            <CardContent><div className="text-3xl font-bold text-slate-900 dark:text-white">{data.stats.leave_balance}</div></CardContent>
                                        </Card>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* Timeline Column */}
                                        <Card className="lg:col-span-1 bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl">
                                            <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                                <CardTitle className="text-sm font-medium text-slate-700 dark:text-white/80 flex items-center gap-2">
                                                    <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                    Daily Schedule
                                                </CardTitle>
                                            </CardHeader>
                                            <CardContent className="pt-5">
                                                <div className="relative space-y-0 pl-1">
                                                    <div className="absolute left-[15px] top-2 bottom-2 w-px bg-slate-200 dark:bg-white/[0.08]" />
                                                    {data.schedule.length === 0 ? (
                                                        <p className="text-center text-sm text-slate-400 dark:text-white/30 py-8">No scheduled classes today</p>
                                                    ) : (
                                                        data.schedule.map((cls, i) => {
                                                            const ongoing = isOngoing(cls.start_time, cls.end_time);
                                                            return (
                                                                <div key={i} className="relative flex items-start gap-4 py-3">
                                                                    <div className={`relative z-10 w-[10px] h-[10px] rounded-full mt-1.5 flex-shrink-0 ${ongoing ? 'bg-indigo-500 ring-4 ring-indigo-500/20 shadow-lg shadow-indigo-500/30' : 'bg-slate-300 dark:bg-white/20 ring-2 ring-white dark:ring-white/[0.06]'}`} style={{ marginLeft: '10.5px' }} />
                                                                    <div className={`flex-1 p-3 rounded-lg transition-all duration-200 ${ongoing ? 'bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-100 dark:border-indigo-500/20' : 'hover:bg-slate-50 dark:hover:bg-white/[0.02]'}`}>
                                                                        <div className="flex items-center justify-between">
                                                                            <p className={`text-sm font-semibold tracking-tight ${ongoing ? 'text-indigo-600 dark:text-indigo-300' : 'text-slate-700 dark:text-white/80'}`}>{cls.class_name}</p>
                                                                            {ongoing && <Badge className="bg-indigo-100 text-indigo-700 dark:bg-indigo-500/20 dark:text-indigo-300 border-0 text-[10px] px-1.5 py-0 animate-pulse">LIVE</Badge>}
                                                                        </div>
                                                                        <div className="flex items-center gap-2 mt-1.5 text-[11px] text-slate-500 dark:text-white/40">
                                                                            <span>{formatTime(cls.start_time)} – {formatTime(cls.end_time)}</span>
                                                                            <span>•</span>
                                                                            <span>{cls.room}</span>
                                                                        </div>
                                                                        {ongoing && !cls.attended && (
                                                                            <Button size="sm" className="w-full mt-3 h-8 bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-md">Mark Attendance</Button>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            );
                                                        })
                                                    )}
                                                </div>
                                            </CardContent>
                                        </Card>

                                        {/* Approvals & Charts Column */}
                                        <div className="lg:col-span-2 space-y-6">
                                            {/* Requests Table */}
                                            <Card className="bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl">
                                                <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/[0.06] flex flex-row items-center justify-between">
                                                    <CardTitle className="text-sm font-medium text-slate-700 dark:text-white/80 flex items-center gap-2">
                                                        <FileText className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                        Pending Approvals
                                                    </CardTitle>
                                                    <Badge variant="outline" className="dark:border-white/[0.1] text-xs font-normal">
                                                        {data.pending_requests.filter(r => r.status === 'Pending').length} Pending
                                                    </Badge>
                                                </CardHeader>
                                                <CardContent className="pt-0 px-0">
                                                    <div className="overflow-x-auto">
                                                        <Table>
                                                            <TableHeader className="bg-slate-50/50 dark:bg-white/[0.02]">
                                                                <TableRow className="border-slate-100 dark:border-white/[0.06] hover:bg-transparent">
                                                                    <TableHead className="text-slate-500 dark:text-white/40 font-medium">Student</TableHead>
                                                                    <TableHead className="text-slate-500 dark:text-white/40 font-medium">Type</TableHead>
                                                                    <TableHead className="text-slate-500 dark:text-white/40 font-medium">Reason</TableHead>
                                                                    <TableHead className="text-slate-500 dark:text-white/40 font-medium">Dates</TableHead>
                                                                    <TableHead className="text-right text-slate-500 dark:text-white/40 font-medium">Action</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {data.pending_requests.map((req) => (
                                                                    <TableRow key={req.id} className="border-slate-100 dark:border-white/[0.06] hover:bg-slate-50 dark:hover:bg-white/[0.02] transition-colors">
                                                                        <TableCell>
                                                                            <p className="font-semibold text-sm text-slate-800 dark:text-white/90">{req.student_name}</p>
                                                                            <p className="text-[11px] text-slate-400 dark:text-white/40">{req.roll_number}</p>
                                                                        </TableCell>
                                                                        <TableCell>
                                                                            <Badge variant="secondary" className={`text-[10px] ${req.type === 'Leave' ? 'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400' : 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400'} border-0`}>
                                                                                {req.type}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-sm text-slate-600 dark:text-white/60 max-w-[150px] truncate">{req.reason}</TableCell>
                                                                        <TableCell className="text-[11px] text-slate-500 dark:text-white/40 whitespace-nowrap">{req.dates}</TableCell>
                                                                        <TableCell className="text-right">
                                                                            {req.status === 'Pending' ? (
                                                                                <div className="flex items-center justify-end gap-2">
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="outline"
                                                                                        className="h-7 w-7 border-emerald-200 dark:border-emerald-500/20 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors"
                                                                                        onClick={() => handleAction(req.id, 'Approved')}
                                                                                    >
                                                                                        <CheckCircle2 className="h-4 w-4" />
                                                                                    </Button>
                                                                                    <Button
                                                                                        size="icon"
                                                                                        variant="outline"
                                                                                        className="h-7 w-7 border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                                                                                        onClick={() => handleAction(req.id, 'Rejected')}
                                                                                    >
                                                                                        <XCircle className="h-4 w-4" />
                                                                                    </Button>
                                                                                </div>
                                                                            ) : (
                                                                                <Badge className={`text-[10px] border-0 px-2.5 py-0.5 ${req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400' : 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400'}`}>
                                                                                    {req.status}
                                                                                </Badge>
                                                                            )}
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* Attendance Heatmap / BarChart */}
                                            <Card className="bg-white/50 dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.06] backdrop-blur-xl">
                                                <CardHeader className="pb-3 border-b border-slate-100 dark:border-white/[0.06]">
                                                    <CardTitle className="text-sm font-medium text-slate-700 dark:text-white/80 flex items-center gap-2">
                                                        <BarChart3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                                                        Course Attendance Trends
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-6">
                                                    <div className="h-64">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <BarChart data={data.attendance_trends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                                                <defs>
                                                                    <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                                                                        <stop offset="0%" stopColor="#818cf8" stopOpacity={0.9} />
                                                                        <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.7} />
                                                                    </linearGradient>
                                                                </defs>
                                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
                                                                <XAxis
                                                                    dataKey="subject"
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }}
                                                                    dy={10}
                                                                />
                                                                <YAxis
                                                                    axisLine={false}
                                                                    tickLine={false}
                                                                    tick={{ fill: 'currentColor', opacity: 0.5, fontSize: 11 }}
                                                                    domain={[0, 100]}
                                                                />
                                                                <Tooltip
                                                                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                                                                    contentStyle={{
                                                                        backgroundColor: 'rgba(15, 23, 42, 0.95)',
                                                                        border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                        borderRadius: '8px',
                                                                        backdropFilter: 'blur(10px)',
                                                                        color: 'white',
                                                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)'
                                                                    }}
                                                                    itemStyle={{ color: '#818cf8', fontWeight: 600 }}
                                                                />
                                                                <Bar
                                                                    dataKey="percentage"
                                                                    fill="url(#barGradient)"
                                                                    radius={[6, 6, 0, 0]}
                                                                    barSize={32}
                                                                    animationDuration={1500}
                                                                />
                                                            </BarChart>
                                                        </ResponsiveContainer>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-center items-center h-full text-slate-500 dark:text-white/40"
                                >
                                    Error loading data.
                                </motion.div>
                            )
                        ) : activeSection === 'attendance' ? (
                            <Suspense fallback={<LazyFallback />}><StaffAttendance /></Suspense>
                        ) : activeSection === 'leave requests' ? (
                            <Suspense fallback={<LazyFallback />}><StaffLeaves /></Suspense>
                        ) : activeSection === 'research' ? (
                            <Suspense fallback={<LazyFallback />}><StaffResearch /></Suspense>
                        ) : activeSection === 'question papers' ? (
                            <Suspense fallback={<LazyFallback />}><StaffQuestionPapers /></Suspense>
                        ) : activeSection === 'salary' ? (
                            <Suspense fallback={<LazyFallback />}><StaffSalary /></Suspense>
                        ) : activeSection === 'announcements' ? (
                            <Suspense fallback={<LazyFallback />}><StaffAnnouncements /></Suspense>
                        ) : activeSection === 'class management' ? (
                            <Suspense fallback={<LazyFallback />}><StaffClassManagement /></Suspense>
                        ) : activeSection === 'my profile' ? (
                            <Suspense fallback={<LazyFallback />}><StaffProfile staffData={data?.user} /></Suspense>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-indigo-500/10 flex items-center justify-center mb-6">
                                    {(() => {
                                        const Icon = navItems.find(i => i.label.toLowerCase() === activeSection)?.icon || LayoutDashboard;
                                        return <Icon className="w-10 h-10 text-indigo-600 dark:text-indigo-400" />;
                                    })()}
                                </div>
                                <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2 capitalize">
                                    {activeSection} Section
                                </h2>
                                <p className="text-slate-500 dark:text-white/60 max-w-md mb-8">
                                    This module is currently under development. We're working hard to bring you a comprehensive {activeSection} management experience.
                                </p>
                                <Button
                                    onClick={() => setActiveSection('dashboard')}
                                    variant="outline"
                                    className="gap-2 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5"
                                >
                                    <LayoutDashboard className="w-4 h-4" />
                                    Back to Dashboard
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </motion.div>
        </div>
    );
}
