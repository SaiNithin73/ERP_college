import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileSpreadsheet, Plus, Filter } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const MOCK_ASSIGNMENTS = [
    { title: 'Array Manipulation Problems', due: 'Tomorrow', submitted: 35, total: 40, status: 'Active' },
    { title: 'Graph Theory Implementation', due: 'In 3 days', submitted: 12, total: 40, status: 'Active' },
    { title: 'Sorting Algorithms Comparison', due: 'Last Week', submitted: 40, total: 40, status: 'Grading' },
];

export default function StaffClassManagement() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Class Management</h2>
                    <p className="text-sm text-muted-foreground">Manage assignments and student grading</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2">
                        <Filter className="w-4 h-4" /> Filter Class
                    </Button>
                </div>
            </div>

            <motion.div variants={fadeInUp}>
                <Card className="bg-[hsl(var(--surface-raised))]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <FileSpreadsheet className="w-5 h-5 text-indigo-500" />
                            Assignments for CS301
                        </CardTitle>
                        <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
                            <Plus className="w-4 h-4" /> New Assignment
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto p-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Assignment Title</TableHead>
                                        <TableHead>Due Date</TableHead>
                                        <TableHead className="text-center">Submissions</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {MOCK_ASSIGNMENTS.map((assignment, i) => (
                                        <TableRow key={i} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-semibold text-slate-900 dark:text-white">{assignment.title}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{assignment.due}</TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <div className="flex-1 max-w-[100px] h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                                                        <div
                                                            className="h-full bg-indigo-500"
                                                            style={{ width: `${(assignment.submitted / assignment.total) * 100}%` }}
                                                        />
                                                    </div>
                                                    <span className="text-xs font-medium w-9">{assignment.submitted}/{assignment.total}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={assignment.status === 'Active' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}>
                                                    {assignment.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50">
                                                    {assignment.status === 'Active' ? 'Edit' : 'Grade'}
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
        </motion.div>
    );
}
