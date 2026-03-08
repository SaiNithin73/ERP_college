import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Mail, Phone, MapPin, Shield, Pencil, Save, X, Server } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AdminProfile() {
    const [isEditing, setIsEditing] = useState(false);

    // Mock Data init
    const [profileData, setProfileData] = useState({
        name: 'Root Administrator',
        email: 'sysadmin@university.edu',
        phone: '+91 90000 00000',
        address: 'Server Room 1, IT Building',
        department: 'Information Technology Services',
        role: 'Super Admin',
        joined: '2010',
        staffId: 'ADMIN-ROOT',
        accessLevel: 'Tier 1 (Unrestricted)'
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
            <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">System Admin Profile</h2>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <motion.div variants={fadeInUp} className="lg:col-span-1">
                    <Card className="bg-white dark:bg-[#09090b]/80 border border-zinc-200 dark:border-white/[0.05] shadow-md overflow-hidden text-center pb-6 h-full backdrop-blur-2xl">
                        <div className="h-24 bg-gradient-to-r from-red-600 to-red-900"></div>
                        <div className="relative -mt-12 flex justify-center">
                            <Avatar className="w-24 h-24 border-4 border-white dark:border-[#09090b] shadow-sm">
                                <AvatarFallback className="bg-zinc-100 text-2xl font-bold text-red-700">{initials}</AvatarFallback>
                            </Avatar>
                        </div>
                        <h3 className="mt-4 text-xl font-bold text-zinc-900 dark:text-zinc-50">{profileData.name}</h3>
                        <p className="text-sm text-red-600 dark:text-red-500 font-medium">{profileData.role}</p>
                        <Badge variant="outline" className="mt-2 border-red-200 text-red-700 bg-red-50 dark:bg-red-500/10 dark:border-red-500/30">
                            {profileData.accessLevel}
                        </Badge>

                        <div className="mt-6 px-6 grid grid-cols-2 gap-4 text-left border-t border-zinc-100 dark:border-white/[0.05] pt-6 flex-1 items-end">
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">User ID</p>
                                <p className="font-mono text-sm mt-1 font-medium">{profileData.staffId}</p>
                            </div>
                            <div>
                                <p className="text-xs text-muted-foreground uppercase tracking-wider font-semibold">Joined</p>
                                <p className="text-sm mt-1 font-medium">{profileData.joined}</p>
                            </div>
                        </div>
                    </Card>
                </motion.div>

                <motion.div variants={fadeInUp} className="lg:col-span-2 space-y-6">
                    <Card className="bg-white dark:bg-[#09090b]/80 border border-zinc-200 dark:border-white/[0.05] shadow-sm backdrop-blur-2xl">
                        <CardHeader className="pb-3 border-b border-border flex flex-row items-center justify-between">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <User className="w-5 h-5 text-red-500" />
                                Contact Information
                            </CardTitle>
                            {!isEditing ? (
                                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)} className="text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10">
                                    <Pencil className="w-4 h-4 mr-2" /> Edit
                                </Button>
                            ) : (
                                <div className="flex gap-2">
                                    <Button variant="outline" size="sm" onClick={handleCancel}>
                                        <X className="w-4 h-4 mr-1" /> Cancel
                                    </Button>
                                    <Button size="sm" onClick={handleSave} className="bg-red-600 hover:bg-red-700 text-white">
                                        <Save className="w-4 h-4 mr-1" /> Save
                                    </Button>
                                </div>
                            )}
                        </CardHeader>
                        <CardContent className="pt-6">
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                                        <Mail className="w-3.5 h-3.5" /> Emergency Email
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={editData.email}
                                            onChange={(e) => setEditData({ ...editData, email: e.target.value })}
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                                        />
                                    ) : (
                                        <div className="font-medium text-sm p-2 bg-zinc-50 dark:bg-white/[0.02] rounded-md border border-transparent">
                                            {profileData.email}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                                        <Phone className="w-3.5 h-3.5" /> Secure Line
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={editData.phone}
                                            onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                                        />
                                    ) : (
                                        <div className="font-medium text-sm p-2 bg-zinc-50 dark:bg-white/[0.02] rounded-md border border-transparent">
                                            {profileData.phone}
                                        </div>
                                    )}
                                </div>
                                <div className="space-y-2 sm:col-span-2">
                                    <label className="text-sm text-muted-foreground flex items-center gap-2 font-medium">
                                        <MapPin className="w-3.5 h-3.5" /> Server Access Terminal Location
                                    </label>
                                    {isEditing ? (
                                        <Input
                                            value={editData.address}
                                            onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                                            className="bg-zinc-50 dark:bg-zinc-900 border-zinc-300 dark:border-zinc-700"
                                        />
                                    ) : (
                                        <div className="font-medium text-sm p-2 bg-zinc-50 dark:bg-white/[0.02] rounded-md border border-transparent">
                                            {profileData.address}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="bg-white dark:bg-[#09090b]/80 border border-zinc-200 dark:border-white/[0.05] shadow-sm pb-2 backdrop-blur-2xl">
                        <CardHeader className="pb-3 border-b border-border">
                            <CardTitle className="text-lg font-medium flex items-center gap-2">
                                <Shield className="w-5 h-5 text-red-500" />
                                Institutional Security Role
                            </CardTitle>
                            <CardDescription className="dark:text-zinc-400">Security classifications are hardcoded into the instance network.</CardDescription>
                        </CardHeader>
                        <CardContent className="pt-6 grid grid-cols-1 sm:grid-cols-2 gap-6">
                            <div className="space-y-1 text-sm bg-zinc-50 dark:bg-white/[0.02] p-3 rounded-lg border border-zinc-100 dark:border-white/[0.05]">
                                <label className="text-muted-foreground font-medium text-xs uppercase tracking-wider flex justify-between">
                                    <span>Classification</span>
                                    <Server className="w-3.5 h-3.5 text-zinc-400" />
                                </label>
                                <div className="font-medium mt-1">{profileData.role}</div>
                            </div>
                            <div className="space-y-1 text-sm bg-zinc-50 dark:bg-white/[0.02] p-3 rounded-lg border border-zinc-100 dark:border-white/[0.05]">
                                <label className="text-muted-foreground font-medium text-xs uppercase tracking-wider">Division</label>
                                <div className="font-medium mt-1">{profileData.department}</div>
                            </div>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </motion.div>
    );
}
