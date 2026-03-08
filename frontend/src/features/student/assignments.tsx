import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const MOCK_ASSIGNMENTS = [
    { title: 'Project Proposal', subject: 'Software Eng', assigned: 'Mar 1', due: 'Mar 10', status: 'Pending', marks: null },
    { title: 'Graph Algorithms', subject: 'DSA', assigned: 'Feb 28', due: 'Mar 5', status: 'Pending', marks: null },
    { title: 'SQL Queries', subject: 'DBMS', assigned: 'Feb 20', due: 'Feb 25', status: 'Submitted', marks: null },
    { title: 'Process States', subject: 'OS', assigned: 'Feb 15', due: 'Feb 20', status: 'Graded', marks: '18/20' },
    { title: 'Network Layers Essay', subject: 'CN', assigned: 'Feb 10', due: 'Feb 15', status: 'Graded', marks: '15/20' },
];

export default function StudentAssignments() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="w-full bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 py-2 px-4 rounded-md text-sm font-medium mb-4 text-center">
                This section is in development. Showing representative preview data.
            </div>

            <h2 className="text-xl font-bold text-slate-900 dark:text-white">All Assignments</h2>

            <motion.div variants={fadeInUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border border-border">
                    <CardContent className="p-0">
                        <Tabs defaultValue="All" className="w-full">
                            <div className="border-b border-border p-4 pb-0">
                                <TabsList className="bg-transparent mb-4">
                                    {['All', 'Pending', 'Submitted', 'Graded'].map(tab => (
                                        <TabsTrigger key={tab} value={tab} className="data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900/40 text-sm">
                                            {tab}
                                        </TabsTrigger>
                                    ))}
                                </TabsList>
                            </div>

                            <div className="overflow-x-auto p-4">
                                <table className="w-full text-sm text-left border-collapse min-w-[600px]">
                                    <thead>
                                        <tr className="border-b border-border text-muted-foreground whitespace-nowrap">
                                            <th className="py-2 px-4 font-semibold">Subject</th>
                                            <th className="py-2 px-4 font-semibold">Title</th>
                                            <th className="py-2 px-4 font-semibold">Assigned</th>
                                            <th className="py-2 px-4 font-semibold">Due Date</th>
                                            <th className="py-2 px-4 font-semibold">Status</th>
                                            <th className="py-2 px-4 font-semibold">Marks</th>
                                            <th className="py-2 px-4 font-semibold text-right">Action</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {MOCK_ASSIGNMENTS.map((row, i) => (
                                            <tr key={i} className="hover:bg-muted/50 transition-colors">
                                                <td className="py-3 px-4 font-medium">{row.subject}</td>
                                                <td className="py-3 px-4 text-slate-900 dark:text-white">{row.title}</td>
                                                <td className="py-3 px-4 text-muted-foreground">{row.assigned}</td>
                                                <td className="py-3 px-4 font-medium">{row.due}</td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        className={
                                                            row.status === 'Pending' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' :
                                                                row.status === 'Submitted' ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' :
                                                                    'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                                        }
                                                    >
                                                        {row.status}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">{row.marks || '—'}</td>
                                                <td className="py-3 px-4 text-right">
                                                    {row.status === 'Pending' ? (
                                                        <button disabled className="text-xs px-3 py-1 font-semibold bg-indigo-500 text-white rounded opacity-50 cursor-not-allowed" title="Coming soon">
                                                            Submit
                                                        </button>
                                                    ) : (
                                                        <button disabled className="text-xs px-3 py-1 font-semibold border border-muted-foreground/30 rounded opacity-50 cursor-not-allowed">
                                                            View
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </Tabs>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
