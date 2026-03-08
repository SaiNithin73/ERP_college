import { useEffect, useState, lazy, Suspense } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Activity, Database, Server, Users, Settings, Search, AlertTriangle, ShieldCheck, Download, LogOut, ChevronLeft, ChevronRight, Menu, LayoutDashboard, GraduationCap, Briefcase, Bell, User } from 'lucide-react';
import { toast } from 'sonner';

// Shadcn UI
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
// Recharts
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';

// Theme
import { ThemeToggle } from '@/components/theme-toggle';

const AdminPortalMonitor = lazy(() => import('@/features/admin/portal-monitor'));
const AdminStudentManager = lazy(() => import('@/features/admin/student-manager'));
const AdminStaffManager = lazy(() => import('@/features/admin/staff-manager'));
const AdminSystemHealth = lazy(() => import('@/features/admin/system-health'));
const AdminAnnouncements = lazy(() => import('@/features/admin/announcements'));
const AdminProfile = lazy(() => import('@/features/admin/profile'));

const LazyFallback = () => <div className="h-[60vh] w-full animate-pulse bg-zinc-100 dark:bg-white/5 rounded-xl" />;

// --- Types ---
interface SystemStats {
    active_sessions: { count: number };
    server_uptime: { days: number; hours: number };
    database_size: { size: string };
    permissions_matrix: any;
}

interface AuditLog {
    id: number;
    action: string;
    ip_address: string;
    timestamp: string;
}

interface AdminData {
    user: { name: string; email: string; role: string; };
    recent_logs: AuditLog[];
    system_stats: SystemStats;
}

interface MockUser {
    id: string;
    name: string;
    email: string;
    role: string;
    mfa: boolean;
    status: 'Active' | 'Inactive' | 'Locked';
}

// --- Mock Data ---
const mockUsersTable: MockUser[] = [
    { id: 'USR-1001', name: 'Dr. Sarah Connor', email: 'sarah.c@univ.edu', role: 'Management', mfa: true, status: 'Active' },
    { id: 'USR-1045', name: 'Prof. Alan Turing', email: 'alan.t@univ.edu', role: 'Staff', mfa: true, status: 'Active' },
    { id: 'USR-2941', name: 'John Doe', email: 'john.d@student.univ.edu', role: 'Student', mfa: false, status: 'Locked' },
    { id: 'USR-3012', name: 'Jane Smith', email: 'jane.s@student.univ.edu', role: 'Student', mfa: true, status: 'Active' },
    { id: 'USR-0002', name: 'Admin Root', email: 'root2@univ.edu', role: 'Admin', mfa: true, status: 'Active' },
];

const mockBackups = [
    { id: 1, date: '2024-10-24 02:00 AM', size: '14.2 GB', status: 'Success' },
    { id: 2, date: '2024-10-23 02:00 AM', size: '14.1 GB', status: 'Success' },
    { id: 3, date: '2024-10-22 02:00 AM', size: '14.0 GB', status: 'Warning' },
];

const mfaData = [
    { name: 'Enabled', value: 85, color: '#10b981' }, // Emerald
    { name: 'Disabled', value: 15, color: '#ef4444' }  // Red
];

