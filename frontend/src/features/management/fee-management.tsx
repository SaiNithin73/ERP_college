import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useReducedMotion } from 'framer-motion';
import { 
    IndianRupee, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    TrendingUp, 
    PieChart as PieChartIcon,
    AlertTriangle,
    Info,
    ArrowUpRight,
    ArrowDownRight,
    Download,
    FileText,
    Send,
    BarChart3
} from 'lucide-react';

// UI Components
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Animations
import { fadeSlideUp, staggerContainer } from '@/components/animations/transitions';

// Charts
import {
    AreaChart,
    Area,
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


import { formatCurrency } from '@/lib/formatters';

// --- TYPES ---

interface KPIStat {
    title: string;
    value: string;
    fullValue: string;
    sub: string;
    trend: string;
    trendIcon: any;
    icon: any;
    color: string;
    borderColor: string;
}

interface DeptFeeData {
    id: string;
    name: string;
    students: number;
    totalDue: number;
    collected: number;
    pending: number;
    percent: number;
    defaulters: number;
    status: 'On Track' | 'At Risk' | 'Critical';
}

interface DefaulterData {
    rank: number;
    name: string;
    roll: string;
    dept: string;
    semester: string;
    pending: number;
    overdueSince: string;
}

// --- HELPERS ---

const formatCrore = (num: number): string => {
    if (num >= 10000000) {
        return `₹${(num / 10000000).toFixed(2)} Cr`;
    }
    if (num >= 100000) {
        return `₹${(num / 100000).toFixed(2)} L`;
    }
    return formatCurrency(num);
};

// --- MOCK DATA ---

const kpiStats: KPIStat[] = [
    { 
        title: 'Total Fees Due (AY 2025–26)', 
        value: '₹8.24 Cr', 
        fullValue: '₹8,24,75,000',
        sub: 'Across all departments & semesters', 
        trend: '+8.4% vs last year', 
        trendIcon: ArrowUpRight,
        icon: IndianRupee, 
        color: 'text-warning-surface',
        borderColor: 'border-warning-surface'
    },
    { 
        title: 'Fee Collected So Far', 
        value: '₹6.92 Cr', 
        fullValue: '₹6,92,40,000',
        sub: '83.9% collection rate', 
        trend: 'On track for target', 
        trendIcon: ArrowUpRight,
        icon: CheckCircle, 
        color: 'text-emerald-500',
        borderColor: 'border-warning-surface'
    },
    { 
        title: 'Outstanding Pending', 
        value: '₹1.32 Cr', 
        fullValue: '₹1,32,35,000',
        sub: 'From 2,840 students', 
        trend: '16.1% still pending', 
        trendIcon: ArrowDownRight,
        icon: Clock, 
        color: 'text-warning-surface',
        borderColor: 'border-warning-surface'
    },
    { 
        title: 'Students in Default', 
        value: '320', 
        fullValue: '320',
        sub: 'Dues overdue by 60+ days', 
        trend: '+28 from last month', 
        trendIcon: ArrowUpRight,
        icon: AlertCircle, 
        color: 'text-danger-surface',
        borderColor: 'border-danger-surface'
    }
];

const monthlyTrendData = [
    { month: 'Apr', collected: 420, target: 480 },
    { month: 'May', collected: 380, target: 400 },
    { month: 'Jun', collected: 890, target: 850 },
    { month: 'Jul', collected: 760, target: 800 },
    { month: 'Aug', collected: 920, target: 880 },
    { month: 'Sep', collected: 540, target: 600 },
    { month: 'Oct', collected: 480, target: 500 },
    { month: 'Nov', collected: 610, target: 580 },
    { month: 'Dec', collected: 390, target: 450 },
    { month: 'Jan', collected: 720, target: 700 },
    { month: 'Feb', collected: 580, target: 600 },
    { month: 'Mar', collected: 0, target: 620 },
];

const pieData = [
    { name: 'Tuition Fee', value: 68, color: 'hsl(var(--warning-surface))' },
    { name: 'Exam Fee', value: 12, color: 'hsl(var(--info-surface))' },
    { name: 'Hostel Fee', value: 10, color: 'hsl(var(--success))' },
    { name: 'Lab Fee', value: 6, color: 'hsl(var(--primary))' },
    { name: 'Other Fees', value: 4, color: 'hsl(var(--muted-foreground))' },
];

const departmentData: DeptFeeData[] = [
    { id: 'cse', name: 'CS & Engg', students: 3240, totalDue: 24300000, collected: 21800000, pending: 2500000, percent: 89.7, defaulters: 18, status: 'On Track' },
    { id: 'ece', name: 'ECE', students: 2180, totalDue: 16400000, collected: 14100000, pending: 2300000, percent: 86.0, defaulters: 24, status: 'On Track' },
    { id: 'mech', name: 'Mechanical', students: 1950, totalDue: 14600000, collected: 11800000, pending: 2800000, percent: 80.8, defaulters: 38, status: 'At Risk' },
    { id: 'civil', name: 'Civil', students: 1620, totalDue: 12200000, collected: 9400000, pending: 2800000, percent: 77.0, defaulters: 42, status: 'At Risk' },
    { id: 'mba', name: 'MBA', students: 1840, totalDue: 18400000, collected: 14700000, pending: 3700000, percent: 79.9, defaulters: 31, status: 'At Risk' },
    { id: 'mca', name: 'MCA', students: 1420, totalDue: 9900000, collected: 8700000, pending: 1200000, percent: 87.9, defaulters: 14, status: 'On Track' },
    { id: 'law', name: 'Law', students: 1000, totalDue: 6600000, collected: 3700000, pending: 2900000, percent: 56.1, defaulters: 153, status: 'Critical' },
];

const defaulters: DefaulterData[] = [
    { rank: 1, name: 'Ramesh Kumar', roll: 'CS2021042', dept: 'CS', semester: 'Sem 5', pending: 92000, overdueSince: '15/08/2025' },
    { rank: 2, name: 'Divya Menon', roll: 'LA2022018', dept: 'Law', semester: 'Sem 3', pending: 84500, overdueSince: '01/09/2025' },
    { rank: 3, name: 'Suresh Pillai', roll: 'LA2021033', dept: 'Law', semester: 'Sem 5', pending: 78000, overdueSince: '20/07/2025' },
    { rank: 4, name: 'Ananya Roy', roll: 'ME2022009', dept: 'ME', semester: 'Sem 3', pending: 71500, overdueSince: '10/09/2025' },
    { rank: 5, name: 'Vijay Sharma', roll: 'CE2021027', dept: 'CE', semester: 'Sem 5', pending: 68000, overdueSince: '05/08/2025' },
    { rank: 6, name: 'Preethi Nair', roll: 'LA2023041', dept: 'Law', semester: 'Sem 1', pending: 62500, overdueSince: '15/10/2025' },
    { rank: 7, name: 'Karthik Das', roll: 'ME2022031', dept: 'ME', semester: 'Sem 3', pending: 58000, overdueSince: '20/09/2025' },
    { rank: 8, name: 'Lakshmi Iyer', roll: 'CE2022015', dept: 'CE', semester: 'Sem 3', pending: 54500, overdueSince: '01/10/2025' },
];

const semesterSummary = [
    { sem: 'Sem 1', due: 184, collected: 168, rate: 91.3 },
    { sem: 'Sem 2', due: 184, collected: 172, rate: 93.5 },
    { sem: 'Sem 3', due: 192, collected: 174, rate: 90.6 },
    { sem: 'Sem 4', due: 192, collected: 168, rate: 87.5 },
    { sem: 'Sem 5', due: 198, collected: 152, rate: 76.8 },
    { sem: 'Sem 6', due: 198, collected: 144, rate: 72.7 },
    { sem: 'Sem 7', due: 148, collected: 108, rate: 72.9 },
    { sem: 'Sem 8', due: 148, collected: 106, rate: 71.6 },
];

// --- COMPONENTS ---

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-surface-raised border border-border shadow-md p-3 rounded-lg overflow-hidden">
                <p className="text-sm font-bold text-foreground mb-2">{label}</p>
                {payload.map((entry: any, index: number) => (
                    <div key={index} className="flex items-center justify-between gap-4 py-1 border-t border-border/50 first:border-0">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color || entry.fill }} />
                            <span className="text-xs text-muted-foreground">{entry.name}:</span>
                        </div>
                        <span className="text-xs font-bold text-foreground">₹{entry.value} L</span>
                    </div>
                ))}
            </div>
        );
    }
    return null;
};

