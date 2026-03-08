import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Bell, Send, Trash2, ShieldAlert } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const MOCK_ANNOUNCEMENTS = [
    { id: 1, title: 'Server Maintenance', content: 'Scheduled downtime on Sunday 2AM.', type: 'Urgent', targets: ['All'], date: '2 hours ago' },
    { id: 2, title: 'Updated HR Policy', content: 'Please review the new leave policies attached.', type: 'Important', targets: ['Staff', 'Management'], date: '1 day ago' },
];

export default function AdminAnnouncements() {
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [priority, setPriority] = useState('Important');
    const [isPublishing, setIsPublishing] = useState(false);
    const [feed, setFeed] = useState(MOCK_ANNOUNCEMENTS);

    const handlePublish = (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !content.trim()) {
            toast.error("Title and Content are required.");
            return;
        }

        setIsPublishing(true);
        setTimeout(() => {
            const newAnn = {
                id: Date.now(),
                title,
                content,
                type: priority,
                targets: ['All'],
                date: 'Just now'
            };
            setFeed([newAnn, ...feed]);
            setIsPublishing(false);
            setTitle('');
            setContent('');
            toast.success("Announcement published across portals!");
        }, 1000);
    };

    const handleDelete = (id: number) => {
        setFeed(prev => prev.filter(f => f.id !== id));
        toast.info("Announcement revoked.");
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <Bell className="w-5 h-5 text-red-500" />
                Global Announcements
            </h2>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <motion.div variants={fadeInUp} className="lg:col-span-5">
                    <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl h-full shadow-lg">
                        <CardHeader className="border-b border-zinc-100 dark:border-white/[0.05] pb-4">
                            <CardTitle className="text-lg">Compose Alert</CardTitle>
                            <CardDescription>Broadcast messages to specific user roles.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6">
                            <form onSubmit={handlePublish} className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-zinc-500">Subject</label>
                                    <Input
                                        value={title}
                                        onChange={e => setTitle(e.target.value)}
                                        placeholder="E.g., Emergency Server Maintenance"
                                        className="bg-white dark:bg-white/[0.02]"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-zinc-500">Message</label>
                                    <textarea
                                        value={content}
                                        onChange={e => setContent(e.target.value)}
                                        className="w-full h-32 p-3 text-sm rounded-md border border-zinc-200 dark:border-white/[0.05] bg-white dark:bg-white/[0.02] focus:outline-none focus:ring-2 focus:ring-red-500/50 resize-none custom-scrollbar"
                                        placeholder="Detailed message..."
                                    />
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-semibold uppercase text-zinc-500">Priority Level</label>
                                    <div className="flex gap-2">
                                        {['Normal', 'Important', 'Urgent'].map(p => (
                                            <div
                                                key={p}
                                                onClick={() => setPriority(p)}
                                                className={`flex-1 text-center py-2 rounded-md text-xs font-semibold cursor-pointer border transition-colors ${priority === p
                                                        ? p === 'Urgent' ? 'bg-red-50 text-red-700 border-red-200 dark:bg-red-500/20 dark:border-red-500/30 dark:text-red-400'
                                                            : p === 'Important' ? 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400'
                                                                : 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/20 dark:border-blue-500/30 dark:text-blue-400'
                                                        : 'bg-zinc-50 border-zinc-200 text-zinc-500 hover:bg-zinc-100 dark:bg-white/[0.02] dark:border-white/[0.05] dark:hover:bg-white/[0.05]'
                                                    }`}
                                            >
                                                {p}
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="pt-4 flex gap-3 border-t border-zinc-100 dark:border-white/[0.05]">
                                    <Button type="button" variant="outline" className="flex-1" onClick={() => { setTitle(''); setContent(''); }}>Clear</Button>
                                    <Button type="submit" disabled={isPublishing} className="flex-1 gap-2 bg-red-600 hover:bg-red-700 text-white">
                                        <Send className="w-4 h-4" /> {isPublishing ? 'Broadcasting...' : 'Publish'}
                                    </Button>
                                </div>
                            </form>
                        </CardContent>
                    </Card>
                </motion.div>

                <motion.div variants={fadeInUp} className="lg:col-span-7">
                    <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl h-full">
                        <CardHeader className="border-b border-zinc-100 dark:border-white/[0.05] pb-4">
                            <CardTitle className="text-lg">Broadcast History</CardTitle>
                            <CardDescription>Recently published global announcements.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 p-0">
                            <div className="max-h-[500px] overflow-y-auto custom-scrollbar p-6 space-y-4">
                                <AnimatePresence>
                                    {feed.length === 0 && (
                                        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-10 text-zinc-500">
                                            No active announcements.
                                        </motion.div>
                                    )}
                                    {feed.map(item => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, scale: 0.95 }}
                                            className="relative bg-white dark:bg-[#111827] border border-zinc-200 dark:border-white/[0.05] p-5 rounded-xl shadow-sm hover:shadow-md transition-shadow group"
                                        >
                                            <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button onClick={() => handleDelete(item.id)} variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </div>

                                            <div className="flex gap-2 items-center mb-2">
                                                {item.type === 'Urgent' && <ShieldAlert className="w-4 h-4 text-red-500" />}
                                                <Badge variant="outline" className={`text-[10px] uppercase ${item.type === 'Urgent' ? 'border-red-500/30 text-red-600 bg-red-50 dark:bg-red-500/10 dark:text-red-400' :
                                                        item.type === 'Important' ? 'border-amber-500/30 text-amber-600 bg-amber-50 dark:bg-amber-500/10 dark:text-amber-400' :
                                                            'border-blue-500/30 text-blue-600 bg-blue-50 dark:bg-blue-500/10 dark:text-blue-400'
                                                    }`}>
                                                    {item.type}
                                                </Badge>
                                                <span className="text-xs text-zinc-400">{item.date}</span>
                                            </div>
                                            <h3 className="font-bold text-zinc-900 dark:text-white text-lg mb-1 pr-10">{item.title}</h3>
                                            <p className="text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed mb-4">{item.content}</p>
                                            <div className="flex gap-2 items-center border-t border-zinc-100 dark:border-white/[0.05] pt-3">
                                                <span className="text-[10px] uppercase font-semibold text-zinc-500 tracking-wider">Targeted:</span>
                                                <div className="flex gap-1.5">
                                                    {item.targets.map(t => (
                                                        <Badge key={t} variant="secondary" className="text-[10px] bg-zinc-100 dark:bg-white/[0.05] dark:text-zinc-300 pointer-events-none">{t}</Badge>
                                                    ))}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
