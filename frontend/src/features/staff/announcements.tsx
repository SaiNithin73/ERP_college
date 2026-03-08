import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bell, AlertTriangle, Info, CalendarClock } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const MOCK_ANNOUNCEMENTS = [
    {
        id: 1,
        title: 'End of Semester Grading Deadline',
        message: 'All staff members are reminded that the final grades for the current semester must be submitted by Friday, March 20th. No extensions will be granted.',
        date: 'March 10, 2026',
        priority: 'Urgent',
        sender: 'Admin Office',
    },
    {
        id: 2,
        title: 'Upcoming Faculty Development Program',
        message: 'A mandatory FDP on "Modern Pedagogical Approaches" will be held next Tuesday in the main auditorium. Please ensure your classes are rescheduled if they conflict.',
        date: 'March 5, 2026',
        priority: 'Important',
        sender: 'Dean of Academics',
    },
    {
        id: 3,
        title: 'New Library Management System',
        message: 'The university library is migrating to a new digital system this weekend. Book renewals will be temporarily unavailable during this period.',
        date: 'March 1, 2026',
        priority: 'Normal',
        sender: 'Library Services',
    },
];

export default function StaffAnnouncements() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6 max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-indigo-500" />
                Staff Announcements
            </h2>

            <motion.div variants={fadeInUp} className="space-y-4 shadow-sm bg-white/30 dark:bg-white-[0.01] p-1 rounded-xl">
                {MOCK_ANNOUNCEMENTS.map((announcement) => (
                    <Card key={announcement.id} className="bg-[hsl(var(--surface-raised))] border-none shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                        <div className={`absolute left-0 top-0 bottom-0 w-1 ${announcement.priority === 'Urgent' ? 'bg-red-500' :
                            announcement.priority === 'Important' ? 'bg-amber-500' :
                                'bg-blue-500'
                            }`} />
                        <CardContent className="p-5 sm:p-6 ml-2 flex gap-4">
                            <div className="hidden sm:flex mt-1">
                                {announcement.priority === 'Urgent' ? (
                                    <div className="p-2 bg-red-100 text-red-600 rounded-full h-fit"><AlertTriangle className="w-5 h-5" /></div>
                                ) : announcement.priority === 'Important' ? (
                                    <div className="p-2 bg-amber-100 text-amber-600 rounded-full h-fit"><Info className="w-5 h-5" /></div>
                                ) : (
                                    <div className="p-2 bg-blue-100 text-blue-600 rounded-full h-fit"><Bell className="w-5 h-5" /></div>
                                )}
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                                    <h3 className="font-semibold text-lg text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                                        {announcement.title}
                                    </h3>
                                    <div className="flex items-center gap-2">
                                        <Badge variant="outline" className={`text-xs border ${announcement.priority === 'Urgent' ? 'border-red-200 text-red-700 bg-red-50 dark:bg-red-500/10' :
                                            announcement.priority === 'Important' ? 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-500/10' :
                                                'border-blue-200 text-blue-700 bg-blue-50 dark:bg-blue-500/10'
                                            }`}>
                                            {announcement.priority}
                                        </Badge>
                                    </div>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-300 mb-4 leading-relaxed">
                                    {announcement.message}
                                </p>
                                <div className="flex items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                                    <span className="flex items-center gap-1">
                                        <CalendarClock className="w-3.5 h-3.5" />
                                        {announcement.date}
                                    </span>
                                    <span>•</span>
                                    <span>From: <span className="text-slate-700 dark:text-slate-300">{announcement.sender}</span></span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>
        </motion.div>
    );
}
