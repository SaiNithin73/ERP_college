import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { TestTube, FileText, ExternalLink } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const MOCK_PROJECTS = [
    { title: 'AI in Education - Phase 2', status: 'In Progress', progress: 65, fund: 'Government Grant' },
    { title: 'Distributed Systems Patterns', status: 'Review', progress: 90, fund: 'Internal' },
];

const MOCK_PUBS = [
    { title: 'Novel Routing Algorithm for MANETs', year: 2025, journal: 'IEEE Transactions', citations: 12 },
    { title: 'Cloud Security Metrics Evaluation', year: 2024, journal: 'ACM Computing Surveys', citations: 45 },
];

export default function StaffResearch() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Research & Publications</h2>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={fadeInUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] h-full border-l-4 border-l-purple-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <TestTube className="w-5 h-5 text-purple-500" />
                                Active Projects
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {MOCK_PROJECTS.map((proj, i) => (
                                <div key={i} className="p-4 border border-border rounded-lg hover:border-purple-300 transition-colors bg-background/50">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <h4 className="font-semibold text-foreground">{proj.title}</h4>
                                            <p className="text-xs text-muted-foreground mt-1">Fund: {proj.fund}</p>
                                        </div>
                                        <Badge variant="outline" className="border-purple-200 text-purple-700 dark:text-purple-400">{proj.status}</Badge>
                                    </div>
                                    <div className="mt-4">
                                        <div className="flex justify-between text-xs mb-1">
                                            <span>Progress</span>
                                            <span>{proj.progress}%</span>
                                        </div>
                                        <Progress value={proj.progress} className="h-2 [&>div]:bg-purple-500" />
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <Card className="bg-[hsl(var(--surface-raised))] h-full border-l-4 border-l-indigo-500">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <FileText className="w-5 h-5 text-indigo-500" />
                                Publications
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {MOCK_PUBS.map((pub, i) => (
                                <div key={i} className="p-4 border border-border rounded-lg flex gap-4 hover:border-indigo-300 transition-colors bg-background/50 group">
                                    <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-500/10 rounded font-bold text-indigo-600 dark:text-indigo-400 flex flex-col items-center justify-center flex-shrink-0">
                                        <span className="text-[10px] leading-tight">Y</span>
                                        <span className="text-sm leading-tight">{pub.year}</span>
                                    </div>
                                    <div className="flex-1">
                                        <h4 className="font-semibold text-foreground text-sm group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors flex items-center gap-1 cursor-pointer">
                                            {pub.title} <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                                        </h4>
                                        <p className="text-xs text-muted-foreground mt-1">{pub.journal}</p>
                                        <p className="text-xs font-medium text-slate-500 mt-2">{pub.citations} Citations</p>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
