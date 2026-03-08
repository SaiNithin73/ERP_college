import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator } from '@/components/ui/dropdown-menu';
import { Search, Filter, MoreHorizontal, Edit, UserX, Check, X, Clock } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const MOCK_STAFF = [
    { id: 'FAC001', name: 'Dr. Sarah Connor', dept: 'CS', role: 'Professor', courses: 2, leaves: 12, status: 'Active' },
    { id: 'FAC015', name: 'Prof. Alan Turing', dept: 'CS', role: 'Assoc. Prof', courses: 3, leaves: 8, status: 'Active' },
    { id: 'FAC042', name: 'James Watt', dept: 'ME', role: 'Asst. Prof', courses: 4, leaves: 15, status: 'On Leave' },
    { id: 'FAC088', name: 'Ada Lovelace', dept: 'IT', role: 'Professor', courses: 1, leaves: 4, status: 'Active' },
    { id: 'FAC095', name: 'Nikola Tesla', dept: 'EE', role: 'Assoc. Prof', courses: 3, leaves: 21, status: 'Warning' },
];

const MOCK_LEAVE_REQUESTS = [
    { id: 'LR-924', staff: 'James Watt', type: 'Medical', duration: '5 days', from: '2026-03-10', status: 'Pending' },
    { id: 'LR-925', staff: 'Nikola Tesla', type: 'Casual', duration: '2 days', from: '2026-03-15', status: 'Pending' },
];

