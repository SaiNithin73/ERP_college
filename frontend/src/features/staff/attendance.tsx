import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CustomSelect } from '@/components/ui/selects';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, CheckCircle2 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const COURSES = [
    { value: 'cs301', label: 'Data Structures & Algorithms - Batch A' },
    { value: 'cs302', label: 'Operating Systems - Batch B' },
];

const MOCK_STUDENTS = [
    { id: 'CS24001', name: 'Alice Johnson', present: 38, total: 40 },
    { id: 'CS24002', name: 'Bob Smith', present: 35, total: 40 },
    { id: 'CS24003', name: 'Charlie Davis', present: 28, total: 40 },
    { id: 'CS24004', name: 'Diana Prince', present: 39, total: 40 },
    { id: 'CS24005', name: 'Evan Wright', present: 32, total: 40 },
];

export default function StaffAttendance() {
    const [course, setCourse] = useState('cs301');

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">Class Attendance</h2>
                <div className="w-full sm:w-72">
                    <CustomSelect
                        options={COURSES}
                        value={course}
                        onChange={setCourse}
                        placeholder="Select Course & Batch"
                    />
                </div>
            </div>

            <motion.div variants={fadeInUp}>
                <Card className="bg-[hsl(var(--surface-raised))]">
                    <CardHeader className="flex flex-row items-center justify-between pb-2 border-b border-border">
                        <CardTitle className="text-lg font-medium flex items-center gap-2">
                            <Users className="w-5 h-5 text-indigo-500" />
                            Student Register
                        </CardTitle>
                        <Button disabled className="bg-indigo-600 hover:bg-indigo-700 text-white" title="Backend endpoint pending">
                            <CheckCircle2 className="w-4 h-4 mr-2" /> Take Attendance
                        </Button>
                    </CardHeader>
                    <CardContent className="pt-4 p-0">
                        <div className="overflow-x-auto p-4">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Roll Number</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead className="text-center">Classes Attended</TableHead>
                                        <TableHead className="text-center">Percentage</TableHead>
                                        <TableHead className="text-right">Status</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {MOCK_STUDENTS.map(s => {
                                        const pct = (s.present / s.total) * 100;
                                        return (
                                            <TableRow key={s.id} className="hover:bg-muted/50 transition-colors">
                                                <TableCell className="font-medium">{s.id}</TableCell>
                                                <TableCell>{s.name}</TableCell>
                                                <TableCell className="text-center">{s.present} / {s.total}</TableCell>
                                                <TableCell className="text-center font-bold">{pct.toFixed(1)}%</TableCell>
                                                <TableCell className="text-right">
                                                    <Badge className={pct >= 85 ? 'bg-emerald-100 text-emerald-700' : pct >= 75 ? 'bg-amber-100 text-amber-700' : 'bg-red-100 text-red-700'}>
                                                        {pct >= 85 ? 'Safe' : pct >= 75 ? 'Low' : 'Critical'}
                                                    </Badge>
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