export default function FeeManagement() {
    const [loadingFeeManagement, setLoadingFeeManagement] = useState(true);
    const prefersReducedMotion = useReducedMotion();

    useEffect(() => {
        const timer = setTimeout(() => {
            setLoadingFeeManagement(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    if (loadingFeeManagement) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-32 rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <Skeleton className="h-[400px] lg:col-span-2 rounded-xl" />
                    <Skeleton className="h-[400px] rounded-xl" />
                </div>
                <Skeleton className="h-[500px] w-full rounded-xl" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map(i => <Skeleton key={i} className="h-[400px] rounded-xl" />)}
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {[1, 2].map(i => <Skeleton key={i} className="h-[300px] rounded-xl" />)}
                </div>
            </div>
        );
    }

    return (
        <motion.div 
            variants={staggerContainer} 
            initial="hidden" 
            animate="visible" 
            className="space-y-6 pb-12"
        >
            {/* Preview Banner */}
            <div className="bg-warning-surface/10 border border-warning-surface/30 rounded-lg px-4 py-2 flex items-center gap-3">
                <Info className="w-5 h-5 text-warning-surface" />
                <p className="text-sm text-warning-surface italic">
                    Preview Mode — Showing representative institutional data. Connect backend endpoints for live figures.
                </p>
            </div>

            {/* Row 1 — KPI Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {kpiStats.map((stat, idx) => (
                    <motion.div 
                        key={idx} 
                        variants={prefersReducedMotion ? {} : fadeSlideUp}
                        transition={{ delay: idx * 0.05 }}
                    >
                        <Card className={`bg-surface-raised border-border shadow-md border-l-4 ${stat.borderColor} h-full`}>
                            <CardContent className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-lg bg-surface-sunken`}>
                                        <stat.icon className={`w-6 h-6 ${stat.color}`} />
                                    </div>
                                    <Badge variant="outline" className={`border-none bg-surface-sunken text-[10px] font-bold uppercase tracking-wider`}>
                                        FEE STAT
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                                    <h3 className="text-2xl font-bold tracking-tight">{stat.value}</h3>
                                    <p className="text-[10px] text-muted-foreground font-mono">{stat.fullValue}</p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-border/50 flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <stat.trendIcon className={`w-3 h-3 ${stat.trend.includes('-') ? 'text-amber-500' : stat.color.includes('danger') ? 'text-red-500' : 'text-emerald-500'}`} />
                                        <span className="text-xs font-semibold">{stat.trend}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground italic px-5">{stat.sub}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>

            {/* Row 2 — Monthly Collection Trend + Collection Rate */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Monthly Collection */}
                <Card className="lg:col-span-2 bg-surface-raised border-border shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <TrendingUp className="w-5 h-5 text-warning-surface" />
                            <CardTitle className="text-lg font-bold">Monthly Fee Collection — AY 2025–26</CardTitle>
                        </div>
                        <span className="text-sm text-muted-foreground">Target: ₹8.24 Cr</span>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[280px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={monthlyTrendData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="hsl(var(--warning-surface))" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="hsl(var(--warning-surface))" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="month" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }}
                                        tickFormatter={(val) => `₹${val}L`}
                                    />
                                    <RechartsTooltip content={<CustomTooltip />} />
                                    <Area 
                                        type="monotone" 
                                        dataKey="collected" 
                                        name="Collected"
                                        stroke="hsl(var(--warning-surface))" 
                                        strokeWidth={3}
                                        fillOpacity={1} 
                                        fill="url(#colorCollected)" 
                                        animationDuration={prefersReducedMotion ? 0 : 1500}
                                    />
                                    <Area 
                                        type="monotone" 
                                        dataKey="target" 
                                        name="Target"
                                        stroke="hsl(var(--warning-surface))" 
                                        strokeWidth={2}
                                        strokeDasharray="5 5"
                                        fillOpacity={0} 
                                        animationDuration={prefersReducedMotion ? 0 : 1500}
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Collection Rate Breakdown */}
                <Card className="lg:col-span-1 bg-surface-raised border-border shadow-md flex flex-col">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <PieChartIcon className="w-5 h-5 text-warning-surface" />
                        <CardTitle className="text-lg font-bold">Collection Rate by Fee Type</CardTitle>
                    </CardHeader>
                    <CardContent className="flex-1 flex flex-col justify-center gap-6">
                        <div className="h-[200px] w-full relative">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={pieData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={55}
                                        outerRadius={85}
                                        paddingAngle={5}
                                        dataKey="value"
                                        stroke="none"
                                        animationDuration={prefersReducedMotion ? 0 : 1500}
                                    >
                                        {pieData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                <span className="text-2xl font-bold">83.9%</span>
                                <span className="text-[10px] text-muted-foreground uppercase font-semibold">Collected</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-2">
                            {pieData.map((item, i) => (
                                <div key={i} className="flex items-center justify-between text-xs py-1 border-b border-border/30 last:border-0">
                                    <div className="flex items-center gap-2">
                                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                                        <span className="font-medium">{item.name}</span>
                                    </div>
                                    <span className="font-bold">{item.value}%</span>
                                </div>
                            ))}
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 border-none px-2 py-0.5">
                                High: Tuition (91.2%)
                            </Badge>
                            <Badge variant="outline" className="text-[10px] bg-amber-500/10 text-amber-600 border-none px-2 py-0.5">
                                Low: Hostel (74.8%)
                            </Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 3 — Department-wise Fee Status Table */}
            <Card className="bg-surface-raised border-border shadow-md">
                <CardHeader className="flex flex-row items-center justify-between border-b border-border/50 pb-4">
                    <CardTitle className="text-lg font-bold">Department-wise Fee Collection Status</CardTitle>
                    <span className="text-sm text-muted-foreground">AY 2025–26 · As of 05/03/2026</span>
                </CardHeader>
                <CardContent className="pt-6">
                    <Tabs defaultValue="all" className="w-full">
                        <TabsList className="mb-6 bg-surface-sunken p-1">
                            <TabsTrigger value="all" className="data-[state=active]:bg-surface-raised">All Departments</TabsTrigger>
                            <TabsTrigger value="above85" className="data-[state=active]:bg-surface-raised">Above 85%</TabsTrigger>
                            <TabsTrigger value="below75" className="data-[state=active]:bg-surface-raised text-red-500 data-[state=active]:text-red-500">Below 75%</TabsTrigger>
                        </TabsList>

                        <TabsContent value="all">
                            <div className="rounded-md border border-border overflow-hidden bg-surface-sunken/30">
                                <Table>
                                    <TableHeader className="bg-surface-sunken">
                                        <TableRow className="hover:bg-transparent border-border">
                                            <TableHead className="w-[180px]">Department</TableHead>
                                            <TableHead className="text-right">Students</TableHead>
                                            <TableHead className="text-right">Total Due</TableHead>
                                            <TableHead className="text-right">Collected</TableHead>
                                            <TableHead className="text-right">Pending</TableHead>
                                            <TableHead className="w-[180px]">Collection %</TableHead>
                                            <TableHead className="text-right">Defaulters</TableHead>
                                            <TableHead className="text-right">Status</TableHead>
                                            <TableHead></TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {departmentData.map((dept) => (
                                            <TableRow key={dept.id} data-testid={`fee-row-${dept.id}`} className="border-border/50 hover:bg-surface-sunken/50 transition-colors group">
                                                <TableCell className="font-bold py-4">{dept.name}</TableCell>
                                                <TableCell className="text-right font-mono text-xs">{dept.students.toLocaleString('en-IN')}</TableCell>
                                                <TableCell className="text-right font-bold">{formatCrore(dept.totalDue)}</TableCell>
                                                <TableCell className="text-right font-bold text-emerald-500">{formatCrore(dept.collected)}</TableCell>
                                                <TableCell className={`text-right font-bold ${dept.pending > (dept.totalDue * 0.2) ? 'text-red-500' : ''}`}>
                                                    {formatCrore(dept.pending)}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex flex-col gap-1.5">
                                                        <div className="flex justify-between text-[10px] font-bold">
                                                            <span>{dept.percent}%</span>
                                                        </div>
                                                        <Progress 
                                                            value={dept.percent} 
                                                            className="h-1.5" 
                                                            indicatorClassName={`${dept.percent >= 85 ? 'bg-emerald-500' : dept.percent >= 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                                                        />
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Badge className={`border-none shadow-none font-bold ${dept.defaulters > 30 ? 'bg-red-500/10 text-red-500' : dept.defaulters >= 10 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                                                        {dept.defaulters}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        <div className={`w-2 h-2 rounded-full ${dept.status === 'On Track' ? 'bg-emerald-500' : dept.status === 'At Risk' ? 'bg-amber-500' : 'bg-red-500'} shadow-[0_0_8px_rgba(var(--status-color),0.4)]`} />
                                                        <span className={`text-[11px] font-bold uppercase tracking-wider ${dept.status === 'On Track' ? 'text-emerald-500' : dept.status === 'At Risk' ? 'text-amber-500' : 'text-red-500'}`}>
                                                            {dept.status}
                                                        </span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                    <TableBody>
                                        <TableRow className="bg-surface-sunken hover:bg-surface-sunken border-none font-bold">
                                            <TableCell className="py-5">Institution Total</TableCell>
                                            <TableCell className="text-right font-mono text-xs">14,250</TableCell>
                                            <TableCell className="text-right">₹8.24 Cr</TableCell>
                                            <TableCell className="text-right text-emerald-500">₹6.92 Cr</TableCell>
                                            <TableCell className="text-right">₹1.32 Cr</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5 text-warning-surface">
                                                    <span className="text-[10px] text-right">83.9%</span>
                                                    <Progress value={83.9} className="h-1.5" indicatorClassName="bg-warning-surface" />
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Badge className="bg-red-500 text-white border-none shadow-lg">320</Badge>
                                            </TableCell>
                                            <TableCell className="text-right">—</TableCell>
                                        </TableRow>
                                    </TableBody>
                                </Table>
                            </div>
                        </TabsContent>

                        <TabsContent value="above85">
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mb-6 flex items-center gap-3">
                                <CheckCircle className="w-5 h-5 text-emerald-500" />
                                <span className="text-sm text-emerald-600 font-medium">3 departments are meeting or exceeding the 85% target.</span>
                            </div>
                            <div className="text-center py-12 text-muted-foreground text-sm italic">Filtered Department View Active</div>
                        </TabsContent>

                        <TabsContent value="below75">
                            <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 mb-6 flex items-start gap-4">
                                <AlertTriangle className="w-5 h-5 text-red-500 mt-0.5" />
                                <div className="space-y-1">
                                    <p className="text-sm text-red-600 font-bold">Law Department Escalation</p>
                                    <p className="text-xs text-red-500 max-w-[600px]">
                                        Law Department is critically behind at 56.1% collection rate. 
                                        153 defaulters identified. Immediate escalation recommended.
                                    </p>
                                </div>
                            </div>
                            <div className="text-center py-12 text-muted-foreground text-sm italic">Filtered Critical View Active</div>
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            {/* Row 4 — Fee Defaulters + Semester Summary */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Top Defaulters */}
                <Card className="bg-surface-raised border-border shadow-md flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-red-500" />
                            <CardTitle className="text-lg font-bold">Fee Defaulters — Top 8</CardTitle>
                        </div>
                        <span className="text-[10px] font-bold text-red-500 uppercase bg-red-500/10 px-2 py-0.5 rounded">Dues overdue 60+ days</span>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-6">
                        <div className="rounded-md border border-border overflow-hidden">
                            <Table className="text-xs">
                                <TableHeader className="bg-surface-sunken">
                                    <TableRow className="hover:bg-transparent border-border">
                                        <TableHead className="w-[40px] text-center font-bold">#</TableHead>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Dept</TableHead>
                                        <TableHead>Semester</TableHead>
                                        <TableHead className="text-right">Pending</TableHead>
                                        <TableHead className="text-right">Overdue Since</TableHead>
                                        <TableHead></TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {defaulters.map((d) => (
                                        <TableRow key={d.rank} className="border-border/50 hover:bg-surface-sunken transition-colors">
                                            <TableCell className="text-center font-bold text-muted-foreground">{d.rank}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold">{d.name}</span>
                                                    <span className="text-[10px] text-muted-foreground">{d.roll}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] bg-secondary border-none">{d.dept}</Badge>
                                            </TableCell>
                                            <TableCell>{d.semester}</TableCell>
                                            <TableCell className="text-right font-bold text-red-500">{formatCurrency(d.pending)}</TableCell>
                                            <TableCell className="text-right text-[10px] font-mono font-bold text-red-500">{d.overdueSince}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="icon" variant="ghost" disabled className="h-8 w-8 text-muted-foreground hover:bg-surface-sunken cursor-not-allowed">
                                                    <Info className="w-3 h-3" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                        <div className="flex flex-col gap-4">
                            <p className="text-sm font-bold text-amber-500 text-center">
                                Total pending from top 8 defaulters: ₹5,69,000
                            </p>
                            <Button variant="outline" className="w-full gap-2 border-danger-surface text-danger-surface hover:bg-danger-surface/5 h-11" disabled>
                                <Send className="w-4 h-4" />
                                Send Notices to All
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Semester Summary Chart */}
                <Card className="bg-surface-raised border-border shadow-md flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <BarChart3 className="w-5 h-5 text-warning-surface" />
                            <CardTitle className="text-lg font-bold">Semester-wise Collection</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent className="flex-1 space-y-4">
                        <div className="h-[240px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={semesterSummary} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                                    <XAxis 
                                        dataKey="sem" 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }}
                                        dy={10}
                                    />
                                    <YAxis 
                                        axisLine={false} 
                                        tickLine={false} 
                                        tick={{ fill: 'currentColor', fontSize: 10, fontWeight: 600 }}
                                        tickFormatter={(v) => `₹${v}L`}
                                    />
                                    <RechartsTooltip 
                                        cursor={{ fill: 'rgba(245, 158, 11, 0.05)' }}
                                        content={({ active, payload, label }) => {
                                            if (active && payload && payload.length) {
                                                const rate = semesterSummary.find(s => s.sem === label)?.rate;
                                                return (
                                                    <div className="bg-surface-raised border border-border shadow-md p-3 rounded-lg">
                                                        <p className="text-xs font-bold mb-2">{label}</p>
                                                        <div className="space-y-1">
                                                            <div className="flex justify-between gap-4 text-[10px]">
                                                                <span className="text-muted-foreground">Due:</span>
                                                                <span className="font-bold">₹{payload[0].value} L</span>
                                                            </div>
                                                            <div className="flex justify-between gap-4 text-[10px]">
                                                                <span className="text-muted-foreground">Collected:</span>
                                                                <span className="font-bold text-emerald-500">₹{payload[1].value} L</span>
                                                            </div>
                                                            <div className="pt-1 mt-1 border-t border-border flex justify-between gap-4 text-[10px]">
                                                                <span className="text-muted-foreground">Rate:</span>
                                                                <span className="font-bold text-warning-surface">{rate}%</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            }
                                            return null;
                                        }}
                                    />
                                    <Bar dataKey="due" name="Due" fill="hsl(var(--warning-surface))" opacity={0.3} radius={[4, 4, 0, 0]} barSize={16} />
                                    <Bar dataKey="collected" name="Collected" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                        <p className="text-[11px] text-muted-foreground italic leading-relaxed text-center px-6">
                            "Sem 7 & 8 typically show lower collection as final year students have installment arrangements."
                        </p>
                        <div className="flex items-center justify-center gap-3 pt-2">
                            <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] font-bold">Best: Sem 2 — 93.5%</Badge>
                            <Badge className="bg-red-500/10 text-red-500 border-none text-[10px] font-bold">Worst: Sem 8 — 71.6%</Badge>
                            <Badge className="bg-amber-500/10 text-amber-500 border-none text-[10px] font-bold">Overall: 83.9%</Badge>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Row 5 — Quick Actions + Fee Alerts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Quick Actions */}
                <Card className="bg-surface-raised border-border shadow-md">
                    <CardHeader>
                        <CardTitle className="text-lg font-bold">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {[
                                { icon: Download, label: 'Export Fee Report' },
                                { icon: FileText, label: 'Generate Defaulter List' },
                                { icon: Send, label: 'Send Reminders' },
                                { icon: IndianRupee, label: 'Fee Settings' },
                                { icon: BarChart3, label: 'Collection Analytics' },
                                { icon: AlertCircle, label: 'Escalation Manager' },
                            ].map((action, i) => (
                                <Button 
                                    key={i} 
                                    variant="outline" 
                                    className="h-11 justify-start gap-4 border-border bg-surface-sunken/30 hover:bg-surface-sunken text-sm font-medium transition-all group overflow-hidden relative cursor-not-allowed"
                                    disabled
                                >
                                    <div className={`p-2 rounded bg-surface-sunken`}>
                                        <action.icon className="w-4 h-4 text-muted-foreground group-hover:text-warning-surface transition-colors" />
                                    </div>
                                    <span>{action.label}</span>
                                    <div className="absolute inset-x-0 bottom-0 h-0.5 bg-warning-surface opacity-0 group-hover:opacity-100 transition-opacity" />
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Fee Alerts */}
                <Card className="bg-surface-raised border-border shadow-md">
                    <CardHeader className="flex flex-row items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-5 h-5 text-warning-surface" />
                            <CardTitle className="text-lg font-bold">Fee Alerts</CardTitle>
                        </div>
                        <Badge className="bg-danger-surface text-white border-none shadow-sm h-6 w-6 flex items-center justify-center p-0 rounded-full">4</Badge>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[
                                { type: 'CRITICAL', color: 'bg-red-500', title: 'Law Dept — Critical Default', desc: '56.1% collection rate with 153 defaulters — immediate escalation required', time: 'Today, 08:00 AM' },
                                { type: 'CRITICAL', color: 'bg-red-500', title: '3 Departments At Risk', desc: 'Mechanical, Civil, MBA below 81% — may miss quarterly target', time: 'Today, 09:30 AM' },
                                { type: 'WARNING', color: 'bg-amber-500', title: '320 Students in Default', desc: 'Outstanding dues older than 60 days totaling ₹1.32 Cr', time: 'Yesterday, 06:00 PM' },
                                { type: 'INFO', color: 'bg-blue-500', title: 'Q4 Fee Collection Window Open', desc: 'Final semester fee submission deadline: 31 March 2026', time: '3 days ago' },
                            ].map((alert, i) => (
                                <div key={i} className="flex gap-4 p-3 rounded-lg border border-border/40 hover:bg-surface-sunken/50 transition-colors group relative overflow-hidden">
                                    <div className="flex flex-col items-center gap-1.5 pt-1 min-w-[60px]">
                                        <div className={`w-2.5 h-2.5 rounded-full ${alert.color} ${alert.type === 'CRITICAL' ? 'animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.5)]' : ''}`} />
                                        <span className={`text-[9px] font-bold ${alert.color.replace('bg-', 'text-')}`}>{alert.type}</span>
                                    </div>
                                    <div className="flex-1 space-y-1">
                                        <h4 className="text-sm font-bold leading-tight group-hover:text-warning-surface transition-colors">{alert.title}</h4>
                                        <p className="text-[11px] text-muted-foreground leading-relaxed">{alert.desc}</p>
                                        <p className="text-[10px] text-muted-foreground/60 font-medium pt-1">{alert.time}</p>
                                    </div>
                                    <Button size="sm" variant="ghost" className="h-8 text-xs text-muted-foreground self-center" disabled>View</Button>
                                    <div className={`absolute top-0 left-0 w-0.5 h-full ${alert.color} opacity-30`} />
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </motion.div>
    );
}
