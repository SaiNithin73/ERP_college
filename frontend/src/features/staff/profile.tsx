import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Briefcase, Pencil } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';

export default function StaffProfile({ staffData }: { staffData?: any }) {
    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6 max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={fadeInUp} className="lg:col-span-1">
                    <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-md overflow-hidden text-center pb-6">
                        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        <div className="relative -mt-12 flex justify-center">
                            <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-900 shadow-sm">
                                <AvatarFallback className="bg-slate-100 text-2xl font-bold text-indigo-700">ST</AvatarFallback>
                            </Avatar>
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">Dr. Sarah Thompson</h3>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Associate Professor</p>
                        <Badge variant="outline" className="mt-2 border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10">Computer Science Dept</Badge>

                        <div className="mt-6 px-6 grid grid-cols-2 gap-4 text-left">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Staff ID</p>
                                <p className="font-mono text-sm mt-1 font-medium">{staffData?.staff_id ?? staffData?.id ?? 'N/A'}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Joined</p>
                                <p className="text-sm mt-1 font-medium">Aug 2018</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
                    <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm">
                        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <User className="w-5 h-5 text-indigo-500" />
                                Personal Information
                            </CardTitle>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-indigo-600 hover:bg-indigo-50" title="Edit Profile">
                                <Pencil className="w-4 h-4" />
                            </Button>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1 text-sm">
                                <label className="text-muted-foreground flex items-center gap-2 font-medium"><Mail className="w-3.5 h-3.5" /> Email Address</label>
                                <div className="font-medium">sarah.t@university.edu</div>
                            </div>
                            <div className="space-y-1 text-sm">
                                <label className="text-muted-foreground flex items-center gap-2 font-medium"><Phone className="w-3.5 h-3.5" /> Contact Number</label>
                                <div className="font-medium">+91 98765 43210</div>
                            </div>
                            <div className="space-y-1 text-sm sm:col-span-2">
                                <label className="text-muted-foreground flex items-center gap-2 font-medium"><MapPin className="w-3.5 h-3.5" /> Address</label>
                                <div className="font-medium">Block C, Faculty Quarters, University Campus, State, 123456</div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm">
                        <CardHeader className="pb-3 border-b border-border">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Briefcase className="w-5 h-5 text-indigo-500" />
                                Department Profile
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1 text-sm">
                                <label className="text-muted-foreground font-medium">Department</label>
                                <div className="font-medium">Computer Science & Engineering</div>
                            </div>
                            <div className="space-y-1 text-sm">
                                <label className="text-muted-foreground font-medium">Specialization</label>
                                <div className="font-medium">Machine Learning, Data Structures</div>
                            </div>
                            <div className="space-y-1 text-sm">
                                <label className="text-muted-foreground font-medium">Role/Position</label>
                                <div className="font-medium">Associate Professor & Student Mentor</div>
                            </div>
                            <div className="space-y-1 text-sm">
                                <label className="text-muted-foreground font-medium">Highest Qualification</label>
                                <div className="font-medium">Ph.D. in Computer Science</div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
