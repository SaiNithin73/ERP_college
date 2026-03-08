import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Cpu, MemoryStick, Activity, Zap, Server, AlertCircle, CheckCircle2 } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

const SVGSparkline = ({ points, color, width = 120, height = 30 }: { points: number[], color: string, width?: number, height?: number }) => {
    const min = Math.min(...points);
    const max = Math.max(...points);
    const range = max - min || 1;

    const coordinates = points.map((p, i) => {
        const x = (i / (points.length - 1)) * width;
        const y = height - ((p - min) / range) * height;
        return `${x},${y}`;
    }).join(' L ');

    return (
        <svg width={width} height={height} className="overflow-visible" style={{ filter: `drop-shadow(0 2px 4px ${color}40)` }}>
            <path d={`M ${coordinates}`} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            {points.length > 0 && (
                <circle
                    cx={width}
                    cy={height - ((points[points.length - 1] - min) / range) * height}
                    r="3"
                    fill={color}
                    className="animate-pulse"
                />
            )}
        </svg>
    );
};

const VITALS = [
    { title: 'CPU Utilization', value: '42%', desc: 'Across 4 main nodes', icon: Cpu, color: '#f87171', points: [30, 35, 32, 45, 48, 42, 38, 40, 44, 42] },
    { title: 'Memory Usage', value: '14.2 GB', desc: 'Out of 32 GB total', icon: MemoryStick, color: '#818cf8', points: [12, 12.2, 12.5, 13, 13.8, 14.2, 14.1, 14.0, 14.1, 14.2] },
    { title: 'API Response', value: '48ms', desc: 'p95 latency', icon: Zap, color: '#34d399', points: [80, 75, 60, 50, 45, 42, 46, 44, 47, 48] },
    { title: 'Error Rate', value: '0.02%', desc: 'Internal server errors', icon: Activity, color: '#fbbf24', points: [0.05, 0.04, 0.04, 0.03, 0.02, 0.01, 0.01, 0.02, 0.03, 0.02] },
];

const SERVICES = [
    { name: 'Core Auth Provider', status: 'Operational', uptime: '99.99%', latency: '24ms' },
    { name: 'Student Database', status: 'Operational', uptime: '99.95%', latency: '42ms' },
    { name: 'Payment Gateway', status: 'Degraded', uptime: '98.40%', latency: '850ms' },
    { name: 'Email Dispatcher', status: 'Operational', uptime: '99.99%', latency: '12ms' },
    { name: 'Attendance Sync', status: 'Operational', uptime: '99.90%', latency: '65ms' },
];

export default function AdminSystemHealth() {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                    <Server className="w-5 h-5 text-red-500" />
                    System Health
                </h2>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">Real-time infrastructure monitoring and vitals</p>
            </div>

            <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {VITALS.map((vital, i) => (
                    <Card key={i} className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                                {vital.title}
                                <vital.icon className="w-4 h-4" style={{ color: vital.color }} />
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-col gap-4">
                                <div>
                                    <div className="text-2xl font-bold text-zinc-900 dark:text-white leading-tight">{vital.value}</div>
                                    <div className="text-[10px] text-zinc-500 dark:text-zinc-400">{vital.desc}</div>
                                </div>
                                <div className="h-[30px] flex items-end">
                                    <SVGSparkline points={vital.points} color={vital.color} />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <motion.div variants={fadeInUp}>
                    <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl h-full">
                        <CardHeader className="pb-2 border-b border-zinc-100 dark:border-white/[0.05]">
                            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-white">Service Status</CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <Table>
                                <TableHeader className="bg-zinc-50/50 dark:bg-white/[0.02]">
                                    <TableRow className="border-zinc-200 dark:border-white/[0.05]">
                                        <TableHead>Service</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Latency</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {SERVICES.map((s, i) => (
                                        <TableRow key={i} className="border-zinc-100 dark:border-white/[0.05]">
                                            <TableCell className="font-medium">{s.name}</TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-2 h-2 rounded-full ${s.status === 'Operational' ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                                                    <span className={`text-xs ${s.status === 'Operational' ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400'}`}>{s.status}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right text-xs font-mono text-zinc-500">{s.latency}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                    <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl h-full">
                        <CardHeader className="pb-2 border-b border-zinc-100 dark:border-white/[0.05]">
                            <CardTitle className="text-base font-semibold text-zinc-900 dark:text-white flex items-center justify-between">
                                Error Logs (Last 24h)
                                <Badge variant="outline" className="text-xs bg-red-50 text-red-600 border-red-200 dark:bg-red-500/10 dark:text-red-400 dark:border-red-500/20">3 Unresolved</Badge>
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="divide-y divide-zinc-100 dark:divide-white/[0.05] overflow-y-auto max-h-[280px]">
                                {[
                                    { msg: 'Payment Gateway timeout during fee sync', time: '10 mins ago', resolved: false },
                                    { msg: 'Database connection pool exhausted', time: '45 mins ago', resolved: false },
                                    { msg: 'Invalid token signature detected', time: '2 hours ago', resolved: true },
                                    { msg: 'Redis cache eviction warning', time: '4 hours ago', resolved: false },
                                    { msg: 'High memory usage on Node 3', time: '6 hours ago', resolved: true },
                                ].map((log, i) => (
                                    <div key={i} className={`p-4 flex gap-3 items-start transition-colors ${log.resolved ? 'opacity-60 grayscale' : 'hover:bg-zinc-50 dark:hover:bg-white/[0.02]'}`}>
                                        <div className="mt-0.5">
                                            {log.resolved ? <CheckCircle2 className="w-4 h-4 text-zinc-400" /> : <AlertCircle className="w-4 h-4 text-red-500" />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={`text-sm ${log.resolved ? 'text-zinc-500 dark:text-zinc-500 line-through' : 'font-medium text-zinc-900 dark:text-zinc-200'}`}>
                                                {log.msg}
                                            </p>
                                            <p className="text-[10px] text-zinc-400 mt-1">{log.time}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
