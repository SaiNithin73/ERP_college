import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';

import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const MOCK_COURSES = [
    { code: 'CS301', name: 'Data Structures & Algorithms', instructor: 'Dr. Sharma', credits: 4, attendance: 90.48 },
    { code: 'CS302', name: 'Operating Systems', instructor: 'Prof. Gupta', credits: 3, attendance: 83.33 },
    { code: 'CS303', name: 'Database Systems', instructor: 'Dr. Patel', credits: 4, attendance: 71.43 },
    { code: 'MA301', name: 'Discrete Mathematics', instructor: 'Prof. Rao', credits: 4, attendance: 95.24 },
];

export default function StudentCourses() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="w-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 py-2 px-4 rounded-md text-sm font-medium mb-4 text-center">
                This section is in development. Showing representative preview data.
            </div>

            <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Courses — Semester 5</h2>
                <Badge className="bg-indigo-100 text-indigo-700">{MOCK_COURSES.length} Courses</Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {MOCK_COURSES.map((course, idx) => (
                    <motion.div key={idx} variants={fadeInUp}>
                        <Card className="bg-[hsl(var(--surface-raised))] border-l-4 border-l-indigo-500 hover:shadow-md transition-shadow">
                            <CardHeader className="pb-2">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-lg font-bold text-slate-900 dark:text-white">{course.name}</CardTitle>
                                        <p className="text-sm text-slate-500 dark:text-white/60">{course.code} • {course.instructor}</p>
                                    </div>
                                    <Badge variant="outline" className="border-indigo-200 text-indigo-600 dark:text-indigo-400">{course.credits} Credits</Badge>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="mt-2">
                                    <div className="flex justify-between text-xs mb-1 text-slate-500 dark:text-white/60">
                                        <span>Attendance</span>
                                        <span className="font-semibold">{course.attendance}%</span>
                                    </div>
                                    <Progress value={course.attendance} className="h-2 [&>div]:bg-indigo-500" />
                                </div>
                                <div className="mt-4 pt-4 border-t border-border flex justify-between items-center">
                                    <div className="text-xs text-slate-500 dark:text-white/60">
                                        Next class: <span className="font-medium text-slate-900 dark:text-white">Mon 09:00 AM</span>
                                    </div>
                                    <button
                                        disabled
                                        title="Coming soon"
                                        className="px-4 py-1.5 text-xs font-semibold rounded-md bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 cursor-not-allowed"
                                    >
                                        View Materials
                                    </button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
