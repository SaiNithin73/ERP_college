import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { IndianRupee, Download, TrendingUp } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const MOCK_PAYSLIPS = [
    { month: 'Ref-26-Mar', date: 'Mar 2026', amount: '₹95,000', status: 'Processing' },
    { month: 'Ref-26-Feb', date: 'Feb 2026', amount: '₹95,000', status: 'Paid' },
    { month: 'Ref-26-Jan', date: 'Jan 2026', amount: '₹95,000', status: 'Paid' },
    { month: 'Ref-25-Dec', date: 'Dec 2025', amount: '₹92,500', status: 'Paid' },
];

export default function StaffSalary() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Salary details & Payslips</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <motion.div variants={fadeInUp} className="lg:col-span-1">
                    <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-slate-500 dark:text-white/60">Current Base Salary</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-4xl font-bold text-slate-900 dark:text-white mb-2">₹1,140,000</div>
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <TrendingUp className="w-3 h-3 text-emerald-500" /> +2.5% vs last year (Annual CTC)
                            </p>
                            <div className="mt-6 pt-4 border-t border-border flex justify-between text-sm">
                                <span className="text-muted-foreground">Next Increment</span>
                                <span className="font-semibold">Jul 2026</span>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeInUp} className="lg:col-span-2">
                    <Card className="bg-[hsl(var(--surface-raised))]">
                        <CardHeader className="pb-2 border-b border-border flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <IndianRupee className="w-5 h-5 text-indigo-500" />
                                Recent Payslips
                            </CardTitle>
                            <Button variant="outline" size="sm" className="hidden sm:flex gap-2">
                                <Download className="w-4 h-4" /> Download YTD
                            </Button>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto p-4">
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Reference</TableHead>
                                            <TableHead>Month</TableHead>
                                            <TableHead>Net Pay</TableHead>
                                            <TableHead>Status</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {MOCK_PAYSLIPS.map((slip, i) => (
                                            <TableRow key={i} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-mono text-xs text-muted-foreground">{slip.month}</TableCell>
                                                <TableCell className="font-semibold">{slip.date}</TableCell>
                                                <TableCell>{slip.amount}</TableCell>
                                                <TableCell>
                                                    <Badge className={slip.status === 'Paid' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                                        {slip.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Button variant="ghost" size="sm" className="h-8 gap-2 text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50" disabled={slip.status !== 'Paid'}>
                                                        {slip.status === 'Paid' ? <Download className="w-4 h-4" /> : 'Pending'}
                                                        <span className="sr-only sm:not-sr-only sm:ml-1 text-xs">PDF</span>
                                                    </Button>
                                                </TableCell>
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
