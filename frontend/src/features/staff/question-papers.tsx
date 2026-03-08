import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Upload, Plus, Pencil, Send } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const MOCK_PAPERS = [
    { id: 'QP-26-Mid-CS301', subject: 'Data Structures', type: 'Midterm', status: 'Approved', updated: '2026-02-15' },
    { id: 'QP-26-Mid-CS302', subject: 'Operating Systems', type: 'Midterm', status: 'Submitted', updated: '2026-02-28' },
    { id: 'QP-26-Fin-CS301', subject: 'Data Structures', type: 'Final', status: 'Draft', updated: '2026-03-02' },
];

export default function StaffQuestionPapers() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="w-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 py-2 px-4 rounded-md text-sm font-medium mb-4 text-center">
                This module allows staff to design, upload, and submit question papers for automated formatting and approval.
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Question Papers</h2>
                    <p className="text-sm text-muted-foreground">Manage your exam papers for the current semester</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" className="gap-2 border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                        <Upload className="w-4 h-4" /> Upload Draft
                    </Button>
                    <Button className="gap-2 bg-indigo-600 hover:bg-indigo-700">
                        <Plus className="w-4 h-4" /> Create New
                    </Button>
                </div>
            </div>

            <motion.div variants={fadeInUp}>
                <Card className="bg-[hsl(var(--surface-raised))]">
                    <CardHeader className="pb-2 border-b border-border">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <FileText className="w-5 h-5 text-indigo-500" />
                            My Question Papers
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto p-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Paper ID</TableHead>
                                        <TableHead>Subject</TableHead>
                                        <TableHead>Exam Type</TableHead>
                                        <TableHead>Last Updated</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {MOCK_PAPERS.map((paper, i) => (
                                        <TableRow key={i} className="hover:bg-muted/50 transition-colors">
                                            <TableCell className="font-mono text-xs">{paper.id}</TableCell>
                                            <TableCell className="font-semibold">{paper.subject}</TableCell>
                                            <TableCell>{paper.type}</TableCell>
                                            <TableCell className="text-sm text-muted-foreground">{paper.updated}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline"
                                                    className={
                                                        paper.status === 'Approved' ? 'border-emerald-200 text-emerald-700' :
                                                            paper.status === 'Submitted' ? 'border-blue-200 text-blue-700' :
                                                                'border-amber-200 text-amber-700'
                                                    }
                                                >
                                                    {paper.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {paper.status === 'Draft' ? (
                                                    <div className="flex items-center justify-end gap-2">
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-indigo-600" title="Edit">
                                                            <Pencil className="w-4 h-4" />
                                                        </Button>
                                                        <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600" title="Submit">
                                                            <Send className="w-4 h-4" />
                                                        </Button>
                                                    </div>
                                                ) : (
                                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-indigo-600" disabled>
                                                        View PDF
                                                    </Button>
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
