import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { 
    BookOpen, 
    Users, 
    Clock, 
    AlertTriangle,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    BookMarked,
    RefreshCcw
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';

// Animations
import { fadeSlideUp, staggerContainer } from '@/components/animations/transitions';

// Charts
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip as RechartsTooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from 'recharts';

import { toast } from 'sonner';

// --- MOCK DATA --- 

const kpiData = [
    { title: 'Total Titles', value: '42,580', change: '+2.4%', trend: 'up', icon: BookOpen, desc: 'Across all departments' },
    { title: 'Active Borrowers', value: '8,245', change: '+12%', trend: 'up', icon: Users, desc: 'Students & Staff' },
    { title: 'Overdue Items', value: '342', change: '-5.2%', trend: 'down', icon: Clock, desc: 'Pending returns' },
    { title: 'New Arrivals', value: '150', change: 'This Month', trend: 'neutral', icon: BookMarked, desc: 'Recently added' },
];

const circulationData = [
    { day: 'Mon', borrowed: 145, returned: 120 },
    { day: 'Tue', borrowed: 210, returned: 180 },
    { day: 'Wed', borrowed: 180, returned: 220 },
    { day: 'Thu', borrowed: 240, returned: 195 },
    { day: 'Fri', borrowed: 310, returned: 280 },
    { day: 'Sat', borrowed: 90, returned: 150 },
    { day: 'Sun', borrowed: 45, returned: 60 },
];

const recentActivity = [
    { id: '1', name: 'Alice Johnson', role: 'Student', book: 'Advanced Calculus', type: 'borrow', date: '2 hrs ago', status: 'Active' },
    { id: '2', name: 'Dr. Smith', role: 'Faculty', book: 'Quantum Mechanics', type: 'return', date: '4 hrs ago', status: 'Completed' },
    { id: '3', name: 'Bob Williams', role: 'Student', book: 'Data Structures', type: 'borrow', date: '5 hrs ago', status: 'Active' },
    { id: '4', name: 'Emma Davis', role: 'Student', book: 'Organic Chemistry', type: 'renewal', date: '1 day ago', status: 'Extended' },
    { id: '5', name: 'Prof. Wilson', role: 'Faculty', book: 'Machine Learning', type: 'return', date: '1 day ago', status: 'Completed' },
];

const subjectData = [
    { subject: 'Computer Science', total: 5400, available: 3200, lowStock: false },
    { subject: 'Engineering', total: 8200, available: 4100, lowStock: false },
    { subject: 'Mathematics', total: 3100, available: 850, lowStock: true },
    { subject: 'Physics', total: 2800, available: 1900, lowStock: false },
    { subject: 'Literature', total: 6500, available: 5800, lowStock: false },
    { subject: 'Medical', total: 4200, available: 600, lowStock: true },
];

const borrowerPieData = [
    { name: 'Undergraduates', value: 65 },
    { name: 'Postgraduates', value: 20 },
    { name: 'Faculty', value: 12 },
    { name: 'Staff', value: 3 },
];

const COLORS = ['#f59e0b', '#10b981', '#6366f1', '#8b5cf6']; // Amber, Emerald, Indigo, Violet

// Custom Tooltip for Charts
const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-slate-900/95 border border-slate-800 p-3 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-slate-200 font-medium mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
                        <span className="text-slate-400 capitalize">{entry.name}:</span>
                        <span className="text-white font-semibold">{entry.value}</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function LibraryOverview() {
    const [loading, setLoading] = useState(true);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoading(false);
        }, 1200);
        return () => clearTimeout(timer);
    }, []);

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => (
                        <Skeleton key={i} className="h-32 rounded-xl bg-[hsl(var(--surface-raised))]" />
                    ))}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-[400px] lg:col-span-2 rounded-xl bg-[hsl(var(--surface-raised))]" />
                    <Skeleton className="h-[400px] lg:col-span-1 rounded-xl bg-[hsl(var(--surface-raised))]" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <Skeleton className="h-[350px] rounded-xl bg-[hsl(var(--surface-raised))]" />
                    <Skeleton className="h-[350px] rounded-xl bg-[hsl(var(--surface-raised))]" />
                </div>
            </div>
        );
    }

    return (
        <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-6 pb-8"
        >
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Library Resources</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Circulation metrics and asset availability</p>
                </div>
                <Button 
                    variant="outline" 
                    className="gap-2 bg-[hsl(var(--surface-raised))]"
                    onClick={() => toast.success("Downloading Library Report...")}
                >
                    <Download className="w-4 h-4" />
                    Export Report
                </Button>
            </div>

            {/* KPI Cards Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiData.map((kpi, idx) => (
                    <motion.div key={idx} variants={fadeSlideUp}>
                        <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm h-full">
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start">
                                    <div className="space-y-2">
                                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
                                            {kpi.title}
                                        </p>
                                        <p className="text-3xl font-bold text-slate-900 dark:text-white">
                                            {kpi.value}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-lg flex-shrink-0 ${
                                        kpi.title === 'Overdue Items' 
                                            ? 'bg-red-500/10 text-red-600 dark:text-red-400' 
                                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                                    }`}>
                                        <kpi.icon className="w-5 h-5" />
                                    </div>
                                </div>
                                <div className="mt-4 flex items-center gap-2 text-sm">
                                    {kpi.trend === 'up' ? (
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 shadow-none border-0 px-1.5 py-0 gap-1 rounded-sm">
                                            <ArrowUpRight className="w-3 h-3" />
                                            {kpi.change}
                                        </Badge>
                                    ) : kpi.trend === 'down' ? (
                                        <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 shadow-none border-0 px-1.5 py-0 gap-1 rounded-sm">
                                            <ArrowDownRight className="w-3 h-3" />
                                            {kpi.change}
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 shadow-none border-0 px-1.5 py-0 rounded-sm">
                                            {kpi.change}
                                        </Badge>
                                    )}
                                    <span className="text-slate-500 dark:text-slate-400">{kpi.desc}</span>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Circulation Chart & Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Chart */}
                <motion.div variants={fadeSlideUp} className="lg:col-span-2">
                    <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Weekly Circulation Activity</CardTitle>
                            <CardDescription>Borrowing and returning trends for the past 7 days</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="h-[300px] w-full">
                                <ResponsiveContainer width="100%" height="100%">
                                    <BarChart data={circulationData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                                        <XAxis 
                                            dataKey="day" 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                                            dy={10} 
                                        />
                                        <YAxis 
                                            axisLine={false} 
                                            tickLine={false} 
                                            tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }} 
                                        />
                                        <RechartsTooltip content={<CustomTooltip />} cursor={{ fill: 'hsl(var(--muted)/0.4)' }} />
                                        <Bar 
                                            dataKey="borrowed" 
                                            name="Borrowed" 
                                            fill="#f59e0b" // Amber
                                            radius={[4, 4, 0, 0]} 
                                            barSize={24}
                                            animationDuration={prefersReducedMotion ? 0 : 1500}
                                        />
                                        <Bar 
                                            dataKey="returned" 
                                            name="Returned" 
                                            fill="#64748b" // Slate
                                            radius={[4, 4, 0, 0]} 
                                            barSize={24}
                                            animationDuration={prefersReducedMotion ? 0 : 1500}
                                        />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Recent Activity */}
                <motion.div variants={fadeSlideUp} className="lg:col-span-1">
                    <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm h-full flex flex-col">
                        <CardHeader className="pb-3 flex flex-row items-center justify-between">
                            <div>
                                <CardTitle className="text-lg">Recent Ledger</CardTitle>
                                <CardDescription>Latest desk transactions</CardDescription>
                            </div>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400">
                                <RefreshCcw className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <div className="space-y-5">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-4">
                                        <Avatar className="w-9 h-9 border border-slate-200 dark:border-slate-800">
                                            <AvatarFallback className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs">
                                                {activity.name.split(' ').map(n => n[0]).join('')}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <p className="text-sm font-medium leading-none text-slate-900 dark:text-white">
                                                {activity.name}
                                            </p>
                                            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                                                <span className={`${activity.type === 'borrow' ? 'text-amber-500' : activity.type === 'return' ? 'text-emerald-500' : 'text-blue-500'}`}>
                                                    {activity.type === 'borrow' ? 'Borrowed' : activity.type === 'return' ? 'Returned' : 'Renewed'}
                                                </span>
                                                • {activity.book}
                                            </div>
                                        </div>
                                        <div className="text-xs text-slate-400 whitespace-nowrap">
                                            {activity.date}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            {/* Bottom Row - Subjects & Demographics */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Subject Availability */}
                <motion.div variants={fadeSlideUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Collection Status</CardTitle>
                            <CardDescription>Volume availability by major category</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-6">
                                {subjectData.map((sub, index) => (
                                    <div key={index} className="space-y-2">
                                        <div className="flex justify-between items-center text-sm">
                                            <div className="flex items-center gap-2">
                                                <span className="font-medium text-slate-700 dark:text-slate-200">{sub.subject}</span>
                                                {sub.lowStock && (
                                                    <Badge variant="destructive" className="h-5 px-1.5 text-[10px] bg-red-500/10 text-red-600 dark:text-red-400 hover:bg-red-500/20 shadow-none border-0">
                                                        Low Stock
                                                    </Badge>
                                                )}
                                            </div>
                                            <span className="text-slate-500">{((sub.available / sub.total) * 100).toFixed(0)}% Available</span>
                                        </div>
                                        <Progress 
                                            value={(sub.available / sub.total) * 100} 
                                            className="h-2 bg-slate-100 dark:bg-slate-800"
                                            indicatorClassName={sub.lowStock ? "bg-red-500" : "bg-amber-500"} 
                                        />
                                        <div className="flex justify-between text-xs text-slate-400">
                                            <span>{sub.available.toLocaleString('en-US')} on shelf</span>
                                            <span>{sub.total.toLocaleString('en-US')} total</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Demographics & Alerts */}
                <div className="space-y-6">
                     <motion.div variants={fadeSlideUp}>
                        <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm">
                            <CardHeader>
                                <CardTitle className="text-lg">Borrower Demographics</CardTitle>
                                <CardDescription>Active users by role</CardDescription>
                            </CardHeader>
                            <CardContent className="flex items-center justify-between pb-2">
                                <div className="h-[200px] w-1/2">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={borrowerPieData}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                animationDuration={prefersReducedMotion ? 0 : 1500}
                                                stroke="none"
                                            >
                                                {borrowerPieData.map((_, index) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <RechartsTooltip content={<CustomTooltip />} />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </div>
                                <div className="w-1/2 pl-4 space-y-3">
                                    {borrowerPieData.map((item, i) => (
                                        <div key={i} className="flex items-center justify-between text-sm">
                                            <div className="flex items-center gap-2">
                                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                                <span className="text-slate-600 dark:text-slate-300">{item.name}</span>
                                            </div>
                                            <span className="font-semibold text-slate-900 dark:text-white">{item.value}%</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>

                     <motion.div variants={fadeSlideUp}>
                        <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500" />
                            <CardContent className="p-6">
                                <div className="flex items-start gap-4">
                                    <div className="p-2.5 bg-amber-500/10 rounded-lg shrink-0">
                                        <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                                    </div>
                                    <div>
                                        <h4 className="text-base font-semibold text-slate-900 dark:text-white">Procurement Required</h4>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                                            Medical literature and core Mathematics texts are running below 30% availability threshold. Consider initiating new purchase requests.
                                        </p>
                                        <Button variant="outline" size="sm" className="mt-4 bg:transparent border-amber-200 text-amber-700 hover:bg-amber-50 dark:border-amber-900 dark:text-amber-400 dark:hover:bg-amber-900/30">
                                            Review Procurement Plan
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                </div>
            </div>
        </motion.div>
    );
}
