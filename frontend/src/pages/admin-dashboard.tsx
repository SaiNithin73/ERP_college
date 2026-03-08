import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
    LayoutDashboard, MonitorCheck, Users, BookOpen, DollarSign, Megaphone,
    ShieldCheck, ScrollText, DatabaseBackup, Shield, Activity, Database, Search, AlertTriangle, Download, LogOut, ChevronLeft, ChevronRight, Menu,
    Edit, Trash, RefreshCw, ServerCrash, Lock, Unlock, PowerOff, RotateCcw, UserPlus,
    StopCircle, KeySquare, X as XIcon, Eye, Loader2, ArrowLeft
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { CustomSelect } from '@/components/ui/selects';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip } from 'recharts';
import { ThemeToggle } from '@/components/theme-toggle';

// --- Shared Components & Utils ---
const useAnimationProps = () => {
    const shouldReduceMotion = useReducedMotion();
    return {
        initial: { opacity: 0, y: shouldReduceMotion ? 0 : 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: shouldReduceMotion ? 0 : -20 },
        transition: { duration: 0.3 }
    };
};

const SectionWrapper = ({ children, className = '' }: { children: React.ReactNode, className?: string }) => {
    const animProps = useAnimationProps();
    return (
        <motion.div {...animProps} className={`space-y-6 ${className}`}>
            {children}
        </motion.div>
    );
};

const TableStateWrapper = ({ loading, empty, colSpan, children }: { loading: boolean, empty: boolean, colSpan: number, children: React.ReactNode }) => {
    if (loading) {
        return (
            <TableRow>
                <TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <RefreshCw className="w-6 h-6 animate-spin text-red-500" />
                        <p>Loading data...</p>
                    </div>
                </TableCell>
            </TableRow>
        );
    }
    if (empty) {
        return (
            <TableRow>
                <TableCell colSpan={colSpan} className="h-32 text-center text-muted-foreground">
                    <div className="flex flex-col items-center justify-center space-y-2">
                        <Database className="w-6 h-6 text-zinc-400" />
                        <p>No records found.</p>
                    </div>
                </TableCell>
            </TableRow>
        );
    }
    return <>{children}</>;
};

// --- Mock Data ---
const MOCK_MFA_DATA = [
    { name: 'Enabled', value: 85, color: 'hsl(var(--chart-2))' }, // F12: Semantic colors
    { name: 'Disabled', value: 15, color: 'hsl(var(--destructive))' }
];

const MOCK_USERSPreview = [
    { id: 'ST-2023-001', name: 'Alice Chen', role: 'Student', status: 'Active', mfa: true },
    { id: 'FC-1998-042', name: 'Dr. Robert F.', role: 'Staff', status: 'Active', mfa: true },
    { id: 'AD-2001-001', name: 'System Root', role: 'Admin', status: 'Active', mfa: false },
    { id: 'ST-2023-089', name: 'Bob Smith', role: 'Student', status: 'Suspended', mfa: true },
    { id: 'MG-2015-004', name: 'Board Member A', role: 'Management', status: 'Active', mfa: true },
];

const MOCK_PORTALS = [
    { name: 'Student Portal', activeUsers: 1450, lastActivity: '2 mins ago', status: 'Online' },
    { name: 'Staff Portal', activeUsers: 120, lastActivity: '5 mins ago', status: 'Online' },
    { name: 'Management Portal', activeUsers: 5, lastActivity: '1 hr ago', status: 'Degraded' },
    { name: 'Admin Portal', activeUsers: 2, lastActivity: 'Just now', status: 'Online' },
];

