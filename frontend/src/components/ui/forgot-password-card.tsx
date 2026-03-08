import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, Eye, EyeClosed, ArrowLeft, ArrowRight,
    GraduationCap, Users, Building2, ShieldCheck,
    Loader2, RotateCcw, KeyRound
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
    return (
        <input
            type={type}
            data-slot="input"
            className={cn(
                "file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
                "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
                "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
                className
            )}
            {...props}
        />
    );
}

type Role = 'student' | 'staff' | 'management' | 'admin';

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ElementType; gradient: string; glow: string }> = {
    student: { label: "Student", icon: GraduationCap, gradient: "from-sky-500 to-sky-700", glow: "rgba(14,165,233,0.4)" },
    staff: { label: "Staff", icon: Users, gradient: "from-cyan-500 to-cyan-700", glow: "rgba(6,182,212,0.4)" },
    management: { label: "Management", icon: Building2, gradient: "from-indigo-500 to-indigo-700", glow: "rgba(99,102,241,0.4)" },
    admin: { label: "Admin", icon: ShieldCheck, gradient: "from-blue-600 to-blue-800", glow: "rgba(37,99,235,0.4)" },
};

export function ForgotPasswordCard() {
    const [step, setStep] = useState<'email' | 'reset'>('email');
    const [role, setRole] = useState<Role>('student');
    const [email, setEmail] = useState('');
    const [resetOtp, setResetOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [errorDesc, setErrorDesc] = useState<string | null>(null);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const navigate = useNavigate();

    const config = ROLE_CONFIG[role];

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorDesc(null);

        if (!email) {
            setErrorDesc('Please enter your email address');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/forgot-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, role }),
            });
            const data = await res.json();

            if (data.success) {
                setUserId(data.userId);

                // Show OTP via toast (same as MFA flow)
                toast.success('Verification code sent!', {
                    description: `Your code is: ${data.mfaCode}`,
                    duration: 30000,
                });

                // Also try browser notification
                if (Notification.permission === 'granted') {
                    new Notification('Password Reset Code', {
                        body: `Your verification code is: ${data.mfaCode}`,
                        icon: '/favicon.ico'
                    });
                } else if (Notification.permission !== 'denied') {
                    Notification.requestPermission().then(perm => {
                        if (perm === 'granted') {
                            new Notification('Password Reset Code', {
                                body: `Your verification code is: ${data.mfaCode}`,
                                icon: '/favicon.ico'
                            });
                        }
                    });
                }

                setStep('reset');
            } else {
                setErrorDesc(data.message || 'Failed to send verification code');
            }
        } catch {
            setErrorDesc('Network error. Please check if the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorDesc(null);

        if (!resetOtp || resetOtp.length < 6) {
            setErrorDesc('Please enter the 6-digit verification code');
            return;
        }
        if (!newPassword) {
            setErrorDesc('Please enter a new password');
            return;
        }
        if (newPassword.length < 6) {
            setErrorDesc('Password must be at least 6 characters');
            return;
        }
        if (newPassword !== confirmPassword) {
            setErrorDesc('Passwords do not match');
            return;
        }

        setIsLoading(true);
        try {
            const res = await fetch('http://localhost:5000/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: resetOtp, newPassword }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success('Password Reset Successful!', {
                    description: 'You can now sign in with your new password.',
                    duration: 5000,
                });
                navigate('/');
            } else {
                setErrorDesc(data.message || 'Failed to reset password');
            }
        } catch {
            setErrorDesc('Network error. Please check if the server is running.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
            {/* Background — same as sign-in */}
            <div className="fixed inset-0 -z-10">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-black" />
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse" />
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/3 rounded-full blur-3xl" />
            </div>

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="w-full max-w-md mx-4"
            >
                <motion.div
                    className="relative backdrop-blur-2xl bg-white/[0.03] rounded-2xl border border-white/[0.08] shadow-2xl overflow-hidden"
                    style={{
                        boxShadow: `0 0 40px ${config.glow}, 0 25px 60px -12px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255,255,255,0.05)`
                    }}
                >
                    {/* Top gradient bar */}
                    <div className={`h-1 bg-gradient-to-r ${config.gradient}`} />

                    <div className="p-8 pt-6">
                        {/* Header */}
                        <div className="text-center mb-6">
                            <motion.div
                                className="w-16 h-16 mx-auto rounded-full bg-gradient-to-br from-amber-500/20 to-orange-600/20 border border-amber-500/20 flex items-center justify-center mb-4"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                            >
                                <KeyRound className="w-8 h-8 text-amber-400/70" />
                            </motion.div>
                            <h2 className="text-xl font-bold text-white mb-1">Reset Password</h2>
                            <p className="text-sm text-white/50">
                                {step === 'email'
                                    ? `Enter your ${role} email to receive a reset code`
                                    : 'Enter the code and your new password'
                                }
                            </p>
                        </div>

                        {/* Role Tabs */}
                        <div className="mb-6">
                            <div className="relative flex bg-white/[0.03] rounded-lg p-1 border border-white/[0.06]">
                                {(Object.keys(ROLE_CONFIG) as Role[]).map(r => {
                                    const RoleIcon = ROLE_CONFIG[r].icon;
                                    return (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={cn(
                                                "relative flex-1 py-2.5 flex flex-col items-center gap-1 text-[9px] font-bold rounded-lg transition-colors duration-300 uppercase tracking-wider z-10",
                                                role === r ? "text-white" : "text-white/40 hover:text-white/60"
                                            )}
                                        >
                                            {role === r && (
                                                <motion.div
                                                    layoutId="forgot-role-pill"
                                                    className={cn("absolute inset-0 rounded-lg shadow-lg bg-gradient-to-r", ROLE_CONFIG[r].gradient)}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                />
                                            )}
                                            <RoleIcon className="w-3.5 h-3.5 relative z-10" />
                                            <span className="relative z-10">{r}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step Content */}
                        <AnimatePresence mode="wait">
                            {step === 'email' ? (
                                <motion.form
                                    key="email-step"
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleSendCode}
                                    className="space-y-4"
                                >
                                    {/* Email Input */}
                                    <motion.div
                                        className={`relative ${focusedInput === 'email' ? 'z-10' : ''}`}
                                        whileHover={{ scale: 1.01 }}
                                        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                    >
                                        <div className="relative flex items-center overflow-hidden rounded-lg">
                                            <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === 'email' ? 'text-white' : 'text-white/40'}`} />
                                            <Input
                                                type="email"
                                                placeholder="Enter your registered email"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                onFocus={() => setFocusedInput('email')}
                                                onBlur={() => setFocusedInput(null)}
                                                className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                            />
                                        </div>
                                    </motion.div>

                                    {errorDesc && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                                        >
                                            {errorDesc}
                                        </motion.div>
                                    )}

                                    {/* Send Code Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full relative group/button"
                                    >
                                        <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                                        <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-1 text-sm font-medium">
                                                    Send Verification Code
                                                    <ArrowRight className="w-3 h-3" />
                                                </span>
                                            )}
                                        </div>
                                    </motion.button>

                                    {/* Back to Sign In */}
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => navigate('/')}
                                        className="w-full relative group/back"
                                    >
                                        <div className="relative overflow-hidden bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 hover:border-white/20">
                                            <ArrowLeft size={16} /> Back to Sign In
                                        </div>
                                    </motion.button>
                                </motion.form>
                            ) : (
                                <motion.form
                                    key="reset-step"
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleResetPassword}
                                    className="space-y-4"
                                >
                                    {/* OTP Input */}
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 font-medium pl-1">Verification Code</label>
                                        <div className="flex justify-center">
                                            <InputOTP maxLength={6} value={resetOtp} onChange={setResetOtp}>
                                                <InputOTPGroup className="gap-2">
                                                    {[...Array(6)].map((_, i) => (
                                                        <InputOTPSlot
                                                            key={i}
                                                            index={i}
                                                            className="w-10 h-12 text-lg font-bold rounded-xl border border-white/10 bg-white/5 text-white focus:border-white/30"
                                                        />
                                                    ))}
                                                </InputOTPGroup>
                                            </InputOTP>
                                        </div>
                                    </div>

                                    {/* New Password */}
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 font-medium pl-1">New Password</label>
                                        <motion.div
                                            className={`relative ${focusedInput === 'new-password' ? 'z-10' : ''}`}
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        >
                                            <div className="relative flex items-center overflow-hidden rounded-lg">
                                                <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === 'new-password' ? 'text-white' : 'text-white/40'}`} />
                                                <Input
                                                    type={showNewPassword ? 'text' : 'password'}
                                                    placeholder="Enter new password"
                                                    value={newPassword}
                                                    onChange={(e) => setNewPassword(e.target.value)}
                                                    onFocus={() => setFocusedInput('new-password')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                                                />
                                                <div onClick={() => setShowNewPassword(!showNewPassword)} className="absolute right-3 cursor-pointer">
                                                    {showNewPassword
                                                        ? <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                                                        : <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                                                    }
                                                </div>
                                            </div>
                                        </motion.div>
                                    </div>

                                    {/* Confirm Password */}
                                    <div className="space-y-2">
                                        <label className="text-xs text-white/50 font-medium pl-1">Confirm Password</label>
                                        <motion.div
                                            className={`relative ${focusedInput === 'confirm-password' ? 'z-10' : ''}`}
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                                        >
                                            <div className="relative flex items-center overflow-hidden rounded-lg">
                                                <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === 'confirm-password' ? 'text-white' : 'text-white/40'}`} />
                                                <Input
                                                    type="password"
                                                    placeholder="Confirm new password"
                                                    value={confirmPassword}
                                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                                    onFocus={() => setFocusedInput('confirm-password')}
                                                    onBlur={() => setFocusedInput(null)}
                                                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                                />
                                            </div>
                                        </motion.div>
                                    </div>

                                    {errorDesc && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20"
                                        >
                                            {errorDesc}
                                        </motion.div>
                                    )}

                                    {/* Reset Password Button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full relative group/button"
                                    >
                                        <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                                        <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                                            {isLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : (
                                                <span className="flex items-center gap-1 text-sm font-medium">
                                                    Reset Password
                                                    <RotateCcw className="w-3 h-3" />
                                                </span>
                                            )}
                                        </div>
                                    </motion.button>

                                    {/* Back Button */}
                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={() => {
                                            setStep('email');
                                            setResetOtp('');
                                            setNewPassword('');
                                            setConfirmPassword('');
                                            setErrorDesc(null);
                                        }}
                                        className="w-full relative group/back"
                                    >
                                        <div className="relative overflow-hidden bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 hover:border-white/20">
                                            <ArrowLeft size={16} /> Back
                                        </div>
                                    </motion.button>
                                </motion.form>
                            )}
                        </AnimatePresence>
                    </div>
                </motion.div>
            </motion.div>
        </div>
    );
}

export default ForgotPasswordCard;
