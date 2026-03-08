import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { staggerContainer, fadeInUp } from '@/components/animations/transitions';
import { BarChart } from 'lucide-react';

export default function Reports() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Reports</h2>
            <motion.div variants={fadeInUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <BarChart className="w-5 h-5 text-indigo-500" />
                        <CardTitle>Custom Report Generation</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Select fields to generate compliance and institutional reports.</p>
                        <button className="px-4 py-2 bg-slate-200 dark:bg-white/10 text-slate-500 dark:text-white/40 cursor-not-allowed rounded-md text-sm font-medium" disabled>
                            Generate Report (Backend Pending)
                        </button>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