export default function AdminStaffManager() {
    const [staff] = useState(MOCK_STAFF);
    const [leaveReqs, setLeaveReqs] = useState(MOCK_LEAVE_REQUESTS);
    const [search, setSearch] = useState('');

    const filtered = staff.filter(s =>
        s.name.toLowerCase().includes(search.toLowerCase()) ||
        s.id.toLowerCase().includes(search.toLowerCase())
    );

    const handleLeaveAction = (id: string, action: 'approve' | 'reject') => {
        setLeaveReqs(prev => prev.filter(req => req.id !== id));
        toast.success(`Leave request ${action}d successfully`);
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Staff Manager</h2>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400">Manage faculty records and process cross-department leaves.</p>
                </div>
            </div>

            <motion.div variants={fadeInUp}>
                <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl">
                    <CardHeader className="p-4 border-b border-zinc-100 dark:border-white/[0.05] flex flex-col justify-between">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-base font-semibold flex items-center gap-2">
                                <Clock className="w-4 h-4 text-purple-500" />
                                Escalated Leave Requests
                            </CardTitle>
                            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-500/20 dark:text-purple-400">
                                {leaveReqs.length} Pending
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        {leaveReqs.length > 0 ? (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-zinc-50/50 dark:bg-white/[0.02]">
                                            <TableHead>Req ID</TableHead>
                                            <TableHead>Staff Member</TableHead>
                                            <TableHead>Type</TableHead>
                                            <TableHead>Details</TableHead>
                                            <TableHead className="text-right">Action</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        <AnimatePresence>
                                            {leaveReqs.map(req => (
                                                <motion.tr
                                                    key={req.id}
                                                    initial={{ opacity: 0, height: 0 }}
                                                    animate={{ opacity: 1, height: 'auto' }}
                                                    exit={{ opacity: 0, height: 0 }}
                                                >
                                                    <TableCell className="font-mono text-xs">{req.id}</TableCell>
                                                    <TableCell className="font-medium">{req.staff}</TableCell>
                                                    <TableCell>{req.type}</TableCell>
                                                    <TableCell className="text-sm text-zinc-500">{req.duration} from {req.from}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex items-center justify-end gap-2">
                                                            <Button onClick={() => handleLeaveAction(req.id, 'reject')} variant="outline" size="icon" className="h-7 w-7 border-red-200 text-red-600 hover:bg-red-50 dark:border-red-500/20 dark:hover:bg-red-500/10 rounded-full">
                                                                <X className="w-3.5 h-3.5" />
                                                            </Button>
                                                            <Button onClick={() => handleLeaveAction(req.id, 'approve')} variant="outline" size="icon" className="h-7 w-7 border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/20 dark:hover:bg-emerald-500/10 rounded-full">
                                                                <Check className="w-3.5 h-3.5" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </motion.tr>
                                            ))}
                                        </AnimatePresence>
                                    </TableBody>
                                </Table>
                            </div>
                        ) : (
                            <div className="p-6 text-center text-sm text-zinc-500">All escalated leave requests resolved.</div>
                        )}
                    </CardContent>
                </Card>
            </motion.div>

            <motion.div variants={fadeInUp}>
                <Card className="bg-white/60 dark:bg-[#09090b]/60 border-zinc-200 dark:border-white/[0.05] backdrop-blur-xl">
                    <CardHeader className="p-4 border-b border-zinc-100 dark:border-white/[0.05] flex flex-col sm:flex-row gap-4 justify-between">
                        <div className="relative w-full sm:max-w-xs">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                            <Input
                                placeholder="Search staff ID or name..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 bg-zinc-100/50 dark:bg-white/[0.02] border-zinc-200 dark:border-white/[0.05] focus-visible:ring-red-500 h-9"
                            />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2 h-9 border-zinc-200 dark:border-white/[0.1]">
                            <Filter className="w-4 h-4" /> Filters
                        </Button>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto max-h-[50vh] custom-scrollbar">
                            <Table>
                                <TableHeader className="sticky top-0 bg-white/95 dark:bg-[#09090b]/95 backdrop-blur z-10 shadow-sm border-b border-zinc-100 dark:border-white/[0.05]">
                                    <TableRow className="border-0 hover:bg-transparent">
                                        <TableHead>Staff ID</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Dept</TableHead>
                                        <TableHead>Designation</TableHead>
                                        <TableHead className="text-center">Leave Bal.</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filtered.map((s) => (
                                        <TableRow key={s.id} className="border-zinc-100 dark:border-white/[0.05] hover:bg-zinc-50 dark:hover:bg-white/[0.02] transition-colors group">
                                            <TableCell className="font-mono text-xs text-zinc-500">{s.id}</TableCell>
                                            <TableCell className="font-semibold text-zinc-900 dark:text-zinc-100">{s.name}</TableCell>
                                            <TableCell>{s.dept}</TableCell>
                                            <TableCell>{s.role}</TableCell>
                                            <TableCell className="text-center">
                                                <span className={`font-semibold ${s.leaves > 20 ? 'text-amber-600' : 'text-zinc-700 dark:text-zinc-300'}`}>{s.leaves}</span>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className={`border ${s.status === 'Active' ? 'border-emerald-500/30 text-emerald-700 bg-emerald-50 dark:bg-emerald-500/10' :
                                                    s.status === 'Warning' ? 'border-amber-500/30 text-amber-700 bg-amber-50 dark:bg-amber-500/10' :
                                                        'border-zinc-500/30 text-zinc-700 bg-zinc-50 dark:bg-zinc-500/10 dark:text-zinc-300'
                                                    }`}>
                                                    {s.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white">
                                                            <MoreHorizontal className="w-4 h-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-48 bg-white dark:bg-[#09090b] border-zinc-200 dark:border-white/[0.05]">
                                                        <DropdownMenuLabel>Manage Staff</DropdownMenuLabel>
                                                        <DropdownMenuSeparator className="bg-zinc-100 dark:bg-white/[0.05]" />
                                                        <DropdownMenuItem className="gap-2 cursor-pointer focus:bg-zinc-100 dark:focus:bg-white/[0.05]">
                                                            <Edit className="w-4 h-4" /> Edit Profile
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 cursor-pointer text-red-600 focus:bg-red-50 dark:focus:bg-red-500/10 focus:text-red-700 dark:focus:text-red-400">
                                                            <UserX className="w-4 h-4" /> Deactivate Account
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </motion.div>
        </motion.div>
    );
}
