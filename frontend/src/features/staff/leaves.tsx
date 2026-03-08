import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, CheckCircle2, XCircle } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const MOCK_REQUESTS = [
    { id: 101, student: 'Alice Johnson', roll: 'CS24001', type: 'Leave', reason: 'Medical Checkup', dates: '12 Nov - 14 Nov', status: 'Pending' },
    { id: 102, student: 'Bob Smith', roll: 'CS24045', type: 'OD', reason: 'Hackathon Participation', dates: '15 Nov - 16 Nov', status: 'Pending' },
    { id: 103, student: 'Charlie Davis', roll: 'CS24012', type: 'Leave', reason: 'Family Event', dates: '18 Nov', status: 'Approved' },
    { id: 104, student: 'Diana Prince', roll: 'CS24067', type: 'Leave', reason: 'Sick Leave', dates: '20 Nov', status: 'Rejected' },
];

export default function StaffLeaves() {
    const handleAction = (id: number, action: string) => {
        toast.info(`Simulated ${action} for request ${id}`);
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Student Leave Approvals</h2>

            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                {[
                    { label: 'Pending Approvals', value: 2, accent: 'text-amber-500' },
                    { label: 'Approved This Month', value: 14, accent: 'text-emerald-500' },
                    { label: 'Rejected This Month', value: 3, accent: 'text-red-500' },
                ].map((stat, i) => (
                    <Card key={i} className="bg-[hsl(var(--surface-raised))]">
                        <CardContent className="p-6 text-center">
                            <p className="text-sm font-medium text-slate-500 dark:text-white/60 mb-2">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.accent}`}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
                <Card className="bg-[hsl(var(--surface-raised))]">
                    <CardHeader className="pb-2 border-b border-border">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            Leave & OD Requests
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto p-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Student</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Dates</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {MOCK_REQUESTS.map(req => (
                                        <TableRow key={req.id} className="hover:bg-muted/50 transition-colors">
                                            <TableCell>
                                                <p className="font-semibold text-slate-900 dark:text-white">{req.student}</p>
                                                <p className="text-xs text-muted-foreground">{req.roll}</p>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={req.type === 'OD' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}>
                                                    {req.type}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="max-w-[150px] truncate">{req.reason}</TableCell>
                                            <TableCell className="text-xs">{req.dates}</TableCell>
                                            <TableCell className="text-right">
                                                {req.status === 'Pending' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="icon" variant="outline" className="h-8 w-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50" onClick={() => handleAction(req.id, 'Approve')}>
                                                            <CheckCircle2 className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="outline" className="h-8 w-8 text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleAction(req.id, 'Reject')}>
                                                            <XCircle className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Badge className={req.status === 'Approved' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}>
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
            </motion.div>
        </motion.div>
    );
}
