import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, GraduationCap, Pencil, Save, X } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function StudentProfile() {
    const [isEditing, setIsEditing] = useState(false);

    // Mock Data init
    const [profileData, setProfileData] = useState({
        name: 'Sai Nithin',
        email: 'sai.nithin@student.university.edu',
        phone: '+91 98765 43210',
        address: 'Hostel A, Room 402, University Campus',
        department: 'Computer Science & Engineering',
        program: 'B.Tech',
        semester: 'Semester 5',
        rollNumber: 'CS2023045',
        enrollmentYear: '2023',
    });

    const [editData, setEditData] = useState({ ...profileData });

    const initials = profileData.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

    const handleSave = () => {
        setProfileData(editData);
        setIsEditing(false);
        toast.success("Profile updated successfully!");
    };

    const handleCancel = () => {
        setEditData({ ...profileData });
        setIsEditing(false);
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6 max-w-5xl mx-auto">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">My Profile</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={fadeInUp} className="lg:col-span-1">
                    <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-md overflow-hidden text-center pb-6 h-full">
                        <div className="h-24 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
                        <div className="relative -mt-12 flex justify-center">
                            <Avatar className="w-24 h-24 border-4 border-white dark:border-slate-900 shadow-sm">
                                <AvatarFallback className="bg-slate-100 text-2xl font-bold text-indigo-700">{initials}</AvatarFallback>
                            </Avatar>
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-slate-900 dark:text-white">{profileData.name}</h3>
                        <p className="text-sm text-indigo-600 dark:text-indigo-400 font-medium">Undergraduate Student</p>
                        <Badge variant="outline" className="mt-2 border-indigo-200 text-indigo-700 bg-indigo-50 dark:bg-indigo-500/10">
                            {profileData.department}
                        </Badge>

                        <div className="mt-6 px-6 grid grid-cols-2 gap-4 text-left border-t border-slate-100 dark:border-white/[0.05] pt-6">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Roll No.</p>
                                <p className="font-mono text-sm mt-1 font-medium">{profileData.rollNumber}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Enrolled</p>
                                <p className="text-sm mt-1 font-medium">{profileData.enrollmentYear}</p>
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
                            {!isEditing ? (
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-500/10">
                                    <Pencil className="w-4 h-4 mr-2" /> Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleCancel}>
                                        <X className="w-4 h-4 mr-1" /> Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSave} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                                        <Save className="w-4 h-4 mr-1" /> Save
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                                        <Mail className="w-3.5 h-3.5" /> Email Address
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            className="bg-white dark:bg-slate-900"
                                        />
                                    ) : (
                                        <div className="font-medium text-sm p-2 bg-slate-50 dark:bg-white/[0.02] rounded-md border border-transparent">
                                            {profileData.email}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                                        <Phone className="w-3.5 h-3.5" /> Contact Number
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={editData.phone}
                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                            className="bg-white dark:bg-slate-900"
                                        />
                                    ) : (
                                        <div className="font-medium text-sm p-2 bg-slate-50 dark:bg-white/[0.02] rounded-md border border-transparent">
                                            {profileData.phone}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                                        <MapPin className="w-3.5 h-3.5" /> Address
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={editData.address}
                                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                            className="bg-white dark:bg-slate-900"
                                        />
                                    ) : (
                                        <div className="font-medium text-sm p-2 bg-slate-50 dark:bg-white/[0.02] rounded-md border border-transparent">
                                            {profileData.address}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-[hsl(var(--surface-raised))] border-none shadow-sm pb-2">
                        <CardHeader className="pb-3 border-b border-border">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-indigo-500" />
                                Academic Details
                            </CardTitle>
                            <CardDescription>Academic records are locked and cannot be edited by the student.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1 text-sm bg-slate-50 dark:bg-white/[0.02] p-3 rounded-lg border border-slate-100 dark:border-white/[0.05]">
                                <label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Program</label>
                                <div className="font-medium mt-1">{profileData.program}</div>
                            </div>
                            <div className="space-y-1 text-sm bg-slate-50 dark:bg-white/[0.02] p-3 rounded-lg border border-slate-100 dark:border-white/[0.05]">
                                <label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Department</label>
                                <div className="font-medium mt-1">{profileData.department}</div>
                            </div>
                            <div className="space-y-1 text-sm bg-slate-50 dark:bg-white/[0.02] p-3 rounded-lg border border-slate-100 dark:border-white/[0.05]">
                                <label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Current Semester</label>
                                <div className="font-medium mt-1">{profileData.semester}</div>
                            </div>
                            <div className="space-y-1 text-sm bg-slate-50 dark:bg-white/[0.02] p-3 rounded-lg border border-slate-100 dark:border-white/[0.05]">
                                <label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Roll Number</label>
                                <div className="font-medium mt-1 font-mono">{profileData.rollNumber}</div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
