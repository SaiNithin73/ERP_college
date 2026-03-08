import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const EVENTS = [
    { date: 5, label: 'Today', type: 'info', color: 'bg-indigo-500' },
    { date: 12, label: 'Assignment Due', type: 'warning', color: 'bg-amber-500' },
    { date: 18, label: 'Midterm Exam', type: 'danger', color: 'bg-red-500' },
    { date: 24, label: 'Public Holiday', type: 'success', color: 'bg-emerald-500' },
];

export default function StudentCalendar() {
    const daysInMonth = Array.from({ length: 31 }, (_, i) => i + 1);
    // starts on sunday
    const startOffset = 0;

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="w-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 py-2 px-4 rounded-md text-sm font-medium mb-4 text-center">
                This section is in development. Showing representative preview data.
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Calendar</h2>

            <motion.div variants={fadeInUp}>
                <Card className="bg-[hsl(var(--surface-raised))]">
                    <CardHeader className="text-center pb-2">
                        <CardTitle className="text-2xl">March 2026</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-7 gap-1 text-center mb-2 font-semibold text-muted-foreground text-sm">
                            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
                                <div key={d} className="py-2">{d}</div>
                            ))}
                        </div>
                        <div className="grid grid-cols-7 gap-1">
                            {Array.from({ length: startOffset }).map((_, i) => <div key={`empty-${i}`} className="p-2" />)}

                            {daysInMonth.map(day => {
                                const event = EVENTS.find(e => e.date === day);
                                const isToday = day === 5;
                                return (
                                    <div
                                        key={day}
                                        className={`aspect-square p-1 sm:p-2 rounded-lg border border-transparent 
                                        ${isToday ? 'bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200' : 'hover:bg-muted/50 cursor-pointer'} 
                                        flex flex-col items-center justify-center relative transition-colors`}
                                    >
                                        <span className={`text-sm sm:text-base ${isToday ? 'font-bold text-indigo-700 dark:text-indigo-400' : 'text-foreground'}`}>
                                            {day}
                                        </span>
                                        {event && !isToday && (
                                            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${event.color}`} />
                                        )}
                                        {isToday && (
                                            <div className={`w-1.5 h-1.5 rounded-full mt-1 ${EVENTS.find(e => e.date === 5)?.color}`} />
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
                <h3 className="text-lg font-bold mb-4 mt-6">Upcoming Events</h3>
                <div className="space-y-3">
                    {EVENTS.map((event, i) => (
                        <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-[hsl(var(--surface-raised))] border border-border shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className={`w-12 h-12 rounded-lg flex flex-col items-center justify-center ${event.color}/10 text-${event.color.split('-')[1]}-600`}>
                                    <span className="text-xs font-bold ring-1 ring-black/5 dark:ring-white/10 px-1 rounded uppercase tracking-wider bg-background/50 backdrop-blur-sm">MAR</span>
                                    <span className="font-bold">{event.date}</span>
                                </div>
                                <div>
                                    <p className="font-semibold text-foreground">{event.label}</p>
                                </div>
                            </div>
                            <Badge variant="outline" className={`${event.type === 'danger' ? 'text-red-500' : event.type === 'warning' ? 'text-amber-500' : 'text-indigo-500'} border-current`}>
                                {event.type.toUpperCase()}
                            </Badge>
                        </div>
                    ))}
                </div>
            </motion.div>
        </motion.div>
    );
}
