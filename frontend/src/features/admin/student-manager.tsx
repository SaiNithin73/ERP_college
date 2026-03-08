import { useState } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Search, Filter, Download, MoreHorizontal, Edit, Flag, User, AlertTriangle } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const MOCK_STUDENTS = [
    { roll: 'CS2024001', name: 'Alice Smith', dept: 'CS', sem: 4, cgpa: 8.9, attendance: 92, status: 'Active', flagged: false },
    { roll: 'CS2024045', name: 'Bob Johnson', dept: 'CS', sem: 4, cgpa: 7.2, attendance: 71, status: 'Warning', flagged: true },
    { roll: 'IT2024012', name: 'Charlie Davis', dept: 'IT', sem: 4, cgpa: 9.1, attendance: 98, status: 'Active', flagged: false },
    { roll: 'EC2024088', name: 'Diana Prince', dept: 'EC', sem: 4, cgpa: 6.5, attendance: 65, status: 'Critical', flagged: true },
    { roll: 'ME2024102', name: 'Eve Carter', dept: 'ME', sem: 4, cgpa: 8.0, attendance: 85, status: 'Active', flagged: false },
    { roll: 'CS2023055', name: 'Frank Ocean', dept: 'CS', sem: 6, cgpa: 7.9, attendance: 88, status: 'Active', flagged: false },
];

export default function AdminStudentManager() {
    const [students, setStudents] = useState(MOCK_STUDENTS);
    const [search, setSearch] = useState('');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = () => {
        setIsExporting(true);
        setTimeout(() => {
            setIsExporting(false);
            toast.success("CSV Export initiated. Download will begin shortly.");
        }, 1500);
    };

    const toggleFlag = (roll: string) => {
        setStudents(prev => prev.map(s => s.roll === roll ? { ...s, flagged: !s.flagged } : s));
        toast.success(`Student ${roll} flag status updated`);
    };

    const filtered = students.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.roll.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Student Manager</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage student records, perform overrides, and monitor status.</p>
                </div>
                <Button onClick={handleExport} disabled={isExporting} className="gap-2 bg-red-600 hover:bg-red-700 text-white">
                    <Download className="w-4 h-4" />
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>
            </div>

            <motion.div variants={fadeInUp}>
                <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl">
                    <CardHeader className="p-4 border-b border-zinc-100 dark:border-white/[0.05] flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Search by name or roll no..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-zinc-100/50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.05] focus-visible:ring-red-500 h-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2 h-9 border-zinc-200 dark:border-white/[0.1]">
                                <Filter className="w-4 h-4" /> Department
                            </Button>
                            <Button variant="outline" size="sm" className="gap-2 h-9 border-zinc-200 dark:border-white/[0.1]">
                                <Filter className="w-4 h-4" /> Semester
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto max-h-[60vh] custom-scrollbar">
                            <Table>
                                <TableHeader className="sticky top-0 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur z-10 shadow-sm border-b border-zinc-100 dark:border-white/[0.05]">
                                    <TableRow className="border-0 hover:bg-transparent">
                                        <TableHead>Roll No</TableHead>
                                        <TableHead>Student Name</TableHead>
                                        <TableHead>Dept.</TableHead>
                                        <TableHead className="text-center">Sem</TableHead>
                                        <TableHead className="text-center">CGPA</TableHead>
                                        <TableHead className="text-center">Attendance %</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    <AnimatePresence>
                                        {filtered.map((student) => (
                                            <motion.tr
                                                key={student.roll}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="border-b border-zinc-100 dark:border-white/[0.05] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group"
                                            >
                                                <TableCell className="font-mono text-xs text-zinc-500 font-medium">
                                                    <div className="flex items-center gap-2">
                                                        {student.flagged && <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />}
                                                        {student.roll}
                                                    </div>
                                                </TableCell>
                                                <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">{student.name}</TableCell>
                                                <TableCell>{student.dept}</TableCell>
                                                <TableCell className="text-center">{student.sem}</TableCell>
                                                <TableCell className="text-center">{student.cgpa}</TableCell>
                                                <TableCell className="text-center">
                                                    <div className="flex flex-col items-center gap-1">
                                                        <span className={`text-xs font-semibold ${student.attendance >= 75 ? 'text-emerald-600' : 'text-red-600'}`}>
                                                            {student.attendance}%
                                                        </span>
                                                        <div className="w-12 h-1.5 bg-zinc-200 dark:bg-white/10 rounded-full overflow-hidden">
                                                            <div
                                                                className={`h-full ${student.attendance >= 75 ? 'bg-emerald-500' : 'bg-red-500'}`}
                                                                style={{ width: `${student.attendance}%` }}
                                                            />
                                                        </div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge variant="outline" className={`border ${student.status === 'Active' ? 'border-emerald-500/30 text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10' :
                                                        student.status === 'Warning' ? 'border-amber-500/30 text-amber-700 bg-amber-50 dark:bg-amber-500/10' :
                                                            'border-red-500/30 text-red-700 bg-red-50 dark:bg-red-500/10'
                                                        }`}>
                                                        {student.status}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <DropdownMenu>
                                                        <DropdownMenuTrigger asChild>
                                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white">
                                                                <MoreHorizontal className="w-4 h-4" />
                                                            </Button>
                                                        </DropdownMenuTrigger>
                                                        <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#09090b] border-zinc-200 dark:border-white/[0.05]">
                                                            <DropdownMenuLabel>Manage Student</DropdownMenuLabel>
                                                            <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/[0.05]" />
                                                            <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/[0.05]">
                                                                <Edit className="w-4 h-4" /> Quick Edit
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/[0.05]">
                                                                <User className="w-4 h-4" /> View Full Profile
                                                            </DropdownMenuItem>
                                                            <DropdownMenuItem
                                                                onClick={() => toggleFlag(student.roll)}
                                                                className={`gap-2 cursor-pointer ${student.flagged ? 'text-amber-600 focus:text-amber-700 focus:bg-amber-50 dark:focus:bg-amber-500/10' : 'focus:bg-zinc-100 dark:focus:bg-white/[0.05]'}`}
                                                            >
                                                                <Flag className="w-4 h-4" fill={student.flagged ? 'currentColor' : 'none'} />
                                                                {student.flagged ? 'Remove Flag' : 'Flag Student'}
                                                            </DropdownMenuItem>
                                                        </DropdownMenuContent>
                                                    </DropdownMenu>
                                                </TableCell>
                                            </motion.tr>
                                        ))}
                                    </AnimatePresence>
                                </TableBody>
                            </Table>
                            {filtered.length === 0 && (
                                <div className="p-8 text-center text-zinc-500 dark:text-zinc-400">
                                    No students found matching your criteria.
                                </div>
                            )}
                        </div>
                        <div className="p-4 border-t border-zinc-100 dark:border-white/[0.05] text-xs text-zinc-500 flex justify-between items-center">
                            <span>Showing {filtered.length} of {MOCK_STUDENTS.length} students</span>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
