import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart3, TrendingUp, PieChart as PieChartIcon } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const BAR_DATA = [
    { name: 'CS', students: 1200 },
    { name: 'IT', students: 950 },
    { name: 'EC', students: 800 },
    { name: 'ME', students: 600 },
    { name: 'CE', students: 450 },
];

const LINE_DATA = [
    { month: 'Jan', enrollment: 250 },
    { month: 'Feb', enrollment: 300 },
    { month: 'Mar', enrollment: 450 },
    { month: 'Apr', enrollment: 400 },
    { month: 'May', enrollment: 650 },
    { month: 'Jun', enrollment: 800 },
];

const PIE_DATA = [
    { name: 'Male', value: 65 },
    { name: 'Female', value: 35 },
];
const COLORS = ['#f59e0b', '#8b5cf6'];

export default function ManagementAnalytics() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Institutional Analytics</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={fadeInUp}>
                    <Card className="bg-white/60 dark:bg-[#111827]/60 border-slate-200 dark:border-white/[0.05] backdrop-blur-xl h-[400px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <BarChart3 className="w-4 h-4 text-amber-500" />
                                Department Strength
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={BAR_DATA} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                        itemStyle={{ color: '#fcd34d' }}
                                    />
                                    <Bar dataKey="students" fill="#f59e0b" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <Card className="bg-white/60 dark:bg-[#111827]/60 border-slate-200 dark:border-white/[0.05] backdrop-blur-xl h-[400px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-amber-500" />
                                Monthly Enrollment Trend
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={LINE_DATA} margin={{ top: 20, right: 20, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#fff' }}
                                    />
                                    <Line type="monotone" dataKey="enrollment" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b', strokeWidth: 2, stroke: '#fff' }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={fadeInUp} className="lg:col-span-1">
                    <Card className="bg-white/60 dark:bg-[#111827]/60 border-slate-200 dark:border-white/[0.05] backdrop-blur-xl h-[400px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <PieChartIcon className="w-4 h-4 text-amber-500" />
                                Gender Distribution
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="h-[320px] flex flex-col items-center justify-center">
                            <ResponsiveContainer width="100%" height={240}>
                                <PieChart>
                                    <Pie data={PIE_DATA} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                        {PIE_DATA.map((_entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="flex gap-4 mt-4">
                                {PIE_DATA.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300">
                                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                                        {entry.name}: {entry.value}%
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeInUp} className="lg:col-span-2">
                    <Card className="bg-white/60 dark:bg-[#111827]/60 border-slate-200 dark:border-white/[0.05] backdrop-blur-xl h-[400px]">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-base font-semibold">Top Performing Departments</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-auto max-h-[320px] p-4 pt-0">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="hover:bg-transparent">
                                            <TableHead>Rank</TableHead>
                                            <TableHead>Department</TableHead>
                                            <TableHead className="text-center">Average CGPA</TableHead>
                                            <TableHead className="text-right">Placement Rate</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {[
                                            { rank: 1, dept: 'Computer Science', cgpa: 8.4, placement: '94%' },
                                            { rank: 2, dept: 'Information Tech', cgpa: 8.1, placement: '89%' },
                                            { rank: 3, dept: 'Electronics', cgpa: 7.8, placement: '82%' },
                                            { rank: 4, dept: 'Mechanical', cgpa: 7.6, placement: '76%' },
                                        ].map(row => (
                                            <TableRow key={row.rank} className="hover:bg-slate-50 dark:hover:bg-white/[0.02]">
                                                <TableCell className="font-bold text-amber-600 dark:text-amber-500">#{row.rank}</TableCell>
                                                <TableCell className="font-medium">{row.dept}</TableCell>
                                                <TableCell className="text-center">{row.cgpa}</TableCell>
                                                <TableCell className="text-right text-emerald-600 font-semibold">{row.placement}</TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
