
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tooltip } from '@/components/ui/tooltips';
import { GraduationCap, Briefcase, Shield, Building, Activity, RotateCw, ExternalLink } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const PORTALS = [
    {
        id: 'student',
        name: 'Student Portal',
        icon: GraduationCap,
        color: 'indigo',
        status: 'Online',
        stats: [
            { label: 'Active Sessions', value: '3,421' },
            { label: 'Avg Latency', value: '42ms' },
            { label: 'Error Rate', value: '0.01%' }
        ]
    },
    {
        id: 'staff',
        name: 'Staff Portal',
        icon: Briefcase,
        color: 'purple',
        status: 'Online',
        stats: [
            { label: 'Active Sessions', value: '254' },
            { label: 'Avg Latency', value: '35ms' },
            { label: 'Error Rate', value: '0.00%' }
        ]
    },
    {
        id: 'admin',
        name: 'Admin Terminal',
        icon: Shield,
        color: 'red',
        status: 'Online',
        stats: [
            { label: 'Active Sessions', value: '4' },
            { label: 'Avg Latency', value: '18ms' },
            { label: 'Error Rate', value: '0.00%' }
        ]
    },
    {
        id: 'management',
        name: 'Executive Board',
        icon: Building,
        color: 'amber',
        status: 'Degraded',
        stats: [
            { label: 'Active Sessions', value: '12' },
            { label: 'Avg Latency', value: '850ms' },
            { label: 'Error Rate', value: '2.40%' }
        ]
    }
];

export default function AdminPortalMonitor() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-red-500" />
                Portal Monitor
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {PORTALS.map((portal) => {
                    const isWarning = portal.status !== 'Online';
                    return (
                        <motion.div key={portal.id} variants={fadeInUp}>
                            <Card className={`relative overflow-hidden border-zinc-200 dark:border-white/[0.05] bg-white/60 dark:bg-[#09090b]/60 backdrop-blur-xl ${portal.color === 'indigo' ? 'shadow-indigo-500/5 hover:border-indigo-500/30' :
                                portal.color === 'purple' ? 'shadow-purple-500/5 hover:border-purple-500/30' :
                                    portal.color === 'red' ? 'shadow-red-500/5 hover:border-red-500/30' :
                                        'shadow-amber-500/5 hover:border-amber-500/30'
                                }`}>
                                <div className={`absolute left-0 top-0 bottom-0 w-1 ${portal.color === 'indigo' ? 'bg-indigo-500' :
                                    portal.color === 'purple' ? 'bg-purple-500' :
                                        portal.color === 'red' ? 'bg-red-500' :
                                            'bg-amber-500'
                                    }`} />

                                <CardHeader className="pb-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className={`p-2 rounded-lg ${portal.color === 'indigo' ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-500/20 dark:text-indigo-400' :
                                                portal.color === 'purple' ? 'bg-purple-100 text-purple-600 dark:bg-purple-500/20 dark:text-purple-400' :
                                                    portal.color === 'red' ? 'bg-red-100 text-red-600 dark:bg-red-500/20 dark:text-red-400' :
                                                        'bg-amber-100 text-amber-600 dark:bg-amber-500/20 dark:text-amber-400'
                                                }`}>
                                                <portal.icon className="w-5 h-5" />
                                            </div>
                                            <CardTitle className="text-lg font-bold text-zinc-900 dark:text-white">{portal.name}</CardTitle>
                                        </div>
                                        <Badge variant="outline" className={`flex items-center gap-1.5 ${isWarning ? 'border-amber-500/50 text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10' :
                                            'border-emerald-500/50 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${isWarning ? 'bg-amber-500 animate-pulse' : 'bg-emerald-500 animate-pulse'}`} />
                                            {portal.status}
                                        </Badge>
                                    </div>
                                </CardHeader>

                                <CardContent className="pt-4">
                                    <div className="grid grid-cols-3 gap-2 divide-x divide-zinc-100 dark:divide-white/[0.05]">
                                        {portal.stats.map((stat, i) => (
                                            <div key={i} className={`flex flex-col items-center justify-center text-center ${i === 0 ? 'pr-2' : i === 1 ? 'px-2' : 'pl-2'}`}>
                                                <span className="text-[10px] text-zinc-500 dark:text-zinc-400 uppercase tracking-wider font-medium mb-1">{stat.label}</span>
                                                <span className="font-bold text-zinc-800 dark:text-zinc-200">{stat.value}</span>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>

                                <CardFooter className="pt-2 pb-4 flex justify-end gap-2 border-t border-zinc-100 dark:border-white/[0.05] mt-4">
                                    <Tooltip content="Backend sync requested. Please wait.">
                                        <Button variant="outline" size="sm" className="gap-2 h-8 text-xs border-zinc-200 dark:border-white/[0.1]" disabled>
                                            <RotateCw className="w-3 h-3" /> Force Sync
                                        </Button>
                                    </Tooltip>
                                    <Button variant="secondary" size="sm" className="gap-2 h-8 text-xs bg-zinc-100 hover:bg-zinc-200 dark:bg-white/[0.05] dark:hover:bg-white/[0.1] text-zinc-900 dark:text-white">
                                        <ExternalLink className="w-3 h-3" /> View Portal
                                    </Button>
                                </CardFooter>
                            </Card>
                        </motion.div>
                    );
                })}
            </div>
        </motion.div>
    );
}