// --- Components ---
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState<AdminData | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('vital stats');

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole') || 'admin';
    const displayUserName = data?.user?.name || userRole.charAt(0).toUpperCase() + userRole.slice(1);
    const initials = displayUserName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    useEffect(() => {
        async function fetchDashboard() {
            try {
                if (userId) {
                    const res = await fetch(`http://localhost:5000/api/dashboard/admin/${userId}`);
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
                    user: { name: 'Root Admin', email: 'admin@system.local', role: 'admin' },
                    recent_logs: [
                        { id: 1, action: 'User USR-2941 locked due to failed MFA', ip_address: '192.168.1.45', timestamp: new Date().toISOString() },
                        { id: 2, action: 'Manual DB Backup Triggered', ip_address: '10.0.0.5', timestamp: new Date(Date.now() - 3600000).toISOString() },
                        { id: 3, action: 'Role changed for USR-1045 to Staff', ip_address: '10.0.0.5', timestamp: new Date(Date.now() - 7200000).toISOString() },
                    ],
                    system_stats: {
                        active_sessions: { count: 1245 },
                        server_uptime: { days: 42, hours: 14 },
                        database_size: { size: '14.2 GB' },
                        permissions_matrix: {
                            'admin': { 'edit_grades': true, 'delete_users': true, 'view_financials': true },
                            'management': { 'edit_grades': false, 'delete_users': false, 'view_financials': true },
                            'staff': { 'edit_grades': true, 'delete_users': false, 'view_financials': false }
                        }
                    }
                });
                setLoading(false);
            }, 800);
        }
        fetchDashboard();

        // Cmd+K Listener
        const handleKeyDown = (e: globalThis.KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
                e.preventDefault();
                document.getElementById('global-search')?.focus();
            }
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);

    }, [userId]);

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        toast.info("Logged out successfully");
        navigate('/');
    };

    const handleBackup = () => {
        toast.success("Database backup initiated. This may take a few minutes in the background.");
    };

    // Filter mock users
    const filteredUsers = mockUsersTable.filter(u =>
        u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.id.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // Cyber Red / Carbon Black Theme
    return (
        <div className="min-h-screen w-full bg-zinc-50 dark:bg-[#030712] text-zinc-900 dark:text-zinc-200 flex transition-colors duration-300 font-sans selection:bg-red-500/30">
            {/* Background Effects (Carbon/Red Command Center) */}
            <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
                <div className="absolute inset-0 dark:bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] dark:from-zinc-900 dark:via-[#030712] dark:to-[#030712]" />
                <div className="absolute top-0 right-1/4 w-[800px] h-[800px] rounded-full bg-red-600/5 dark:bg-red-600/[0.04] blur-[120px]" />
                <div className="absolute bottom-0 left-1/4 w-[600px] h-[600px] rounded-full bg-zinc-600/10 dark:bg-zinc-800/20 blur-[100px]" />
                {/* Subtle grid pattern for "system" feel */}
                <div className="absolute inset-0 dark:opacity-20 opacity-5" style={{ backgroundImage: 'radial-gradient(#4b5563 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
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
                    bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-2xl border-r border-zinc-200 dark:border-white/[0.05]
                    ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0
                    transition-transform lg:transition-none
                `}
            >
                <div className="h-16 flex items-center gap-3 px-4 border-b border-zinc-200 dark:border-white/[0.05]">
                    <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-500 to-red-700 text-white flex items-center justify-center flex-shrink-0 shadow-lg shadow-red-500/20 ring-1 ring-red-500/50">
                        <Shield className="w-5 h-5" />
                    </div>
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-sm tracking-wide whitespace-nowrap text-zinc-900 dark:text-red-50"
                            >
                                SYSTEM CORE
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
                    {[
                        { icon: Activity, label: 'Vital Stats' },
                        { icon: Users, label: 'User Directory' },
                        { icon: Settings, label: 'Permissions' },
                        { icon: Database, label: 'Backups' },
                        { icon: LayoutDashboard, label: 'Portal Monitor' },
                        { icon: GraduationCap, label: 'Student Manager' },
                        { icon: Briefcase, label: 'Staff Manager' },
                        { icon: Server, label: 'System Health' },
                        { icon: Bell, label: 'Announcements' },
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
                                        ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 shadow-sm border border-red-200 dark:border-red-500/20'
                                        : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-white/[0.02]'
                                    }
                                `}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'text-red-600 dark:text-red-400' : ''}`} />
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

                <div className="hidden lg:flex p-3 border-t border-zinc-200 dark:border-white/[0.05]">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center py-2 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-white/[0.02] transition-colors"
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
                <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-zinc-200 dark:border-white/[0.05] bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-xl">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="lg:hidden p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.05]"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        {/* Cmd+K Search Wrapper */}
                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                id="global-search"
                                placeholder="Search users, logs, or logs (Cmd+K)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-12 bg-zinc-100/50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.05] focus-visible:ring-red-500 rounded-full h-9"
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
                                <kbd className="hidden md:inline-flex items-center justify-center px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-[10px] font-medium text-zinc-500 dark:text-zinc-400">⌘K</kbd>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />

                        <button onClick={handleLogout} className="relative p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.05] hover:text-red-500 dark:hover:text-red-400 transition-colors" title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>

                        <button className="relative p-2 rounded-lg text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors">
                            <AlertTriangle className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-red-500 ring-2 ring-white dark:ring-[#09090b] animate-pulse" />
                        </button>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <div className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-white/[0.05] transition-colors cursor-pointer outline-none ring-1 ring-transparent hover:ring-zinc-200 dark:hover:ring-white/[0.05]">
                                    <Avatar className="w-8 h-8 ring-1 ring-red-500/30">
                                        <AvatarFallback className="bg-zinc-900 dark:bg-zinc-800 text-red-500 text-xs font-bold border border-red-500/20">
                                            {initials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left relative z-10">
                                        <p className="text-xs font-medium text-zinc-900 dark:text-white/90 leading-tight">{displayUserName}</p>
                                        <p className="text-[10px] text-zinc-500 dark:text-white/40 capitalize">Root User</p>
                                    </div>
                                </div>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#09090b] border-zinc-200 dark:border-white/[0.05]">
                                <DropdownMenuLabel className="text-zinc-900 dark:text-white">Admin Terminal</DropdownMenuLabel>
                                <DropdownMenuSeparator className="bg-zinc-200 dark:bg-white/[0.05]" />
                                <DropdownMenuItem onClick={() => {
                                    setActiveSection('my profile');
                                    if (isMobile) setMobileMenuOpen(false);
                                }} className="focus:bg-zinc-100 dark:focus:bg-white/[0.05] dark:text-zinc-300 cursor-pointer text-sm font-medium">Profile Settings</DropdownMenuItem>
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
                                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-28 rounded-xl bg-zinc-200 dark:bg-white/[0.02]" />)}
                                </div>
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                    <Skeleton className="h-[500px] rounded-xl lg:col-span-2 bg-zinc-200 dark:bg-white/[0.02]" />
                                    <Skeleton className="h-[500px] rounded-xl lg:col-span-1 bg-zinc-200 dark:bg-white/[0.02]" />
                                </div>
                            </motion.div>
                        ) : activeSection === 'vital stats' ? (
                            data ? (
                                <motion.div
                                    key="vital-stats"
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="space-y-6"
                                >
                                    {/* System Vitals */}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Active Sessions', value: data.system_stats?.active_sessions?.count || 0, icon: Users, color: 'text-emerald-500' },
                                            { label: 'Server Uptime', value: `${data.system_stats?.server_uptime?.days || 0}d ${data.system_stats?.server_uptime?.hours || 0}h`, icon: Activity, color: 'text-blue-500' },
                                            { label: 'Database Size', value: data.system_stats?.database_size?.size || '0 TB', icon: Database, color: 'text-purple-500' },
                                            { label: 'Security Alerts', value: '3 Critical', icon: AlertTriangle, color: 'text-red-500', alert: true },
                                        ].map((stat, i) => (
                                            <Card key={i} className={`bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl hover:bg-white dark:hover:bg-[#09090b] transition-colors ${stat.alert ? 'border-red-500/50 dark:border-red-500/30' : ''}`}>
                                                <CardContent className="p-5 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400 uppercase tracking-wider mb-1">{stat.label}</p>
                                                        <p className={`text-2xl font-bold tracking-tight ${stat.alert ? 'text-red-600 dark:text-red-400' : 'text-zinc-900 dark:text-white'}`}>{stat.value}</p>
                                                    </div>
                                                    <div className={`p-3 rounded-lg bg-zinc-100 dark:bg-white/[0.03] ${stat.alert ? 'bg-red-50 dark:bg-red-500/10' : ''}`}>
                                                        <stat.icon className={`w-5 h-5 ${stat.color}`} />
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                        {/* User Directory Table Preview */}
                                        <Card className="lg:col-span-2 bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl flex flex-col">
                                            <CardHeader className="pb-4 border-b border-zinc-100 dark:border-white/[0.05]">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <CardTitle className="text-lg font-semibold text-zinc-900 dark:text-white">User Directory</CardTitle>
                                                        <CardDescription className="text-xs dark:text-zinc-400 mt-1">Recent users from directory</CardDescription>
                                                    </div>
                                                    <Badge onClick={() => setActiveSection('user directory')} className="cursor-pointer border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/5 hover:bg-red-500/10 transition-colors">View All</Badge>
                                                </div>
                                            </CardHeader>
                                            <CardContent className="p-0 flex-1 overflow-x-auto">
                                                <Table>
                                                    <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                                                        <TableRow className="border-zinc-200 dark:border-white/[0.05] hover:bg-transparent">
                                                            <TableHead className="text-zinc-500 dark:text-zinc-400">ID</TableHead>
                                                            <TableHead className="text-zinc-500 dark:text-zinc-400">User / Email</TableHead>
                                                            <TableHead className="text-zinc-500 dark:text-zinc-400 text-right">Security</TableHead>
                                                        </TableRow>
                                                    </TableHeader>
                                                    <TableBody>
                                                        {filteredUsers.slice(0, 5).map((u) => (
                                                            <TableRow key={u.id} className="border-zinc-100 dark:border-white/[0.05] hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                                                                <TableCell className="font-mono text-xs text-zinc-500 dark:text-zinc-400">{u.id}</TableCell>
                                                                <TableCell>
                                                                    <p className="font-medium text-zinc-900 dark:text-zinc-200">{u.name}</p>
                                                                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{u.email}</p>
                                                                </TableCell>
                                                                <TableCell className="text-right">
                                                                    <div className="flex items-center justify-end gap-2">
                                                                        {u.mfa ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <Shield className="w-4 h-4 text-red-500" />}
                                                                        <Badge variant="outline" className={`text-[10px] px-1.5 py-0 uppercase border ${u.status === 'Active' ? 'text-emerald-600 border-emerald-500/30' : 'text-red-500 border-red-500/30'}`}>
                                                                            {u.status}
                                                                        </Badge>
                                                                    </div>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            </CardContent>
                                        </Card>

                                        <div className="space-y-6">
                                            {/* Audit Log Timeline */}
                                            <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl">
                                                <CardHeader className="pb-2">
                                                    <CardTitle className="text-sm font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                                                        <Server className="w-4 h-4 text-zinc-500" />
                                                        System Audit Log
                                                    </CardTitle>
                                                </CardHeader>
                                                <CardContent className="h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                                                    <div className="space-y-3 relative before:absolute before:inset-0 before:ml-2 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 dark:before:via-white/[0.05] before:to-transparent">
                                                        {data.recent_logs?.map((log, index) => {
                                                            const date = new Date(log.timestamp);
                                                            return (
                                                                <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                                                    <div className="flex items-center justify-center w-4 h-4 rounded-full border border-white dark:border-[#09090b] bg-zinc-300 dark:bg-zinc-600 text-slate-500 absolute left-0 md:left-1/2 -translate-x-1/2 ring-2 ring-transparent group-hover:ring-zinc-200 dark:group-hover:ring-white/10 transition z-10"></div>
                                                                    <div className="w-[calc(100%-2rem)] md:w-[calc(50%-1.5rem)] ml-6 md:ml-0 p-3 rounded-lg bg-zinc-50 dark:bg-white/[0.02] border border-zinc-100 dark:border-white/[0.02]">
                                                                        <p className="text-xs text-zinc-800 dark:text-zinc-200">{log.action}</p>
                                                                        <div className="flex justify-between items-center mt-2">
                                                                            <span className="text-[10px] text-zinc-500 font-mono">{log.ip_address}</span>
                                                                            <span className="text-[10px] text-zinc-400">{date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            )
                                                        })}
                                                    </div>
                                                </CardContent>
                                            </Card>

                                            {/* MFA Health & Backups */}
                                            <div className="grid grid-cols-2 gap-4">
                                                <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl">
                                                    <CardHeader className="pb-1 p-4">
                                                        <CardTitle className="text-xs font-semibold text-zinc-900 dark:text-white">MFA Compliance</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-0 flex items-center justify-center h-32 relative">
                                                        <ResponsiveContainer width="100%" height="100%">
                                                            <PieChart>
                                                                <Pie
                                                                    data={mfaData}
                                                                    cx="50%"
                                                                    cy="50%"
                                                                    innerRadius={25}
                                                                    outerRadius={40}
                                                                    paddingAngle={5}
                                                                    dataKey="value"
                                                                    stroke="none"
                                                                >
                                                                    {mfaData.map((entry, index) => (
                                                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                                                    ))}
                                                                </Pie>
                                                                <RechartsTooltip
                                                                    contentStyle={{ backgroundColor: 'rgba(9, 9, 11, 0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', color: '#fff' }}
                                                                    itemStyle={{ color: '#fff' }}
                                                                />
                                                            </PieChart>
                                                        </ResponsiveContainer>
                                                        <div className="absolute inset-0 flex items-center justify-center flex-col pointer-events-none mt-2">
                                                            <span className="text-lg font-bold text-zinc-900 dark:text-white">85%</span>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                                <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl flex flex-col justify-between">
                                                    <CardHeader className="pb-1 p-4">
                                                        <CardTitle className="text-xs font-semibold text-zinc-900 dark:text-white">System Backup</CardTitle>
                                                    </CardHeader>
                                                    <CardContent className="p-4 pt-0">
                                                        <p className="text-[10px] text-zinc-500 dark:text-zinc-400 mb-3 block">Last: {mockBackups[0].date}</p>
                                                        <button onClick={handleBackup} className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-md flex items-center justify-center gap-2 transition-colors">
                                                            <Download className="w-3 h-3" /> Execute Now
                                                        </button>
                                                    </CardContent>
                                                </Card>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="error"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex justify-center items-center h-full text-zinc-500"
                                >
                                    System Link Terminated.
                                </motion.div>
                            )
                        ) : activeSection === 'user directory' ? (
                            <motion.div
                                key="user-directory"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-6"
                            >
                                <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl">
                                    <CardHeader>
                                        <CardTitle>User Management</CardTitle>
                                        <CardDescription>Comprehensive directory of all users across the portal.</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-0 overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                                                <TableRow className="border-zinc-200 dark:border-white/[0.05]">
                                                    <TableHead>ID</TableHead>
                                                    <TableHead>User / Email</TableHead>
                                                    <TableHead>Role</TableHead>
                                                    <TableHead>Security</TableHead>
                                                    <TableHead className="text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {filteredUsers.map((u) => (
                                                    <TableRow key={u.id} className="border-zinc-100 dark:border-white/[0.05] hover:bg-zinc-50 dark:hover:bg-white/[0.02]">
                                                        <TableCell className="font-mono text-xs">{u.id}</TableCell>
                                                        <TableCell>
                                                            <p className="font-medium">{u.name}</p>
                                                            <p className="text-xs text-zinc-500">{u.email}</p>
                                                        </TableCell>
                                                        <TableCell>
                                                            <Badge variant="secondary" className="bg-zinc-100 dark:bg-white/[0.05]">{u.role}</Badge>
                                                        </TableCell>
                                                        <TableCell>
                                                            <div className="flex items-center gap-2">
                                                                {u.mfa ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <Shield className="w-4 h-4 text-red-500" />}
                                                                <Badge variant="outline" className={`text-[10px] ${u.status === 'Active' ? 'text-emerald-600 border-emerald-500/30' : 'text-red-50'}`}>
                                                                    {u.status}
                                                                </Badge>
                                                            </div>
                                                        </TableCell>
                                                        <TableCell className="text-right">
                                                            <Button variant="ghost" size="sm">Manage</Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ) : activeSection === 'portal monitor' ? (
                            <Suspense fallback={<LazyFallback />}><AdminPortalMonitor /></Suspense>
                        ) : activeSection === 'student manager' ? (
                            <Suspense fallback={<LazyFallback />}><AdminStudentManager /></Suspense>
                        ) : activeSection === 'staff manager' ? (
                            <Suspense fallback={<LazyFallback />}><AdminStaffManager /></Suspense>
                        ) : activeSection === 'system health' ? (
                            <Suspense fallback={<LazyFallback />}><AdminSystemHealth /></Suspense>
                        ) : activeSection === 'announcements' ? (
                            <Suspense fallback={<LazyFallback />}><AdminAnnouncements /></Suspense>
                        ) : activeSection === 'my profile' ? (
                            <Suspense fallback={<LazyFallback />}><AdminProfile /></Suspense>
                        ) : (
                            <motion.div
                                key="placeholder"
                                initial={{ opacity: 0, scale: 0.95 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.95 }}
                                className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
                            >
                                <div className="w-20 h-20 rounded-2xl bg-red-500/10 flex items-center justify-center mb-6">
                                    {(() => {
                                        const Icon = [
                                            { icon: Activity, label: 'Vital Stats' },
                                            { icon: Users, label: 'User Directory' },
                                            { icon: Settings, label: 'Permissions' },
                                            { icon: Database, label: 'Backups' },
                                        ].find(i => i.label.toLowerCase() === activeSection)?.icon || Shield;
                                        return <Icon className="w-10 h-10 text-red-600 dark:text-red-400" />;
                                    })()}
                                </div>
                                <h2 className="text-2xl font-bold text-zinc-900 dark:text-white mb-2 capitalize">
                                    {activeSection} Terminal
                                </h2>
                                <p className="text-zinc-500 dark:text-zinc-400 max-w-md mb-8">
                                    This administrative module is currently offline for maintenance or under development. System links will be restored shortly.
                                </p>
                                <Button
                                    onClick={() => setActiveSection('vital stats')}
                                    className="gap-2 bg-red-600 hover:bg-red-700 text-white"
                                >
                                    <Activity className="w-4 h-4" />
                                    Return to Vitals
                                </Button>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
            </motion.div>
        </div>
    );
}
