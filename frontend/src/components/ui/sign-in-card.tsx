import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'sonner';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mail, Lock, Eye, EyeClosed, ArrowRight, User,
    GraduationCap, Users, Building2, ShieldCheck,
    KeyRound, ArrowLeft, Loader2
} from 'lucide-react';
import { cn } from "@/lib/utils";
import {
    InputOTP,
    InputOTPGroup,
    InputOTPSlot,
} from "@/components/ui/input-otp";

// --- Inline Input (adapted from shadcn) ---
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

// --- Types ---
type Role = 'student' | 'staff' | 'management' | 'admin';
type AuthMode = 'signin' | 'signup';

const ROLE_CONFIG: Record<Role, { label: string; icon: React.ElementType; gradient: string; glow: string }> = {
    student: { label: "Student", icon: GraduationCap, gradient: "from-sky-500 to-sky-700", glow: "rgba(14,165,233,0.4)" },
    staff: { label: "Staff", icon: Users, gradient: "from-cyan-500 to-cyan-700", glow: "rgba(6,182,212,0.4)" },
    management: { label: "Management", icon: Building2, gradient: "from-indigo-500 to-indigo-700", glow: "rgba(99,102,241,0.4)" },
    admin: { label: "Admin", icon: ShieldCheck, gradient: "from-blue-600 to-blue-800", glow: "rgba(37,99,235,0.4)" },
};

