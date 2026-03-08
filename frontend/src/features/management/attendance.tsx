import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { staggerContainer, fadeInUp } from '@/components/animations/transitions';
import { ClipboardCheck } from 'lucide-react';

export default function Attendance() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Attendance</h2>
            <motion.div variants={fadeInUp}>
                <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-indigo-500" />
                        <CardTitle>Institutional Attendance</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground">Daily attendance rollups across all departments and years.</p>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
