import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Tooltip } from 'recharts';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';
import { memo } from 'react';

const RADAR_DATA = [
    { subject: 'Maths', score: 95, fullMark: 100 },
    { subject: 'OS', score: 88, fullMark: 100 },
    { subject: 'CN', score: 75, fullMark: 100 },
    { subject: 'DBMS', score: 82, fullMark: 100 },
    { subject: 'DSA', score: 90, fullMark: 100 },
];

const COMP_TABLE = [
    { sem: 'Semester 1', gpa: 7.80, credits: 20, rank: 45, status: 'Completed' },
    { sem: 'Semester 2', gpa: 8.10, credits: 22, rank: 38, status: 'Completed' },
    { sem: 'Semester 3', gpa: 8.45, credits: 24, rank: 25, status: 'Completed' },
    { sem: 'Semester 4', gpa: 8.90, credits: 24, rank: 12, status: 'Completed' },
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        return (
            <div className="bg-white/95 dark:bg-slate-900/95 border border-slate-200 dark:border-white/10 p-2 rounded-lg shadow-xl backdrop-blur-md">
                <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
                    {payload[0].payload.subject}
                </p>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                    Score : <span className="text-indigo-600 dark:text-indigo-400">{payload[0].value}</span>
                </p>
            </div>
        );
    }
    return null;
};

const StudentAnalytics = memo(function StudentAnalytics() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="w-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 py-2 px-4 rounded-md text-sm font-medium mb-4 text-center">
                This section is in development. Showing representative preview data.
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Academic Analytics</h2>

            {/* Row 1 - Stats */}
            <motion.div variants={fadeInUp} className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: 'Overall CGPA', value: '8.72', accent: 'text-indigo-600' },
                    { label: 'Best Subject', value: 'Maths', accent: 'text-purple-600' },
                    { label: 'Most Improved', value: 'OS (+12%)', accent: 'text-emerald-600' }
                ].map((stat, i) => (
                    <Card key={i} className="bg-[hsl(var(--surface-raised))]">
                        <CardContent className="p-6 flex flex-col items-center justify-center text-center">
                            <p className="text-sm font-medium text-slate-500 dark:text-white/60 mb-2">{stat.label}</p>
                            <p className={`text-3xl font-bold ${stat.accent} dark:text-white`}>{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Row 2 - Radar */}
                <motion.div variants={fadeInUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Skill Distribution</CardTitle>
                        </CardHeader>
                        <CardContent className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                                <RadarChart cx="50%" cy="50%" outerRadius="70%" data={RADAR_DATA}>
                                    <PolarGrid stroke="hsl(var(--border))" />
                                    <PolarAngleAxis
                                        dataKey="subject"
                                        tick={{ fill: 'currentColor', fontSize: 12, className: 'fill-slate-500 dark:fill-slate-300' }}
                                    />
                                    <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                    <Radar name="Score" dataKey="score" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                                    <Tooltip content={<CustomTooltip />} />
                                </RadarChart>
                            </ResponsiveContainer>
                        </CardContent>
                    </Card>
                </motion.div>

                {/* Row 3 - Table */}
                <motion.div variants={fadeInUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] h-full">
                        <CardHeader>
                            <CardTitle className="text-lg">Semester Comparison</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-border text-muted-foreground">
                                            <th className="py-2 px-4 font-semibold">Semester</th>
                                            <th className="py-2 px-4 font-semibold text-center">GPA</th>
                                            <th className="py-2 px-4 font-semibold text-center">Credits</th>
                                            <th className="py-2 px-4 font-semibold text-center">Rank</th>
                                            <th className="py-2 px-4 font-semibold text-right">Status</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {COMP_TABLE.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4 font-medium">{row.sem}</td>
                                                <td className="py-3 px-4 text-center font-bold text-indigo-600 dark:text-indigo-400">{row.gpa.toFixed(2)}</td>
                                                <td className="py-3 px-4 text-center">{row.credits}</td>
                                                <td className="py-3 px-4 text-center">#{row.rank}</td>
                                                <td className="py-3 px-4 text-right">
                                                    <Badge variant="outline" className="text-emerald-600 border-emerald-200">
                                                        {row.status}
                                                    </Badge>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
});

export default StudentAnalytics;