// --- Sections ---
const VitalStatsSection = () => (
    <SectionWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">1,577</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl">
                        <Users className="w-5 h-5 text-red-500" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card border-border">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">Server Uptime</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">99.98%</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl">
                        <Activity className="w-5 h-5 text-red-500" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card border-border">
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-muted-foreground">DB Size</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">42.5 GB</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl">
                        <Database className="w-5 h-5 text-red-500" />
                    </div>
                </CardContent>
            </Card>
            <Card className="bg-card border-red-500/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4">
                    <span className="relative flex h-3 w-3">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
                    </span>
                </div>
                <CardContent className="p-6 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-red-500">Security Alerts</p>
                        <p className="text-2xl font-bold mt-1 text-foreground">3 Critical</p>
                    </div>
                    <div className="p-3 bg-red-500/10 rounded-xl">
                        <AlertTriangle className="w-5 h-5 text-red-500" />
                    </div>
                </CardContent>
            </Card>
        </div>

        <Card className="bg-muted border-border p-4 flex flex-col md:flex-row items-center gap-4">
            <span className="text-sm font-semibold text-muted-foreground">Portal Status:</span>
            <div className="flex flex-wrap items-center gap-4">
                {[
                    { name: 'Student', status: 'Online', color: 'bg-emerald-500', text: 'text-emerald-500' },
                    { name: 'Staff', status: 'Online', color: 'bg-emerald-500', text: 'text-emerald-500' },
                    { name: 'Management', status: 'Degraded', color: 'bg-amber-500', text: 'text-amber-500' },
                    { name: 'Admin', status: 'Online', color: 'bg-emerald-500', text: 'text-emerald-500' },
                ].map(p => (
                    <Badge key={p.name} variant="outline" className={`gap-2 min-h-[44px] px-4 py-2 bg-card ${p.text} border-border`}>
                        <div className={`w-2 h-2 rounded-full ${p.color}`} />
                        {p.name} ({p.status})
                    </Badge>
                ))}
            </div>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border lg:col-span-2">
                <CardHeader>
                    <CardTitle>User Directory Preview</CardTitle>
                    <CardDescription>Recent active sessions across all roles.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>ID</TableHead>
                                <TableHead>Name</TableHead>
                                <TableHead>Role</TableHead>
                                <TableHead>Status</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableStateWrapper loading={false} empty={false} colSpan={4}>
                                {MOCK_USERSPreview.map(u => (
                                    <TableRow key={u.id}>
                                        <TableCell className="font-mono text-xs">{u.id}</TableCell>
                                        <TableCell className="font-medium">{u.name}</TableCell>
                                        <TableCell><Badge variant="outline" className="text-muted-foreground min-h-[24px]">{u.role}</Badge></TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={`min-h-[24px] ${u.status === 'Active' ? 'text-emerald-500 border-emerald-500/20' : 'text-red-500 border-red-500/20'}`}>
                                                {u.status}
                                            </Badge>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableStateWrapper>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            <Card className="bg-card border-border flex flex-col justify-between">
                <CardHeader>
                    <CardTitle>MFA Compliance</CardTitle>
                    <CardDescription>System-wide multi-factor adoption.</CardDescription>
                </CardHeader>
                <CardContent className="flex items-center justify-center relative min-h-[200px]">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={MOCK_MFA_DATA}
                                cx="50%" cy="50%" innerRadius={60} outerRadius={80}
                                paddingAngle={5} dataKey="value" stroke="none"
                            >
                                {MOCK_MFA_DATA.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <RechartsTooltip contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))' }} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                        <ShieldCheck className="w-8 h-8 text-muted-foreground mb-1" />
                        <span className="font-bold text-xl">85%</span>
                    </div>
                </CardContent>
            </Card>
        </div>
    </SectionWrapper>
);

// ─── Types ────────────────────────────────────────────────────────────────────
interface PortalStats {
    activeUsers: number;
    lastActivity: string;
    status: 'online' | 'degraded' | 'offline';
    locked: boolean;
    totalStudents?: number;
    totalStaff?: number;
    totalMembers?: number;
    totalAdmins?: number;
}
interface PortalsOverview {
    student: PortalStats;
    staff: PortalStats;
    management: PortalStats;
    admin: PortalStats;
}
interface PortalUser {
    id: number;
    name: string;
    email: string;
    role: string;
    mfa_enabled: boolean;
    department?: string;
    cgpa?: number;
    semester?: number;
    designation?: string;
}
interface PortalUserProfile {
    user: PortalUser;
    profile: Record<string, string | number | boolean | null> | null;
    attendance?: Array<{ subject_name: string; percentage: number; status_badge: string; classes_attended: number; total_classes: number }>;
    performance?: Array<{ semester_label: string; gpa: number }>;
    pending_requests?: Array<{ student_name: string; type: string; status: string; dates: string }>;
}
type PortalKey = 'student' | 'staff' | 'management' | 'admin';

// ─── Helpers ─────────────────────────────────────────────────────────────────
const PORTAL_DISPLAY: Record<PortalKey, { label: string; icon: React.ElementType }> = {
    student:    { label: 'Student Portal',    icon: Users },
    staff:      { label: 'Staff Portal',      icon: BookOpen },
    management: { label: 'Management Portal', icon: DollarSign },
    admin:      { label: 'Admin Portal',      icon: ShieldCheck },
};

const statusStyle = (s: string) =>
    s === 'online'   ? 'text-emerald-500 border-emerald-500/20 bg-emerald-500/10' :
    s === 'degraded' ? 'text-amber-500 border-amber-500/20 bg-amber-500/10' :
                       'text-red-500 border-red-500/20 bg-red-500/10';

const statusDot = (s: string) =>
    s === 'online' ? 'bg-emerald-500' : s === 'degraded' ? 'bg-amber-500' : 'bg-red-500';

// ─── Slide-over Panel ─────────────────────────────────────────────────────────
const SlideOver = ({
    portalKey,
    onClose,
    adminId,
}: {
    portalKey: PortalKey;
    onClose: () => void;
    adminId: string;
}) => {
    const shouldReduceMotion = useReducedMotion();
    const [panelTab, setPanelTab] = React.useState<'overview' | 'users' | 'actions'>('overview');
    const [users, setUsers] = React.useState<PortalUser[]>([]);
    const [usersLoading, setUsersLoading] = React.useState(false);
    const [usersTotal, setUsersTotal] = React.useState(0);
    const [page, setPage] = React.useState(1);
    const [search, setSearch] = React.useState('');
    const [profileView, setProfileView] = React.useState<PortalUserProfile | null>(null);
    const [profileLoading, setProfileLoading] = React.useState(false);
    const displayInfo = PORTAL_DISPLAY[portalKey];

    // Debounced search
    const searchRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const onSearchChange = (val: string) => {
        setSearch(val);
        if (searchRef.current) clearTimeout(searchRef.current);
        searchRef.current = setTimeout(() => {
            setPage(1);
            loadUsers(1, val);
        }, 300);
    };

    const loadUsers = React.useCallback(async (p = 1, q = search) => {
        setUsersLoading(true);
        try {
            const url = `http://localhost:5000/api/admin/portal/${portalKey}/users?page=${p}&limit=10&search=${encodeURIComponent(q)}`;
            const res = await fetch(url);
            const json = await res.json();
            if (json.success) {
                setUsers(json.data.users);
                setUsersTotal(json.data.total);
            }
        } catch {
            toast.error('Failed to load users');
        } finally {
            setUsersLoading(false);
        }
    }, [portalKey, search]);

    React.useEffect(() => {
        if (panelTab === 'users') loadUsers(page);
    }, [panelTab, page]);

    const viewProfile = async (userId: number) => {
        setProfileLoading(true);
        setProfileView(null);
        try {
            const res = await fetch(`http://localhost:5000/api/admin/portal/${portalKey}/user/${userId}`);
            const json = await res.json();
            if (json.success) setProfileView(json.data);
            else toast.error('Failed to load profile');
        } catch {
            toast.error('Network error');
        } finally {
            setProfileLoading(false);
        }
    };

    // Close on Escape
    React.useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    return (
        <>
            {/* Backdrop scrim */}
            <motion.div
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />
            {/* Panel */}
            <motion.div
                initial={{ x: shouldReduceMotion ? 0 : '100%' }}
                animate={{ x: 0 }}
                exit={{ x: shouldReduceMotion ? 0 : '100%' }}
                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                className="fixed inset-y-0 right-0 z-50 w-full sm:w-[600px] bg-card border-l border-border flex flex-col shadow-2xl"
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                            <displayInfo.icon className="w-5 h-5 text-red-500" />
                        </div>
                        <div>
                            <h2 className="font-semibold text-foreground">{displayInfo.label}</h2>
                            <p className="text-xs text-muted-foreground">Portal Control Panel</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center transition-colors">
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Sub-tabs */}
                <div className="flex bg-muted mx-4 mt-4 rounded-full p-1 gap-0 shrink-0">
                    {(['overview', 'users', 'actions'] as const).map(t => (
                        <button key={t} onClick={() => { setPanelTab(t); setProfileView(null); }}
                            className={`flex-1 py-2 rounded-full text-sm font-medium transition-all min-h-[44px] capitalize
                                ${panelTab === t ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:text-foreground'}`}>
                            {t.charAt(0).toUpperCase() + t.slice(1)}
                        </button>
                    ))}
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <AnimatePresence mode="wait">
                        {panelTab === 'overview' && (
                            <motion.div key="overview" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    {[
                                        { label: 'Total Users', value: (PORTAL_DISPLAY[portalKey].label === 'Student Portal' ? 'See Users tab' : 'See Users tab') },
                                    ].map(() => null)}
                                    <Card className="bg-muted border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Portal</p><p className="font-bold text-foreground mt-1">{displayInfo.label}</p></CardContent></Card>
                                    <Card className="bg-muted border-border"><CardContent className="p-4"><p className="text-xs text-muted-foreground">Go to</p><Button variant="ghost" size="sm" className="mt-1 text-red-500 p-0 h-auto" onClick={() => setPanelTab('users')}>View Users →</Button></CardContent></Card>
                                </div>
                                <Card className="bg-muted border-border">
                                    <CardContent className="p-4 space-y-2">
                                        <p className="text-sm font-medium text-foreground">Quick Info</p>
                                        <p className="text-xs text-muted-foreground">Use the <strong>Users</strong> tab to search and browse all {portalKey} accounts in real-time from the database.</p>
                                        <p className="text-xs text-muted-foreground">Use the <strong>Actions</strong> tab to perform portal-specific operations like force-logout or data export.</p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )}

                        {panelTab === 'users' && (
                            <motion.div key="users" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                                {profileLoading ? (
                                    <div className="flex flex-col items-center justify-center h-40 gap-3">
                                        <Loader2 className="w-8 h-8 animate-spin text-red-500" />
                                        <p className="text-sm text-muted-foreground">Loading profile...</p>
                                    </div>
                                ) : profileView ? (
                                    // ── Profile Detail View ──
                                    <div className="space-y-4">
                                        <button onClick={() => setProfileView(null)} className="flex items-center gap-2 text-sm text-red-500 hover:text-red-400 min-h-[44px]">
                                            <ArrowLeft className="w-4 h-4" /> Back to list
                                        </button>
                                        <Card className="bg-muted border-border">
                                            <CardContent className="p-4 space-y-2">
                                                <p className="font-semibold text-foreground text-lg">{profileView.user.name}</p>
                                                <p className="text-xs text-muted-foreground">{profileView.user.email}</p>
                                                <Badge variant="outline" className="text-muted-foreground capitalize min-h-[24px]">{profileView.user.role}</Badge>
                                            </CardContent>
                                        </Card>
                                        {profileView.profile && (
                                            <Card className="bg-muted border-border">
                                                <CardHeader className="pb-2"><CardTitle className="text-sm">Profile Details</CardTitle></CardHeader>
                                                <CardContent className="grid grid-cols-2 gap-3">
                                                    {Object.entries(profileView.profile).map(([k, v]) => (
                                                        <div key={k}>
                                                            <p className="text-xs text-muted-foreground capitalize">{k.replace(/_/g, ' ')}</p>
                                                            <p className="font-medium text-sm text-foreground">{String(v ?? '—')}</p>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}
                                        {profileView.attendance && profileView.attendance.length > 0 && (
                                            <Card className="bg-muted border-border">
                                                <CardHeader className="pb-2"><CardTitle className="text-sm">Attendance</CardTitle></CardHeader>
                                                <CardContent className="space-y-2">
                                                    {profileView.attendance.map((a, i) => (
                                                        <div key={i} className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground truncate">{a.subject_name}</span>
                                                            <Badge variant="outline" className={`min-h-[24px] ml-2 ${
                                                                a.status_badge === 'Safe' ? 'text-emerald-500 border-emerald-500/20' :
                                                                a.status_badge === 'Low' ? 'text-amber-500 border-amber-500/20' :
                                                                'text-red-500 border-red-500/20'}`}>{a.percentage}%</Badge>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}
                                        {profileView.pending_requests && profileView.pending_requests.length > 0 && (
                                            <Card className="bg-muted border-border">
                                                <CardHeader className="pb-2"><CardTitle className="text-sm">Pending Requests</CardTitle></CardHeader>
                                                <CardContent className="space-y-2">
                                                    {profileView.pending_requests.map((r, i) => (
                                                        <div key={i} className="flex items-center justify-between text-sm">
                                                            <span className="text-muted-foreground">{r.student_name} — {r.type}</span>
                                                            <Badge variant="outline" className="min-h-[24px] text-amber-500">{r.status}</Badge>
                                                        </div>
                                                    ))}
                                                </CardContent>
                                            </Card>
                                        )}
                                    </div>
                                ) : (
                                    // ── Users Table ──
                                    <>
                                        <div className="relative">
                                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                placeholder={`Search ${portalKey}s by name or email...`}
                                                value={search}
                                                onChange={e => onSearchChange(e.target.value)}
                                                className="pl-9 bg-muted border-border min-h-[44px]"
                                            />
                                        </div>
                                        {usersLoading ? (
                                            <div className="flex items-center justify-center h-40"><Loader2 className="w-8 h-8 animate-spin text-red-500" /></div>
                                        ) : users.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-40 gap-2 text-muted-foreground">
                                                <Database className="w-8 h-8" /><p className="text-sm">No users found</p>
                                            </div>
                                        ) : (
                                            <div className="space-y-2">
                                                {users.map(u => (
                                                    <div key={u.id} className="flex items-center justify-between p-3 bg-muted rounded-xl border border-border hover:border-red-500/30 transition-colors">
                                                        <div className="min-w-0">
                                                            <p className="font-medium text-sm text-foreground truncate">{u.name}</p>
                                                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                                                            {u.department && <p className="text-xs text-muted-foreground">{u.department}{u.cgpa ? ` · CGPA ${u.cgpa}` : ''}</p>}
                                                        </div>
                                                        <div className="flex items-center gap-2 shrink-0">
                                                            {u.mfa_enabled
                                                                ? <ShieldCheck className="w-4 h-4 text-emerald-500" title="MFA On" />
                                                                : <Shield className="w-4 h-4 text-red-400" title="MFA Off" />}
                                                            <Button variant="outline" size="sm" onClick={() => viewProfile(u.id)} className="min-h-[44px] text-xs">Profile</Button>
                                                        </div>
                                                    </div>
                                                ))}
                                                {/* Pagination */}
                                                <div className="flex items-center justify-between pt-2">
                                                    <p className="text-xs text-muted-foreground">{usersTotal} total</p>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => { setPage(p => p - 1); loadUsers(page - 1); }} className="min-h-[44px]">Prev</Button>
                                                        <Button variant="outline" size="sm" disabled={users.length < 10} onClick={() => { setPage(p => p + 1); loadUsers(page + 1); }} className="min-h-[44px]">Next</Button>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </>
                                )}
                            </motion.div>
                        )}

                        {panelTab === 'actions' && (
                            <motion.div key="actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="space-y-4">
                                {[
                                    { label: 'Force Logout Portal Users', desc: 'Signs out all active users from this portal', action: () => { toast.info(`Force logout sent to ${displayInfo.label}`); } },
                                    { label: 'Export Portal Data', desc: 'Download a CSV of all user records', action: () => toast.info(`Export requested for ${displayInfo.label} (backend pending)`) },
                                    { label: 'Edit Portal Settings', desc: 'Configure portal-level settings', action: () => toast.info('Portal settings editor coming soon') },
                                ].map(item => (
                                    <div key={item.label} className="p-4 bg-muted rounded-xl border border-border flex items-start justify-between gap-4">
                                        <div>
                                            <p className="font-medium text-sm text-foreground">{item.label}</p>
                                            <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                                        </div>
                                        <Button variant="outline" size="sm" onClick={item.action} className="min-h-[44px] shrink-0">Run</Button>
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </motion.div>
        </>
    );
};

// ─── Broadcast Modal ──────────────────────────────────────────────────────────
const BroadcastModal = ({ portalKey, onClose, adminId }: { portalKey: PortalKey; onClose: () => void; adminId: string }) => {
    const shouldReduceMotion = useReducedMotion();
    const [title, setTitle] = React.useState('');
    const [message, setMessage] = React.useState('');
    const [priority, setPriority] = React.useState<'Normal' | 'Important' | 'Urgent'>('Normal');
    const [sending, setSending] = React.useState(false);
    const displayName = PORTAL_DISPLAY[portalKey].label;

    const send = async () => {
        if (!title.trim() || !message.trim()) { toast.error('Title and message are required'); return; }
        setSending(true);
        try {
            // Announcements endpoint integration — show toast if not yet wired
            toast.success(`Broadcast sent to ${displayName}!`);
            onClose();
        } catch {
            toast.error('Failed to send broadcast');
        } finally {
            setSending(false);
        }
    };

    return (
        <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/50 z-40" onClick={onClose} />
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                <motion.div
                    initial={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: shouldReduceMotion ? 1 : 0.9 }}
                    className="w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 space-y-4"
                >
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-semibold text-foreground">Broadcast to {displayName}</h3>
                            <p className="text-xs text-muted-foreground mt-0.5">Send a message to all portal users</p>
                        </div>
                        <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted min-h-[44px] min-w-[44px] flex items-center justify-center"><XIcon className="w-4 h-4" /></button>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Title</label>
                        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Announcement title..." className="bg-muted border-border min-h-[44px]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Priority</label>
                        <div className="flex gap-2">
                            {(['Normal', 'Important', 'Urgent'] as const).map(p => (
                                <button key={p} onClick={() => setPriority(p)}
                                    className={`flex-1 py-2 rounded-full text-sm font-medium border min-h-[44px] transition-all
                                        ${priority === p ? 'bg-red-500 text-white border-red-500' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                                    {p}
                                </button>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">Message</label>
                        <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
                            placeholder="Write your message here..."
                            className="w-full p-3 rounded-xl bg-muted border border-border text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]" />
                    </div>
                    <div className="flex gap-3 pt-2">
                        <Button variant="outline" onClick={onClose} className="flex-1 min-h-[44px]">Cancel</Button>
                        <Button onClick={send} disabled={sending} className="flex-1 bg-red-600 hover:bg-red-700 text-white min-h-[44px]">
                            {sending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Megaphone className="w-4 h-4 mr-2" />}
                            {sending ? 'Sending...' : 'Send Broadcast'}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </>
    );
};

// ─── Single Portal Card ───────────────────────────────────────────────────────
const PortalCard = ({
    portalKey,
    stats,
    maintenanceMode,
    adminId,
    onViewData,
    onBroadcast,
}: {
    portalKey: PortalKey;
    stats: PortalStats;
    maintenanceMode: boolean;
    adminId: string;
    onViewData: () => void;
    onBroadcast: () => void;
}) => {
    const [lockState, setLockState] = React.useState<'idle' | 'confirming' | 'loading'>(
        stats.locked ? 'idle' : 'idle'
    );
    const [isLocked, setIsLocked] = React.useState(stats.locked);
    const displayInfo = PORTAL_DISPLAY[portalKey];

    const handleLockToggle = async () => {
        if (lockState === 'idle') { setLockState('confirming'); return; }
        setLockState('loading');
        try {
            const endpoint = isLocked ? '/api/admin/portal/unlock' : '/api/admin/portal/lock';
            const res = await fetch(`http://localhost:5000${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ portalType: portalKey, adminId })
            });
            const json = await res.json();
            if (json.success) {
                setIsLocked(prev => !prev);
                toast.success(json.message);
            } else {
                toast.error(json.error || 'Action failed');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setLockState('idle');
        }
    };

    return (
        <Card className={`bg-card transition-all duration-300 relative overflow-hidden ${isLocked ? 'border-red-500/60' : maintenanceMode ? 'border-amber-500/40' : 'border-border'}`}>
            {isLocked && (
                <div className="absolute top-3 right-3">
                    <Badge className="bg-red-500 text-white text-xs gap-1 min-h-[24px]">
                        <Lock className="w-3 h-3" /> LOCKED
                    </Badge>
                </div>
            )}
            {maintenanceMode && !isLocked && (
                <div className="absolute top-3 right-3">
                    <Badge className="bg-amber-500 text-white text-xs min-h-[24px]">MAINTENANCE</Badge>
                </div>
            )}

            <CardHeader className="pb-2">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-red-500/10 rounded-lg">
                        <displayInfo.icon className="w-5 h-5 text-red-500" />
                    </div>
                    <div>
                        <CardTitle className="text-base">{displayInfo.label}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                            {stats.activeUsers} active · {stats.lastActivity}
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>

            <CardContent className="space-y-3 pt-0">
                <Badge variant="outline" className={`gap-1.5 min-h-[28px] px-3 ${statusStyle(stats.status)}`}>
                    <div className={`w-2 h-2 rounded-full ${statusDot(stats.status)}`} />
                    {stats.status.charAt(0).toUpperCase() + stats.status.slice(1)}
                </Badge>

                <div className="flex flex-wrap gap-2 pt-1">
                    <Button variant="outline" size="sm" onClick={onViewData} className="min-h-[44px]">
                        <Eye className="w-4 h-4 mr-1.5" /> View Data
                    </Button>
                    <Button variant="outline" size="sm" onClick={onBroadcast} className="min-h-[44px]">
                        <Megaphone className="w-4 h-4 mr-1.5" /> Broadcast
                    </Button>

                    {/* Lock / Unlock with inline confirm */}
                    <motion.div layout className="ml-auto">
                        {lockState === 'confirming' ? (
                            <div className="flex gap-1">
                                <Button size="sm" onClick={handleLockToggle}
                                    className="bg-red-600 hover:bg-red-700 text-white min-h-[44px] text-xs">
                                    {isLocked ? 'Confirm Unlock?' : 'Confirm Lock?'}
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setLockState('idle')} className="min-h-[44px] text-xs">Cancel</Button>
                            </div>
                        ) : (
                            <Button
                                variant="outline" size="sm"
                                onClick={handleLockToggle}
                                disabled={lockState === 'loading'}
                                className={`min-h-[44px] ${isLocked ? 'border-emerald-500/30 text-emerald-500 hover:bg-emerald-500 hover:text-white' : 'border-red-500/30 text-red-500 hover:bg-red-500 hover:text-white'}`}
                            >
                                {lockState === 'loading'
                                    ? <Loader2 className="w-4 h-4 animate-spin" />
                                    : isLocked
                                        ? <><Unlock className="w-4 h-4 mr-1.5" />Unlock</>
                                        : <><Lock className="w-4 h-4 mr-1.5" />Lock</>
                                }
                            </Button>
                        )}
                    </motion.div>
                </div>
            </CardContent>
        </Card>
    );
};

// ─── Global Action Button (with inline confirm) ────────────────────────────────
const GlobalActionButton = ({
    label,
    icon: Icon,
    onConfirm,
    variant = 'destructive',
}: {
    label: string;
    icon: React.ElementType;
    onConfirm: () => Promise<void>;
    variant?: 'destructive' | 'warning';
}) => {
    const [state, setState] = React.useState<'idle' | 'confirming' | 'loading'>('idle');
    const baseClass = variant === 'warning'
        ? 'bg-amber-500 hover:bg-amber-600 text-white'
        : 'bg-red-600 hover:bg-red-700 text-white';

    const run = async () => {
        setState('loading');
        await onConfirm();
        setState('idle');
    };

    return (
        <motion.div layout>
            {state === 'confirming' ? (
                <div className="flex gap-2">
                    <Button onClick={run} className={`${baseClass} min-h-[44px]`}>Yes, Confirm</Button>
                    <Button variant="outline" onClick={() => setState('idle')} className="min-h-[44px]">Cancel</Button>
                </div>
            ) : (
                <Button onClick={() => setState('confirming')} disabled={state === 'loading'}
                    className={`${baseClass} min-h-[44px] gap-2`}>
                    {state === 'loading' ? <Loader2 className="w-4 h-4 animate-spin" /> : <Icon className="w-4 h-4" />}
                    {label}
                </Button>
            )}
        </motion.div>
    );
};

// ─── Main Portal Manager Section ──────────────────────────────────────────────
const PortalManagerSection = () => {
    const adminId = localStorage.getItem('userId') || '1';
    const [overview, setOverview] = React.useState<PortalsOverview | null>(null);
    const [loadState, setLoadState] = React.useState<'loading' | 'success' | 'error'>('loading');
    const [slideOver, setSlideOver] = React.useState<PortalKey | null>(null);
    const [broadcastPortal, setBroadcastPortal] = React.useState<PortalKey | null>(null);
    const [maintenanceMode, setMaintenanceMode] = React.useState(false);

    // Fetch overview — with 2 retries
    const fetchOverview = React.useCallback(async (attempt = 0) => {
        setLoadState('loading');
        try {
            const res = await fetch('http://localhost:5000/api/admin/portals/overview');
            const json = await res.json();
            if (json.success) {
                setOverview(json.data);
                setLoadState('success');
            } else {
                throw new Error(json.error || 'Bad response');
            }
        } catch (err) {
            if (attempt < 2) {
                setTimeout(() => fetchOverview(attempt + 1), 800 * (attempt + 1));
            } else {
                setLoadState('error');
                toast.error('Could not load portal data after 3 attempts');
            }
        }
    }, []);

    React.useEffect(() => { fetchOverview(); }, [fetchOverview]);

    const handleForceLogout = async () => {
        const res = await fetch('http://localhost:5000/api/admin/global/force-logout', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminId })
        });
        const json = await res.json();
        if (json.success) toast.success(`All sessions terminated (${json.data.affected} users affected)`);
        else toast.error('Force logout failed');
    };

    const handleMaintenance = async () => {
        const newState = !maintenanceMode;
        const res = await fetch('http://localhost:5000/api/admin/global/maintenance', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ enabled: newState, adminId })
        });
        const json = await res.json();
        if (json.success) {
            setMaintenanceMode(newState);
            toast.success(`Maintenance mode ${newState ? 'enabled' : 'disabled'}`);
        } else toast.error('Maintenance toggle failed');
    };

    const handleResetPasswords = async () => {
        const res = await fetch('http://localhost:5000/api/admin/global/reset-passwords', {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ adminId })
        });
        const json = await res.json();
        if (json.success) toast.success(`Password reset flagged for ${json.data.affected} users`);
        else toast.error('Reset passwords failed');
    };

    const portalKeys: PortalKey[] = ['student', 'staff', 'management', 'admin'];

    return (
        <SectionWrapper>
            {/* Portal Cards */}
            {loadState === 'loading' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Card key={i} className="bg-card border-border">
                            <CardContent className="p-6 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-lg bg-muted animate-pulse" />
                                    <div className="space-y-1.5 flex-1">
                                        <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                                        <div className="h-3 bg-muted animate-pulse rounded w-1/2" />
                                    </div>
                                </div>
                                <div className="h-7 bg-muted animate-pulse rounded-full w-28" />
                                <div className="flex gap-2">
                                    <div className="h-10 bg-muted animate-pulse rounded-lg flex-1" />
                                    <div className="h-10 bg-muted animate-pulse rounded-lg flex-1" />
                                    <div className="h-10 bg-muted animate-pulse rounded-lg w-20" />
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {loadState === 'error' && (
                <Card className="bg-card border-red-500/30">
                    <CardContent className="p-8 flex flex-col items-center gap-4">
                        <AlertTriangle className="w-10 h-10 text-red-500" />
                        <p className="text-foreground font-medium">Failed to load portal data</p>
                        <Button onClick={() => fetchOverview()} className="bg-red-600 hover:bg-red-700 text-white min-h-[44px]">
                            Retry
                        </Button>
                    </CardContent>
                </Card>
            )}

            {loadState === 'success' && overview && (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {portalKeys.map(key => (
                            <PortalCard
                                key={key}
                                portalKey={key}
                                stats={overview[key]}
                                maintenanceMode={maintenanceMode}
                                adminId={adminId}
                                onViewData={() => setSlideOver(key)}
                                onBroadcast={() => setBroadcastPortal(key)}
                            />
                        ))}
                    </div>

                    {/* Global Actions */}
                    <Card className="bg-red-500/5 border-red-500/20">
                        <CardHeader>
                            <CardTitle className="text-red-500 flex items-center gap-2 text-base">
                                <ServerCrash className="w-5 h-5" /> Global Actions
                            </CardTitle>
                            <CardDescription>Destructive controls — all require confirmation before executing.</CardDescription>
                        </CardHeader>
                        <CardContent className="flex flex-wrap gap-3">
                            <GlobalActionButton label="Force Logout All" icon={PowerOff} onConfirm={handleForceLogout} />
                            <GlobalActionButton
                                label={maintenanceMode ? 'Disable Maintenance' : 'Enable Maintenance'}
                                icon={StopCircle}
                                onConfirm={handleMaintenance}
                                variant="warning"
                            />
                            <GlobalActionButton label="Reset All Passwords" icon={RotateCcw} onConfirm={handleResetPasswords} />
                        </CardContent>
                    </Card>
                </>
            )}

            {/* Slide-over Panel */}
            <AnimatePresence>
                {slideOver && (
                    <SlideOver
                        portalKey={slideOver}
                        onClose={() => setSlideOver(null)}
                        adminId={adminId}
                    />
                )}
            </AnimatePresence>

            {/* Broadcast Modal */}
            <AnimatePresence>
                {broadcastPortal && (
                    <BroadcastModal
                        portalKey={broadcastPortal}
                        onClose={() => setBroadcastPortal(null)}
                        adminId={adminId}
                    />
                )}
            </AnimatePresence>
        </SectionWrapper>
    );
};


const PeopleSection = () => {
    const [subTab, setSubTab] = useState<'students' | 'staff'>('students');
    const animProps = useAnimationProps();

    return (
        <SectionWrapper>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex bg-muted p-1 rounded-full w-full sm:w-fit">
                    <button
                        onClick={() => setSubTab('students')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm min-h-[44px] transition-all font-medium ${subTab === 'students' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}
                    >
                        Students
                    </button>
                    <button
                        onClick={() => setSubTab('staff')}
                        className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm min-h-[44px] transition-all font-medium ${subTab === 'staff' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}
                    >
                        Staff
                    </button>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <div className="w-[180px]">
                        <CustomSelect 
                            value="all" 
                            onChange={() => {}} 
                            options={[
                                {value: 'all', label: 'All Departments'}, 
                                {value: 'cs', label: 'Computer Science'}, 
                                {value: 'eng', label: 'Engineering'}
                            ]} 
                        />
                    </div>
                    <Button variant="outline" className="bg-card border-border min-h-[44px]"><Download className="w-4 h-4 mr-2" /> Export</Button>
                    <Button className="bg-red-600 hover:bg-red-700 text-white min-h-[44px]">
                        <UserPlus className="w-4 h-4 mr-2" /> Add {subTab === 'students' ? 'Student' : 'Staff'}
                    </Button>
                </div>
            </div>

            <Card className="bg-card border-border overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div key={subTab} {...animProps}>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>ID</TableHead>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Department</TableHead>
                                    {subTab === 'students' ? (
                                        <>
                                            <TableHead>Semester</TableHead>
                                            <TableHead>CGPA</TableHead>
                                        </>
                                    ) : (
                                        <>
                                            <TableHead>Role</TableHead>
                                            <TableHead>MFA</TableHead>
                                        </>
                                    )}
                                    <TableHead>Status</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                <TableStateWrapper loading={false} empty={false} colSpan={7}>
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <TableRow key={i}>
                                            <TableCell className="font-mono text-xs">{subTab === 'students' ? `ST-202X-00${i}` : `FC-199X-00${i}`}</TableCell>
                                            <TableCell className="font-medium">{subTab === 'students' ? `Student User ${i}` : `Staff Member ${i}`}</TableCell>
                                            <TableCell>Computer Science</TableCell>
                                            {subTab === 'students' ? (
                                                <>
                                                    <TableCell>Sem {i}</TableCell>
                                                    <TableCell>{(3.0 + i * 0.1).toFixed(2)}</TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell>Faculty</TableCell>
                                                    <TableCell>{i % 2 === 0 ? <ShieldCheck className="w-4 h-4 text-emerald-500" /> : <Shield className="w-4 h-4 text-red-500" />}</TableCell>
                                                </>
                                            )}
                                            <TableCell>
                                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 min-h-[24px]">Active</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <div className="flex items-center justify-end gap-2">
                                                    <Button variant="ghost" size="icon" className="hover:text-red-500 min-h-[44px] min-w-[44px]"><Edit className="w-4 h-4" /></Button>
                                                    <Button variant="ghost" size="icon" className="hover:text-red-500 min-h-[44px] min-w-[44px]"><Trash className="w-4 h-4" /></Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableStateWrapper>
                            </TableBody>
                        </Table>
                    </motion.div>
                </AnimatePresence>
            </Card>
        </SectionWrapper>
    );
};

const AcademicControlSection = () => {
    const [subTab, setSubTab] = useState<'courses' | 'timetable' | 'exams'>('courses');
    const [editTimetable, setEditTimetable] = useState(false);
    const animProps = useAnimationProps();

    return (
        <SectionWrapper>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex bg-muted p-1 rounded-full w-full sm:w-fit overflow-x-auto custom-scrollbar">
                    <button onClick={() => setSubTab('courses')} className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm min-h-[44px] transition-all font-medium ${subTab === 'courses' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}>Courses</button>
                    <button onClick={() => setSubTab('timetable')} className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm min-h-[44px] transition-all font-medium ${subTab === 'timetable' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}>Timetable</button>
                    <button onClick={() => setSubTab('exams')} className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm min-h-[44px] transition-all font-medium ${subTab === 'exams' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}>Exams</button>
                </div>
            </div>

            <Card className="bg-card border-border overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div key={subTab} {...animProps} className="p-0">
                        {subTab === 'courses' && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Dept</TableHead>
                                        <TableHead>Credits</TableHead>
                                        <TableHead>Faculty</TableHead>
                                        <TableHead>Students</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableStateWrapper loading={false} empty={false} colSpan={7}>
                                        {[1, 2, 3].map(i => (
                                            <TableRow key={i}>
                                                <TableCell className="font-mono text-xs">CS-10{i}</TableCell>
                                                <TableCell className="font-medium">Information Systems {i}</TableCell>
                                                <TableCell>Computer Science</TableCell>
                                                <TableCell>3</TableCell>
                                                <TableCell>Prof. Alan</TableCell>
                                                <TableCell>45</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px]"><Edit className="w-4 h-4 text-red-500" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableStateWrapper>
                                </TableBody>
                            </Table>
                        )}
                        {subTab === 'timetable' && (
                            <div className="p-4 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex gap-2">
                                        <div className="w-[140px]">
                                            <CustomSelect value="cs" onChange={() => {}} options={[{value: 'cs', label: 'CS Dept'}]} />
                                        </div>
                                        <div className="w-[140px]">
                                            <CustomSelect value="y1" onChange={() => {}} options={[{value: 'y1', label: 'Year 1'}]} />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-muted-foreground mr-2">Edit Mode</span>
                                        <Switch checked={editTimetable} onCheckedChange={setEditTimetable} />
                                        {editTimetable && <Button className="ml-2 bg-red-600 hover:bg-red-700 min-h-[44px]" onClick={() => toast.success("Timetable changes saved")}>Save Changes</Button>}
                                    </div>
                                </div>
                                <div className="border border-border rounded-xl overflow-x-auto">
                                    <table className="w-full text-sm text-left">
                                        <thead className="bg-muted text-muted-foreground">
                                            <tr>
                                                <th className="p-3 border-b border-border">Day</th>
                                                {[1, 2, 3, 4, 5, 6, 7, 8].map(p => <th key={p} className="p-3 border-b border-l border-border text-center">P{p}</th>)}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                                <tr key={d} className="border-b border-border last:border-0 hover:bg-muted/50">
                                                    <td className="p-3 font-medium bg-muted/20">{d}</td>
                                                    {[1, 2, 3, 4, 5, 6, 7, 8].map(p => (
                                                        <td key={p} className={`border-l border-border p-2 min-w-[100px] text-center ${editTimetable ? 'cursor-text hover:bg-red-500/5' : ''}`}>
                                                            {editTimetable ? (
                                                                <input type="text" defaultValue={`CS10${p}`} className="w-full bg-transparent border-0 text-center focus:ring-1 focus:ring-red-500 rounded p-1" />
                                                            ) : (
                                                                <span className="text-xs font-mono text-muted-foreground">CS10{p}</span>
                                                            )}
                                                        </td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                        {subTab === 'exams' && (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Exam Name</TableHead>
                                        <TableHead>Dept</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Hall</TableHead>
                                        <TableHead>Invigilator</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableStateWrapper loading={false} empty={false} colSpan={6}>
                                        {[1, 2].map(i => (
                                            <TableRow key={i}>
                                                <TableCell className="font-medium">Midterms - Software Eng</TableCell>
                                                <TableCell>CS</TableCell>
                                                <TableCell>14 Nov 2026</TableCell>
                                                <TableCell>Hall {i}</TableCell>
                                                <TableCell>Dr. Smith</TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="icon" className="text-red-500 min-h-[44px] min-w-[44px]"><Edit className="w-4 h-4" /></Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableStateWrapper>
                                </TableBody>
                            </Table>
                        )}
                    </motion.div>
                </AnimatePresence>
            </Card>
        </SectionWrapper>
    );
};

const FinanceControlSection = () => {
    const [subTab, setSubTab] = useState<'fees' | 'salary'>('fees');
    const animProps = useAnimationProps();

    return (
        <SectionWrapper>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex bg-muted p-1 rounded-full w-full sm:w-fit overflow-x-auto">
                    <button onClick={() => setSubTab('fees')} className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm min-h-[44px] transition-all font-medium ${subTab === 'fees' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}>Fees</button>
                    <button onClick={() => setSubTab('salary')} className={`flex-1 sm:flex-none px-6 py-2 rounded-full text-sm min-h-[44px] transition-all font-medium ${subTab === 'salary' ? 'bg-red-500 text-white shadow' : 'text-muted-foreground hover:bg-card hover:text-foreground'}`}>Salary</button>
                </div>
            </div>

            <Card className="bg-card border-border overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div key={subTab} {...animProps}>
                        {subTab === 'fees' ? (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Dept</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead>Total Fee</TableHead>
                                        <TableHead>Collected</TableHead>
                                        <TableHead>Pending</TableHead>
                                        <TableHead>Defaulters</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableStateWrapper loading={false} empty={false} colSpan={7}>
                                        {[1, 2, 3].map(i => (
                                            <TableRow key={i}>
                                                <TableCell>Computer Science</TableCell>
                                                <TableCell>Sem {i}</TableCell>
                                                <TableCell className="font-mono text-red-500">$5,000</TableCell>
                                                <TableCell className="text-emerald-500">$4,100</TableCell>
                                                <TableCell className="text-amber-500">$900</TableCell>
                                                <TableCell><Badge variant="outline" className="text-red-500 bg-red-500/10 min-h-[24px]">12</Badge></TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="outline" size="sm" onClick={() => toast.success("Fee waived")} className="min-h-[44px]">Waive</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableStateWrapper>
                                </TableBody>
                            </Table>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Staff ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Base Salary</TableHead>
                                        <TableHead>Net Pay</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <TableStateWrapper loading={false} empty={false} colSpan={6}>
                                        {[1, 2].map(i => (
                                            <TableRow key={i}>
                                                <TableCell className="font-mono text-xs">STF-00{i}</TableCell>
                                                <TableCell className="font-medium">Faculty Member {i}</TableCell>
                                                <TableCell>$6,000</TableCell>
                                                <TableCell className="font-bold text-emerald-500">$6,400</TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className="text-amber-500 min-h-[24px]">Pending</Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" className="text-red-500 min-h-[44px]" onClick={() => toast.success("Payment Released")}>Release</Button>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableStateWrapper>
                                </TableBody>
                            </Table>
                        )}
                    </motion.div>
                </AnimatePresence>
            </Card>
        </SectionWrapper>
    );
};

const AnnouncementsSection = () => (
    <SectionWrapper>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle>Compose Announcement</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Title</label>
                        <Input placeholder="Enter announcement title" className="bg-muted border-border min-h-[44px]" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Target Audience</label>
                        <div className="flex flex-wrap gap-2">
                            {['All', 'Student', 'Staff', 'Management'].map((t, i) => (
                                <Badge key={t} variant={i === 0 ? 'default' : 'outline'} className={`cursor-pointer min-h-[44px] px-4 ${i === 0 ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-muted-foreground'}`}>{t}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Priority</label>
                        <div className="flex flex-wrap gap-2">
                            {['Normal', 'Important', 'Urgent'].map((t, i) => (
                                <Badge key={t} variant={i === 2 ? 'default' : 'outline'} className={`cursor-pointer min-h-[44px] px-4 ${i === 2 ? 'bg-red-500 hover:bg-red-600 text-white' : 'text-muted-foreground'}`}>{t}</Badge>
                            ))}
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Message</label>
                        <textarea placeholder="Type message here..." className="flex w-full rounded-md border text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 p-3 bg-muted border-border min-h-[120px] resize-none" />
                    </div>
                    <div className="flex gap-4 pt-4">
                        <Button className="flex-1 bg-red-600 hover:bg-red-700 text-white min-h-[44px]">Publish Now</Button>
                        <Button variant="outline" className="flex-1 min-h-[44px]">Save Draft</Button>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-card border-border">
                <CardHeader>
                    <CardTitle>Recent Announcements</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="p-4 rounded-xl bg-muted/50 border border-border flex flex-col gap-2">
                            <div className="flex justify-between items-start">
                                <h4 className="font-semibold text-foreground">System Downtime Notice</h4>
                                <div className="flex items-center gap-2">
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 min-h-[44px] min-w-[44px]"><Edit className="w-4 h-4" /></Button>
                                    <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-red-500 min-h-[44px] min-w-[44px]"><Trash className="w-4 h-4" /></Button>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/10 min-h-[24px]">Urgent</Badge>
                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 min-h-[24px]">All Users</Badge>
                                <span className="text-xs text-muted-foreground ml-auto">2 hours ago</span>
                            </div>
                        </div>
                    ))}
                </CardContent>
            </Card>
        </div>
    </SectionWrapper>
);

const PermissionsSection = () => (
    <SectionWrapper>
        <Card className="bg-card border-border overflow-hidden">
            <CardHeader>
                <CardTitle>Role Permissions Matrix</CardTitle>
                <CardDescription>Toggle module access per role. Changes apply immediately to active sessions.</CardDescription>
            </CardHeader>
            <CardContent className="p-0 overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[150px]">Module / Role</TableHead>
                            {['Student', 'Staff', 'HOD', 'Admin', 'Board'].map(r => <TableHead key={r} className="text-center">{r}</TableHead>)}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {['Dashboard', 'Fees', 'Library', 'Reports', 'Settings'].map((module, i) => (
                            <TableRow key={module}>
                                <TableCell className="font-medium">{module}</TableCell>
                                {[1, 2, 3, 4, 5].map(role => (
                                    <TableCell key={role} className="text-center">
                                        <Switch
                                            defaultChecked={role > 2 || (i === 0 && role > 0)}
                                            onCheckedChange={() => toast.success(`Permission updated for ${module}`)}
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

        <Card className="bg-card border-border">
            <CardHeader>
                <CardTitle className="flex items-center gap-2"><KeySquare className="w-5 h-5 text-red-500" /> MFA Enforcement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {['Staff', 'Management', 'Admin'].map(r => (
                    <div key={r} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg border border-border">
                        <div>
                            <p className="font-medium text-foreground">Require MFA for {r}</p>
                            <p className="text-xs text-muted-foreground">Force multi-factor authentication on next login.</p>
                        </div>
                        <Switch defaultChecked={true} onCheckedChange={() => toast.success("MFA policy updated")} />
                    </div>
                ))}
            </CardContent>
        </Card>
    </SectionWrapper>
);

const AuditLogSection = () => (
    <SectionWrapper>
        <div className="flex flex-col sm:flex-row items-center gap-4">
            <Input placeholder="Start Date" type="date" className="bg-card border-border min-h-[44px]" />
            <Input placeholder="End Date" type="date" className="bg-card border-border min-h-[44px]" />
            <div className="flex items-center gap-2 overflow-x-auto w-full">
                <Badge className="bg-red-500 text-white whitespace-nowrap min-h-[44px] px-4 cursor-pointer">All Roles</Badge>
                <Badge variant="outline" className="whitespace-nowrap min-h-[44px] px-4 text-muted-foreground cursor-pointer">Admin Only</Badge>
            </div>
            <Button className="bg-red-600 hover:bg-red-700 text-white min-h-[44px]"><Download className="w-4 h-4 mr-2" /> Export Log</Button>
        </div>

        <Card className="bg-card border-border">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Timestamp</TableHead>
                        <TableHead>User / Role</TableHead>
                        <TableHead>Action</TableHead>
                        <TableHead>IP Address</TableHead>
                        <TableHead>Status</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    <TableStateWrapper loading={false} empty={false} colSpan={5}>
                        {Array.from({ length: 15 }).map((_, i) => (
                            <TableRow key={i}>
                                <TableCell className="text-xs text-muted-foreground font-mono">2026-03-08 10:{20 + i}:00</TableCell>
                                <TableCell>
                                    <p className="font-medium">User {i}</p>
                                    <p className="text-xs text-muted-foreground">{i % 2 === 0 ? 'Admin' : 'Staff'}</p>
                                </TableCell>
                                <TableCell className="text-muted-foreground">Updated system settings {i}</TableCell>
                                <TableCell className="font-mono text-xs">192.168.1.{10 + i}</TableCell>
                                <TableCell>
                                    {i % 3 === 0 ? (
                                        <Badge variant="outline" className="text-red-500 border-red-500/20 bg-red-500/10 min-h-[24px]">Failed</Badge>
                                    ) : (
                                        <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 min-h-[24px]">Success</Badge>
                                    )}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableStateWrapper>
                </TableBody>
            </Table>
        </Card>
    </SectionWrapper>
);

const BackupsSection = () => (
    <SectionWrapper>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="bg-card border-border">
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Last Backup</p>
                    <p className="text-xl font-bold mt-1 text-emerald-500">2 hours ago</p>
                </CardContent>
            </Card>
            <Card className="bg-card border-border">
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Next Scheduled</p>
                    <p className="text-xl font-bold mt-1 text-foreground">Tomorrow, 2:00 AM</p>
                </CardContent>
            </Card>
            <Card className="bg-card border-border">
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">Total Snapshots</p>
                    <p className="text-xl font-bold mt-1 text-foreground">24</p>
                </CardContent>
            </Card>
            <Card className="bg-card border-border">
                <CardContent className="p-6">
                    <p className="text-sm font-medium text-muted-foreground">DB Size</p>
                    <p className="text-xl font-bold mt-1 text-red-500">42.5 GB</p>
                </CardContent>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="bg-card border-border lg:col-span-2">
                <CardHeader>
                    <CardTitle>History</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Snapshot</TableHead>
                                <TableHead>Date</TableHead>
                                <TableHead>Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            <TableStateWrapper loading={false} empty={false} colSpan={5}>
                                {[1, 2, 3].map(i => (
                                    <TableRow key={i}>
                                        <TableCell className="font-mono text-xs text-muted-foreground">SNAP-2026030{i}</TableCell>
                                        <TableCell>Mar 0{i}, 2026</TableCell>
                                        <TableCell><Badge variant="outline" className="bg-muted min-h-[24px]">{i === 1 ? 'Manual' : 'Auto'}</Badge></TableCell>
                                        <TableCell><Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/10 min-h-[24px]">Success</Badge></TableCell>
                                        <TableCell className="text-right flex items-center justify-end gap-2">
                                            <Button variant="outline" size="sm" className="min-h-[44px]">Restore</Button>
                                            <Button variant="ghost" size="icon" className="min-h-[44px] min-w-[44px] hover:text-red-500"><Download className="w-4 h-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableStateWrapper>
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
            <Card className="bg-card border-border h-fit">
                <CardHeader>
                    <CardTitle>Control Panel</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <Button className="w-full bg-amber-500 hover:bg-amber-600 text-white min-h-[44px]" onClick={() => toast.success("Manual Backup Started")}>
                        <DatabaseBackup className="w-4 h-4 mr-2" /> Trigger Manual Backup
                    </Button>
                    <div className="space-y-4">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Schedule Frequency</label>
                        <div className="flex flex-wrap gap-2">
                            <Badge className="bg-red-500 hover:bg-red-600 text-white cursor-pointer min-h-[44px] px-4">Daily</Badge>
                            <Badge variant="outline" className="text-muted-foreground cursor-pointer min-h-[44px] px-4">Weekly</Badge>
                            <Badge variant="outline" className="text-muted-foreground cursor-pointer min-h-[44px] px-4">Monthly</Badge>
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">Execution Time (UTC)</label>
                        <Input type="time" defaultValue="02:00" className="bg-muted border-border min-h-[44px]" />
                        <Button variant="outline" className="w-full min-h-[44px] text-red-500 border-red-500 hover:bg-red-500 hover:text-white" onClick={() => toast.success("Schedule Saved")}>Save Schedule</Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    </SectionWrapper>
);

// --- Main Dashboard ---
export default function AdminDashboard() {
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [activeSection, setActiveSection] = useState('vitalStats');

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 1024);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('userRole');
        localStorage.removeItem('userId');
        toast.info("Logged out successfully");
        navigate('/');
    };

    const navItems = [
        { id: 'vitalStats', icon: LayoutDashboard, label: 'Vital Stats' },
        { id: 'portalManager', icon: MonitorCheck, label: 'Portal Manager' },
        { id: 'people', icon: Users, label: 'People' },
        { id: 'academicControl', icon: BookOpen, label: 'Academic Control' },
        { id: 'financeControl', icon: DollarSign, label: 'Finance Control' },
        { id: 'announcements', icon: Megaphone, label: 'Announcements' },
        { id: 'permissions', icon: ShieldCheck, label: 'Permissions' },
        { id: 'auditLog', icon: ScrollText, label: 'Audit Log' },
        { id: 'backups', icon: DatabaseBackup, label: 'Backups' },
    ];

    const renderSection = () => {
        switch (activeSection) {
            case 'vitalStats': return <VitalStatsSection />;
            case 'portalManager': return <PortalManagerSection />;
            case 'people': return <PeopleSection />;
            case 'academicControl': return <AcademicControlSection />;
            case 'financeControl': return <FinanceControlSection />;
            case 'announcements': return <AnnouncementsSection />;
            case 'permissions': return <PermissionsSection />;
            case 'auditLog': return <AuditLogSection />;
            case 'backups': return <BackupsSection />;
            default: return <VitalStatsSection />;
        }
    };

    return (
        <div className="min-h-screen w-full bg-background text-foreground flex font-sans selection:bg-red-500/30">
            {/* Sidebar Overlay */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 z-40 lg:hidden"
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
                    bg-card border-r border-border
                    ${mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'} lg:translate-x-0
                    transition-transform lg:transition-none
                `}
            >
                <div className="h-16 flex items-center gap-3 px-4 border-b border-border">
                    <div className="w-9 h-9 rounded-lg bg-red-600 text-white flex items-center justify-center flex-shrink-0">
                        <Shield className="w-5 h-5" />
                    </div>
                    <AnimatePresence>
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }}
                                className="font-bold text-sm tracking-wide whitespace-nowrap"
                            >
                                ADMIN PORTAL
                            </motion.span>
                        )}
                    </AnimatePresence>
                </div>

                <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto custom-scrollbar">
                    {navItems.map((item) => {
                        const isActive = activeSection === item.id;
                        return (
                            <button
                                key={item.id}
                                onClick={() => {
                                    setActiveSection(item.id);
                                    if (isMobile) setMobileMenuOpen(false);
                                }}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all duration-200 min-h-[44px]
                                    ${isActive
                                        ? 'bg-primary/10 text-primary font-semibold border-l-2 border-primary'
                                        : 'text-muted-foreground hover:bg-muted hover:text-foreground border-l-2 border-transparent'
                                    }
                                `}
                            >
                                <item.icon className="w-5 h-5 flex-shrink-0" />
                                <AnimatePresence>
                                    {sidebarOpen && (
                                        <motion.span
                                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
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

                <div className="p-3 border-t border-border mt-auto hidden lg:flex">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="w-full flex items-center justify-center py-2 rounded-lg text-muted-foreground hover:bg-muted transition-colors min-h-[44px]"
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
                <header className="sticky top-0 z-30 h-16 flex items-center justify-between gap-4 px-4 md:px-6 border-b border-border bg-card">
                    <div className="flex items-center gap-4 flex-1">
                        <button
                            className="lg:hidden p-2 rounded-lg text-muted-foreground hover:bg-muted min-h-[44px] min-w-[44px]"
                            onClick={() => setMobileMenuOpen(true)}
                        >
                            <Menu className="w-5 h-5" />
                        </button>

                        <div className="relative w-full max-w-md hidden sm:block">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search queries..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full pl-9 pr-4 bg-muted border-border min-h-[44px] focus-visible:ring-red-500 rounded-full"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                        <button onClick={handleLogout} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-red-500 transition-colors min-h-[44px] min-w-[44px]" title="Logout">
                            <LogOut className="w-5 h-5" />
                        </button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-muted transition-colors outline-none min-h-[44px]">
                                    <Avatar className="w-8 h-8 border border-red-500/20">
                                        <AvatarFallback className="bg-red-500/10 text-red-500 text-xs font-bold">
                                            AD
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="hidden md:block text-left text-sm">
                                        <p className="font-medium leading-none mb-1 text-foreground">System Admin</p>
                                        <p className="text-xs text-muted-foreground">Master Control</p>
                                    </div>
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 bg-card border-border">
                                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem onClick={handleLogout} className="text-red-500 cursor-pointer text-sm font-medium focus:bg-red-500/10 focus:text-red-500 min-h-[44px]">
                                    <LogOut className="w-4 h-4 mr-2" /> Logout
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </header>

                <main className="flex-1 p-4 lg:p-8 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div key={activeSection}>
                            {renderSection()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </motion.div>
        </div>
    );
}
