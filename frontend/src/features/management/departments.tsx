import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Users, GraduationCap, Building2, TrendingUp, Presentation } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const DEPARTMENTS = [
    {
        name: 'Computer Science',
        hod: 'Dr. Alan Turing',
        students: 1250,
        faculty: 45,
        cgpa: 8.4,
        placement: 94,
        status: 'Excellent'
    },
    {
        name: 'Information Technology',
        hod: 'Dr. Grace Hopper',
        students: 950,
        faculty: 38,
        cgpa: 8.1,
        placement: 89,
        status: 'Good'
    },
    {
        name: 'Electronics & Comm.',
        hod: 'Dr. Claude Shannon',
        students: 1100,
        faculty: 42,
        cgpa: 7.8,
        placement: 82,
        status: 'Good'
    },
    {
        name: 'Mechanical Engineering',
        hod: 'Dr. Henry Ford',
        students: 1400,
        faculty: 55,
        cgpa: 7.5,
        placement: 76,
        status: 'Average'
    },
    {
        name: 'Civil Engineering',
        hod: 'Dr. Isambard Brunel',
        students: 850,
        faculty: 30,
        cgpa: 7.7,
        placement: 71,
        status: 'Needs Review'
    },
    {
        name: 'Artificial Intelligence',
        hod: 'Dr. John McCarthy',
        students: 400,
        faculty: 20,
        cgpa: 8.9,
        placement: 98,
        status: 'Excellent'
    }
];

export default function ManagementDepartments() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Departments</h2>
                    <p className="text-sm text-slate-500 dark:text-slate-400">Overview of all active departments</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {DEPARTMENTS.map((dept, i) => (
                    <motion.div key={i} variants={fadeInUp}>
                        <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden h-full flex flex-col">
                            <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-500" />
                            <CardHeader className="pb-2">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/10 text-amber-600 flex items-center justify-center">
                                            <Building2 className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base font-bold text-slate-900 dark:text-white line-clamp-1">{dept.name}</CardTitle>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">HOD: {dept.hod}</p>
                                        </div>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="flex-1 flex flex-col justify-between pt-4">
                                <div className="grid grid-cols-2 gap-y-4 gap-x-2 mb-6">
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Students</p>
                                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                            <Users className="w-4 h-4 text-indigo-500" />
                                            {dept.students.toLocaleString()}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Faculty</p>
                                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                            <Presentation className="w-4 h-4 text-purple-500" />
                                            {dept.faculty}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Avg CGPA</p>
                                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                            <GraduationCap className="w-4 h-4 text-emerald-500" />
                                            {dept.cgpa}
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-[10px] uppercase tracking-wider text-slate-500 font-semibold mb-1">Placement</p>
                                        <div className="flex items-center gap-1.5 font-medium text-slate-800 dark:text-slate-200">
                                            <TrendingUp className="w-4 h-4 text-amber-500" />
                                            {dept.placement}%
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/[0.05]">
                                    <Badge variant="outline" className={`
                                        ${dept.status === 'Excellent' ? 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400' : ''}
                                        ${dept.status === 'Good' ? 'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400' : ''}
                                        ${dept.status === 'Average' ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400' : ''}
                                        ${dept.status === 'Needs Review' ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-500/10 dark:text-red-400' : ''}
                                    `}>
                                        {dept.status}
                                    </Badge>
                                    <Button variant="ghost" size="sm" className="h-8 text-xs text-amber-600 hover:text-amber-700 hover:bg-amber-50 dark:hover:bg-amber-500/10" disabled>
                                        View Details
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
