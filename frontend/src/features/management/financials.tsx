import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DollarSign, ArrowUpRight, ArrowDownRight, Wallet, Receipt, Tags } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const FINANCE_DATA = [
    { month: 'Jan', revenue: 420, expenses: 250 },
    { month: 'Feb', revenue: 380, expenses: 240 },
    { month: 'Mar', revenue: 560, expenses: 290 },
    { month: 'Apr', revenue: 470, expenses: 270 },
    { month: 'May', revenue: 610, expenses: 310 },
    { month: 'Jun', revenue: 680, expenses: 350 },
    { month: 'Jul', revenue: 520, expenses: 310 },
    { month: 'Aug', revenue: 730, expenses: 390 },
    { month: 'Sep', revenue: 690, expenses: 360 },
    { month: 'Oct', revenue: 810, expenses: 400 },
    { month: 'Nov', revenue: 780, expenses: 410 },
    { month: 'Dec', revenue: 950, expenses: 450 },
];

const FEE_COLLECTION = [
    { term: 'Fall 2025 Tuition', target: 5000000, collected: 4850000, status: 'On Track' },
    { term: 'Spring 2026 Tuition', target: 5200000, collected: 4100000, status: 'Processing' },
    { term: 'Hostel Fees (Yearly)', target: 1200000, collected: 1150000, status: 'On Track' },
    { term: 'Transport Fees', target: 800000, collected: 720000, status: 'Warning' },
    { term: 'Exam Fees (Sem 1)', target: 450000, collected: 440000, status: 'Almost Complete' },
];

export default function ManagementFinancials() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Financials Overview</h2>

            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { title: 'Total Revenue YTD', value: '$8.5M', trend: 'up', icon: Wallet, color: 'text-emerald-500' },
                    { title: 'Total Expenses YTD', value: '$4.1M', trend: 'down', icon: Receipt, color: 'text-red-500' },
                    { title: 'Net Margin', value: '51%', trend: 'up', icon: Tags, color: 'text-amber-500' },
                    { title: 'Outstanding Dues', value: '$1.2M', trend: 'down', icon: DollarSign, color: 'text-indigo-500' },
                ].map((kpi, i) => (
                    <Card key={i} className="bg-white/60 dark:bg-[#111827]/60 border-slate-200 dark:border-white/[0.05] backdrop-blur-xl">
                        <CardHeader className="flex flex-row items-center justify-between pb-2">
                            <CardTitle className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">{kpi.title}</CardTitle>
                            <kpi.icon className={`w-4 h-4 ${kpi.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-baseline gap-2">
                                <div className="text-3xl font-bold text-slate-800 dark:text-white">{kpi.value}</div>
                                <div className={`flex items-center text-xs font-medium ${kpi.trend === 'up' ? 'text-emerald-500' : 'text-red-500'}`}>
                                    {kpi.trend === 'up' ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
                <Card className="bg-white/60 dark:bg-[#111827]/60 border-slate-200 dark:border-white/[0.05] backdrop-blur-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold text-slate-800 dark:text-white">Revenue vs Expenses (12 Months)</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[350px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={FINANCE_DATA} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="colorExp" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(156, 163, 175, 0.1)" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'currentColor', opacity: 0.5 }} />
                                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15, 23, 42, 0.95)', border: 'none', borderRadius: '8px', color: '#fff' }} />
                                    <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorRev)" />
                                    <Area type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} fillOpacity={1} fill="url(#colorExp)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
                <Card className="bg-white/60 dark:bg-[#111827]/60 border-slate-200 dark:border-white/[0.05] backdrop-blur-xl">
                    <CardHeader className="pb-4">
                        <CardTitle className="text-base font-semibold text-slate-800 dark:text-white">Fee Collection Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto p-4 pt-0">
                            <Table>
                                <TableHeader>
                                    <TableRow className="hover:bg-transparent border-slate-100 dark:border-white/[0.05]">
                                        <TableHead>Category / Term</TableHead>
                                        <TableHead className="text-right">Target ($)</TableHead>
                                        <TableHead className="text-right">Collected ($)</TableHead>
                                        <TableHead className="w-[30%]">Collection %</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {FEE_COLLECTION.map((row, i) => {
                                        const percentage = Math.round((row.collected / row.target) * 100);
                                        return (
                                            <TableRow key={i} className="hover:bg-slate-50 dark:hover:bg-white/[0.02] border-slate-100 dark:border-white/[0.05]">
                                                <TableCell className="font-medium text-slate-800 dark:text-slate-200">{row.term}</TableCell>
                                                <TableCell className="text-right text-slate-600 dark:text-slate-400">{(row.target).toLocaleString()}</TableCell>
                                                <TableCell className="text-right font-medium text-amber-600 dark:text-amber-500">{(row.collected).toLocaleString()}</TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                                                            <div className={`h-2 rounded-full ${percentage > 90 ? 'bg-emerald-500' : percentage > 75 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${percentage}%` }} />
                                                        </div>
                                                        <span className="text-xs font-semibold w-8">{percentage}%</span>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