// --- Main Component ---
export function SignInCard() {
    const [showPassword, setShowPassword] = useState(false);
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [focusedInput, setFocusedInput] = useState<string | null>(null);
    const [role, setRole] = useState<Role>('student');
    const [authMode, setAuthMode] = useState<AuthMode>('signin');
    const [step, setStep] = useState<'form' | 'mfa' | 'forgot-email' | 'reset-password'>('form');
    const [errorDesc, setErrorDesc] = useState<string | null>(null);
    const [userId, setUserId] = useState<number | null>(null);
    const [mfaCode, setMfaCode] = useState('');

    const navigate = useNavigate();
    const active = ROLE_CONFIG[role];


    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setErrorDesc(null);

        const endpoint = authMode === 'signup' ? 'http://localhost:5000/signup' : 'http://localhost:5000/login';
        const payload = authMode === 'signup'
            ? { name: fullName, email, password, role }
            : { email, password, role };

        try {
            const res = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (res.ok) {
                setUserId(data.userId);

                // Show MFA code as a browser notification
                const showMfaNotification = (code: string) => {
                    if ('Notification' in window && Notification.permission === 'granted') {
                        new Notification('🔐 ERP Core - Verification Code', {
                            body: `Your 6-digit MFA code is: ${code}`,
                            icon: '🔑',
                            tag: 'mfa-code',
                        });
                    }
                    // Always show as toast too
                    toast.info(`Your verification code: ${code}`, {
                        duration: 30000,
                        description: 'Enter this code below to verify your identity.',
                    });
                };

                // Request notification permission and then show the code
                if ('Notification' in window && Notification.permission === 'default') {
                    Notification.requestPermission().then(() => {
                        if (data.mfaCode) showMfaNotification(data.mfaCode);
                    });
                } else if (data.mfaCode) {
                    showMfaNotification(data.mfaCode);
                }

                if (authMode === 'signup') {
                    toast.success("Account created! Please verify MFA.");
                } else {
                    toast.success("Credentials verified. Enter your MFA code.");
                }

                if (step === 'form') setStep('mfa');
            } else {
                toast.error(data.message || 'An error occurred. Please try again.');
                setErrorDesc(data.message || 'An error occurred. Please try again.');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to connect to the server.');
            setErrorDesc('Failed to connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleMfaVerify = async () => {
        if (!mfaCode || mfaCode.length !== 6 || !userId) {
            toast.error("Please enter a valid 6-digit code");
            return;
        }

        setIsLoading(true);
        setErrorDesc(null);

        try {
            const res = await fetch('http://localhost:5000/verify-mfa', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId, code: mfaCode })
            });

            const data = await res.json();

            if (res.ok) {
                // Success!
                toast.success(`${authMode === 'signin' ? 'Login' : 'Signup'} is Successful!`, {
                    description: `Welcome back, ${data.role || role}.`
                });

                // Save to local storage for the dashboard
                localStorage.setItem('userRole', data.role || role);
                localStorage.setItem('userId', String(userId));

                // Redirect to dashboard
                navigate('/dashboard');
            } else {
                toast.error(data.message || 'Invalid MFA Code');
                setErrorDesc(data.message || 'Invalid MFA Code');
            }
        } catch (err) {
            console.error(err);
            toast.error('Failed to connect to the server.');
            setErrorDesc('Failed to connect to the server.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen w-full bg-slate-950 relative overflow-hidden flex items-center justify-center">
            {/* Background gradients */}
            <div className="absolute inset-0 bg-gradient-to-b from-blue-900/40 via-indigo-900/50 to-slate-950" />

            {/* Noise texture */}
            <div className="absolute inset-0 opacity-[0.03] mix-blend-soft-light"
                style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
                    backgroundSize: '200px 200px'
                }}
            />

            {/* Top radial glow */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[120vh] h-[60vh] rounded-b-[50%] bg-blue-600/20 blur-[80px]" />
            <motion.div
                className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[100vh] h-[60vh] rounded-b-full bg-cyan-500/20 blur-[60px]"
                animate={{ opacity: [0.15, 0.3, 0.15], scale: [0.98, 1.02, 0.98] }}
                transition={{ duration: 8, repeat: Infinity, repeatType: "mirror" }}
            />
            <motion.div
                className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-[90vh] h-[90vh] rounded-t-full bg-indigo-600/20 blur-[60px]"
                animate={{ opacity: [0.3, 0.5, 0.3], scale: [1, 1.1, 1] }}
                transition={{ duration: 6, repeat: Infinity, repeatType: "mirror", delay: 1 }}
            />

            {/* Animated glow spots */}
            <div className="absolute left-1/4 top-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse opacity-40" />
            <div className="absolute right-1/4 bottom-1/4 w-96 h-96 bg-white/5 rounded-full blur-[100px] animate-pulse delay-1000 opacity-40" />

            {/* Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8 }}
                className="w-full max-w-md relative z-10 px-4"
            >
                <div className="relative group">
                    {/* Card glow */}
                    <motion.div
                        className="absolute -inset-[1px] rounded-2xl opacity-0 group-hover:opacity-70 transition-opacity duration-700"
                        animate={{
                            boxShadow: [
                                `0 0 10px 2px ${active.glow}`,
                                `0 0 20px 5px ${active.glow}`,
                                `0 0 10px 2px ${active.glow}`
                            ],
                            opacity: [0.2, 0.4, 0.2]
                        }}
                        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut", repeatType: "mirror" }}
                    />

                    {/* Traveling light beams */}
                    <div className="absolute -inset-[1px] rounded-2xl overflow-hidden">
                        <motion.div
                            className="absolute top-0 left-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                            initial={{ filter: "blur(2px)" }}
                            animate={{ left: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }}
                            transition={{ left: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror" }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror" } }}
                        />
                        <motion.div
                            className="absolute top-0 right-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                            initial={{ filter: "blur(2px)" }}
                            animate={{ top: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }}
                            transition={{ top: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 0.6 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 0.6 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 0.6 } }}
                        />
                        <motion.div
                            className="absolute bottom-0 right-0 h-[3px] w-[50%] bg-gradient-to-r from-transparent via-white to-transparent opacity-70"
                            initial={{ filter: "blur(2px)" }}
                            animate={{ right: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }}
                            transition={{ right: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.2 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.2 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.2 } }}
                        />
                        <motion.div
                            className="absolute bottom-0 left-0 h-[50%] w-[3px] bg-gradient-to-b from-transparent via-white to-transparent opacity-70"
                            initial={{ filter: "blur(2px)" }}
                            animate={{ bottom: ["-50%", "100%"], opacity: [0.3, 0.7, 0.3], filter: ["blur(1px)", "blur(2.5px)", "blur(1px)"] }}
                            transition={{ bottom: { duration: 2.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1, delay: 1.8 }, opacity: { duration: 1.2, repeat: Infinity, repeatType: "mirror", delay: 1.8 }, filter: { duration: 1.5, repeat: Infinity, repeatType: "mirror", delay: 1.8 } }}
                        />

                        {/* Corner glow dots */}
                        {[
                            { pos: "top-0 left-0", size: "h-[5px] w-[5px]", opacity: "white/40", blur: "blur-[1px]", delay: 0 },
                            { pos: "top-0 right-0", size: "h-[8px] w-[8px]", opacity: "white/60", blur: "blur-[2px]", delay: 0.5 },
                            { pos: "bottom-0 right-0", size: "h-[8px] w-[8px]", opacity: "white/60", blur: "blur-[2px]", delay: 1 },
                            { pos: "bottom-0 left-0", size: "h-[5px] w-[5px]", opacity: "white/40", blur: "blur-[1px]", delay: 1.5 },
                        ].map((corner, i) => (
                            <motion.div
                                key={i}
                                className={`absolute ${corner.pos} ${corner.size} rounded-full bg-${corner.opacity} ${corner.blur}`}
                                animate={{ opacity: [0.2, 0.4, 0.2] }}
                                transition={{ duration: 2 + i * 0.1, repeat: Infinity, repeatType: "mirror", delay: corner.delay }}
                            />
                        ))}
                    </div>

                    {/* Card border glow */}
                    <div className="absolute -inset-[0.5px] rounded-2xl bg-gradient-to-r from-white/[0.03] via-white/[0.07] to-white/[0.03] opacity-0 group-hover:opacity-70 transition-opacity duration-500" />

                    {/* === Card Body (solid surface — Rule F14) === */}
                    <div className="relative bg-slate-900 rounded-2xl p-6 border border-white/10 shadow-lg overflow-hidden">
                        {/* Inner pattern */}
                        <div className="absolute inset-0 opacity-[0.03]"
                            style={{
                                backgroundImage: `linear-gradient(135deg, white 0.5px, transparent 0.5px), linear-gradient(45deg, white 0.5px, transparent 0.5px)`,
                                backgroundSize: '30px 30px'
                            }}
                        />

                        {/* Logo + Header */}
                        <div className="text-center space-y-1 mb-5">
                            <motion.div
                                initial={{ scale: 0.5, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: "spring", duration: 0.8 }}
                                className={cn(
                                    "mx-auto w-12 h-12 rounded-full border border-white/10 flex items-center justify-center relative overflow-hidden",
                                    `bg-gradient-to-br ${active.gradient}`
                                )}
                            >
                                <active.icon className="w-6 h-6 text-white" />
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent opacity-50" />
                            </motion.div>

                            <motion.h1
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/80"
                            >
                                {step === 'form'
                                    ? (authMode === 'signin' ? 'Welcome Back' : 'Create Account')
                                    : step === 'mfa'
                                        ? 'Identity Check'
                                        : step === 'forgot-email'
                                            ? 'Reset Password'
                                            : 'Set New Password'}
                            </motion.h1>

                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                                className="text-white/60 text-xs"
                            >
                                {step === 'form'
                                    ? (authMode === 'signin'
                                        ? `Sign in as ${active.label} to ERP Core`
                                        : `Register as ${active.label} on ERP Core`)
                                    : step === 'mfa'
                                        ? 'Verify your session with a 6-digit MFA token'
                                        : step === 'forgot-email'
                                            ? `Enter your ${active.label} email to receive a reset code`
                                            : 'Enter the code and your new password'}
                            </motion.p>
                        </div>

                        {/* === Role Tabs === */}
                        {(step === 'form' || step === 'forgot-email') && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.35 }}
                                className="relative flex p-1 bg-white/[0.05] rounded-xl mb-5 border border-white/10 overflow-x-auto"
                            >
                                {(Object.keys(ROLE_CONFIG) as Role[]).map((r) => {
                                    const config = ROLE_CONFIG[r];
                                    const RoleIcon = config.icon;
                                    return (
                                        <button
                                            key={r}
                                            type="button"
                                            onClick={() => setRole(r)}
                                            className={cn(
                                                "relative flex-1 min-h-[44px] py-2.5 flex flex-col items-center gap-1 text-[9px] font-bold rounded-lg transition-colors duration-300 uppercase tracking-wider z-10",
                                                role === r
                                                    ? "text-white"
                                                    : "text-white/40 hover:text-white/60"
                                            )}
                                        >
                                            {role === r && (
                                                <motion.div
                                                    layoutId="role-pill"
                                                    className={cn("absolute inset-0 rounded-lg shadow-lg bg-gradient-to-r", config.gradient)}
                                                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                                                />
                                            )}
                                            <RoleIcon className="w-3.5 h-3.5 relative z-10" />
                                            <span className="relative z-10">{r}</span>
                                        </button>
                                    );
                                })}
                            </motion.div>
                        )}

                        <AnimatePresence mode="wait">
                            {step === 'form' && (
                                /* === Login / Signup Form === */
                                <motion.form
                                    key={authMode}
                                    initial={{ opacity: 0, x: authMode === 'signup' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: authMode === 'signup' ? -20 : 20 }}
                                    transition={{ duration: 0.3 }}
                                    onSubmit={handleSubmit}
                                    className="space-y-4"
                                >
                                    <div className="space-y-3">
                                        {/* Full Name (signup only) */}
                                        {authMode === 'signup' && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: 'auto' }}
                                                exit={{ opacity: 0, height: 0 }}
                                                className={`relative ${focusedInput === "name" ? 'z-10' : ''}`}
                                            >
                                                <div className="relative flex items-center overflow-hidden rounded-lg">
                                                    <User className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "name" ? 'text-white' : 'text-white/40'}`} />
                                                    <Input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        value={fullName}
                                                        onChange={(e) => setFullName(e.target.value)}
                                                        onFocus={() => setFocusedInput("name")}
                                                        onBlur={() => setFocusedInput(null)}
                                                        className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                                    />
                                                    {focusedInput === "name" && (
                                                        <motion.div layoutId="input-highlight" className="absolute inset-0 bg-white/5 -z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
                                                    )}
                                                </div>
                                            </motion.div>
                                        )}

                                        {/* Email */}
                                        <motion.div
                                            className={`relative ${focusedInput === "email" ? 'z-10' : ''}`}
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        >
                                            <div className="relative flex items-center overflow-hidden rounded-lg">
                                                <Mail className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "email" ? 'text-white' : 'text-white/40'}`} />
                                                <Input
                                                    type="email"
                                                    placeholder="Email Address"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    onFocus={() => setFocusedInput("email")}
                                                    onBlur={() => setFocusedInput(null)}
                                                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-3 focus:bg-white/10"
                                                />
                                                {focusedInput === "email" && (
                                                    <motion.div layoutId="input-highlight" className="absolute inset-0 bg-white/5 -z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
                                                )}
                                            </div>
                                        </motion.div>

                                        {/* Password */}
                                        <motion.div
                                            className={`relative ${focusedInput === "password" ? 'z-10' : ''}`}
                                            whileHover={{ scale: 1.01 }}
                                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                        >
                                            <div className="relative flex items-center overflow-hidden rounded-lg">
                                                <Lock className={`absolute left-3 w-4 h-4 transition-all duration-300 ${focusedInput === "password" ? 'text-white' : 'text-white/40'}`} />
                                                <Input
                                                    type={showPassword ? "text" : "password"}
                                                    placeholder="Password"
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onFocus={() => setFocusedInput("password")}
                                                    onBlur={() => setFocusedInput(null)}
                                                    className="w-full bg-white/5 border-transparent focus:border-white/20 text-white placeholder:text-white/30 h-10 transition-all duration-300 pl-10 pr-10 focus:bg-white/10"
                                                />
                                                <div onClick={() => setShowPassword(!showPassword)} className="absolute right-3 cursor-pointer">
                                                    {showPassword
                                                        ? <Eye className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                                                        : <EyeClosed className="w-4 h-4 text-white/40 hover:text-white transition-colors duration-300" />
                                                    }
                                                </div>
                                                {focusedInput === "password" && (
                                                    <motion.div layoutId="input-highlight" className="absolute inset-0 bg-white/5 -z-10" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} />
                                                )}
                                            </div>
                                        </motion.div>
                                    </div>

                                    {errorDesc && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-red-400 text-xs text-center font-medium bg-red-500/10 py-2 rounded-lg border border-red-500/20 mt-2"
                                        >
                                            {errorDesc}
                                        </motion.div>
                                    )}

                                    {/* Forgot password (sign in only) */}
                                    {authMode === 'signin' && (
                                        <div className="flex justify-end pt-1 relative z-20">
                                            <Link
                                                to="/forgot-password"
                                                className="text-xs text-white/60 hover:text-white cursor-pointer transition-colors duration-200 block py-1"
                                            >
                                                Forgot password?
                                            </Link>
                                        </div>
                                    )}

                                    {/* Submit button */}
                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        type="submit"
                                        disabled={isLoading}
                                        className="w-full relative group/button mt-3"
                                    >
                                        <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                                        <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                                            <motion.div
                                                className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 -z-10"
                                                animate={{ x: ['-100%', '100%'] }}
                                                transition={{ duration: 1.5, ease: "easeInOut", repeat: Infinity, repeatDelay: 1 }}
                                                style={{ opacity: isLoading ? 1 : 0, transition: 'opacity 0.3s ease' }}
                                            />
                                            <AnimatePresence mode="wait">
                                                {isLoading ? (
                                                    <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center">
                                                        <div className="w-4 h-4 border-2 border-black/70 border-t-transparent rounded-full animate-spin" />
                                                    </motion.div>
                                                ) : (
                                                    <motion.span key="btn-text" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex items-center justify-center gap-1 text-sm font-medium">
                                                        {authMode === 'signin' ? 'Continue' : 'Sign Up'}
                                                        <ArrowRight className="w-3 h-3 group-hover/button:translate-x-1 transition-transform duration-300" />
                                                    </motion.span>
                                                )}
                                            </AnimatePresence>
                                        </div>
                                    </motion.button>

                                    {/* Divider */}
                                    <div className="relative mt-2 mb-3 flex items-center">
                                        <div className="flex-grow border-t border-white/5"></div>
                                        <motion.span
                                            className="mx-3 text-xs text-white/40"
                                            initial={{ opacity: 0.7 }}
                                            animate={{ opacity: [0.7, 0.9, 0.7] }}
                                            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                                        >
                                            or
                                        </motion.span>
                                        <div className="flex-grow border-t border-white/5"></div>
                                    </div>

                                    {/* Toggle auth mode */}
                                    <motion.p
                                        className="text-center text-xs text-white/60"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.5 }}
                                    >
                                        {authMode === 'signin' ? "Don't have an account? " : "Already have an account? "}
                                        <button
                                            type="button"
                                            onClick={() => setAuthMode(prev => prev === 'signin' ? 'signup' : 'signin')}
                                            className="relative inline-block group/toggle"
                                        >
                                            <span className="relative z-10 text-white group-hover/toggle:text-white/70 transition-colors duration-300 font-medium">
                                                {authMode === 'signin' ? 'Sign Up' : 'Sign In'}
                                            </span>
                                            <span className="absolute bottom-0 left-0 w-0 h-[1px] bg-white group-hover/toggle:w-full transition-all duration-300" />
                                        </button>
                                    </motion.p>
                                </motion.form>
                            )}

                            {step === 'mfa' && (
                                /* === MFA Step === */
                                <motion.div
                                    key="mfa"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.4 }}
                                    className="space-y-6 text-center"
                                >
                                    <KeyRound size={48} className="mx-auto text-white/30" />

                                    <div className="flex justify-center">
                                        <InputOTP maxLength={6} value={mfaCode} onChange={setMfaCode}>
                                            <InputOTPGroup className="gap-2">
                                                {[...Array(6)].map((_, i) => (
                                                    <InputOTPSlot
                                                        key={i}
                                                        index={i}
                                                        className="w-11 h-14 text-xl font-bold rounded-xl border border-white/10 bg-white/5 text-white focus:border-white/30"
                                                    />
                                                ))}
                                            </InputOTPGroup>
                                        </InputOTP>
                                    </div>

                                    <motion.button
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={handleMfaVerify}
                                        disabled={isLoading}
                                        className="w-full relative group/button"
                                    >
                                        <div className="absolute inset-0 bg-white/10 rounded-lg blur-lg opacity-0 group-hover/button:opacity-70 transition-opacity duration-300" />
                                        <div className="relative overflow-hidden bg-white text-black font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center">
                                            {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Verify Identity"}
                                        </div>
                                    </motion.button>

                                    <motion.button
                                        type="button"
                                        whileHover={{ scale: 1.02 }}
                                        whileTap={{ scale: 0.98 }}
                                        onClick={(e) => {
                                            e.preventDefault();
                                            e.stopPropagation();
                                            setStep('form');
                                            setMfaCode('');
                                            setErrorDesc(null);
                                            setIsLoading(false);
                                        }}
                                        className="w-full relative group/back"
                                    >
                                        <div className="relative overflow-hidden bg-white/5 hover:bg-white/10 text-white/70 hover:text-white font-medium h-10 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 border border-white/10 hover:border-white/20">
                                            <ArrowLeft size={16} /> Back to Login
                                        </div>
                                    </motion.button>
                                </motion.div>
                            )}


                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}

export default SignInCard;
