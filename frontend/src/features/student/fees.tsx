import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { CreditCard, Download, Wallet, AlertCircle, CheckCircle2, Building, Smartphone, Landmark, IndianRupee } from 'lucide-react';
import { fadeInUp, staggerContainer } from '@/components/animations/transitions';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { CustomSelect } from '@/components/ui/selects';
import { z } from 'zod';
import type { PaymentRecord } from '@/types/components';
import { ChevronRight } from 'lucide-react';

const ChevronRotateVariant = {
    open: { rotate: 90 },
    closed: { rotate: 0 }
};

// Mock Data
const PENDING_FEES = [
    { id: 'FEE-2026-S5', type: 'Tuition Fee', amount: 45000, due: '2026-03-15', status: 'Pending' },
    { id: 'FEE-2026-EX', type: 'Exam Fee', amount: 3500, due: '2026-04-01', status: 'Pending' },
];

const FINES = [
    { id: 'FINE-LIB-01', reason: 'Late Library Book Return', amount: 150, date: '2026-02-28', status: 'Unpaid' },
];

// New Mock Data for History Tab
const HISTORY_DATA = [
    {
        semester: "Semester 5 (Current)",
        transactions: [
            { id: "RC-2023-8901", type: "Tuition Fee (Instalment 2)", total: 45000, paid: 45000, balance: 0, date: "15/10/2023", method: "Net Banking", status: "success" },
            { id: "RC-2023-8902", type: "Hostel Mess", total: 18000, paid: 10000, balance: 8000, date: "20/10/2023", method: "UPI", status: "success" }
        ]
    },
    {
        semester: "Semester 4",
        transactions: [
            { id: "RC-2023-4521", type: "Tuition Fee (Full)", total: 90000, paid: 90000, balance: 0, date: "10/01/2023", method: "Credit Card", status: "success" },
            { id: "RC-2023-4522", type: "Library Fine", total: 500, paid: 500, balance: 0, date: "15/03/2023", method: "UPI", status: "success" }
        ]
    },
    {
        semester: "Semester 3",
        transactions: [
            { id: "RC-2022-1105", type: "Tuition Fee (Instalment 1)", total: 45000, paid: 45000, balance: 45000, date: "12/08/2022", method: "Net Banking", status: "success" },
            { id: "RC-2022-1189", type: "Tuition Fee (Instalment 2)", total: 45000, paid: 45000, balance: 0, date: "10/11/2022", method: "Net Banking", status: "success" }
        ]
    }
];

export default function StudentFees() {
    const [selectedPayment, setSelectedPayment] = useState<any>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'upi' | 'netbanking'>('card');
    const [isProcessing, setIsProcessing] = useState(false);
    const [activeTab, setActiveTab] = useState('dues');

    // New State for Partial Payments
    const [paymentRecords, setPaymentRecords] = useState<Map<string, PaymentRecord>>(new Map());
    const [paymentStep, setPaymentStep] = useState<1 | 2 | 3>(1); // 1: Amount, 2: Method, 3: Success
    const [enteredAmount, setEnteredAmount] = useState<string>('');
    const [amountError, setAmountError] = useState<string>('');
    
    // History Tab State
    const [historySemesterFilter, setHistorySemesterFilter] = useState('all');
    const [historyStatusFilter, setHistoryStatusFilter] = useState('all');
    const [expandedSemesters, setExpandedSemesters] = useState<Record<string, boolean>>({
        "Semester 5 (Current)": true,
        "Semester 4": false,
        "Semester 3": false
    });

    const toggleSemester = (sem: string) => {
        setExpandedSemesters(prev => ({ ...prev, [sem]: !prev[sem] }));
    };

    // Zod Schema for Amount Validation
    const amountSchema = z.object({
        amount: z.number()
            .min(500, "Minimum payment is ₹500")
            .int("Please enter a whole number")
    });

    const handlePayClick = (item: any) => {
        setSelectedPayment(item);
        // Reset modal state
        setPaymentStep(1);
        setEnteredAmount(item.amount.toString());
        setAmountError('');
        setIsProcessing(false);
    };

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setEnteredAmount(val);

        if (!val) {
            setAmountError('');
            return;
        }

        const numVal = Number(val);
        if (isNaN(numVal)) {
            setAmountError("Must be a number");
            return;
        }

        if (numVal > selectedPayment.amount) {
            setAmountError(`Cannot exceed outstanding balance of ₹${selectedPayment.amount.toLocaleString('en-IN')}`);
            return;
        }

        try {
            amountSchema.parse({ amount: numVal });
            setAmountError('');
        } catch (error) {
            if (error instanceof z.ZodError) {
                setAmountError(error.issues[0].message);
            }
        }
    };

    const handleContinueToPayment = () => {
        const numVal = Number(enteredAmount);
        try {
            amountSchema.parse({ amount: numVal });
            if (numVal <= selectedPayment.amount) {
                setPaymentStep(2);
            }
        } catch (error) {
            // Should be caught by inline validation, but just in case
        }
    };

    const handleProcessPayment = () => {
        setIsProcessing(true);
        setTimeout(() => {
            setIsProcessing(false);
            setPaymentStep(3);
            
            const numAmount = Number(enteredAmount);
            const remaining = selectedPayment.amount - numAmount;
            
            toast.success(`Payment of ₹${numAmount.toLocaleString('en-IN')} successful!`);
            
            // Generate Mock Transaction ID
            const mockTxnId = `TXN${Math.floor(1000000000 + Math.random() * 9000000000)}`;
            const today = new Date().toLocaleDateString('en-GB'); // DD/MM/YYYY

            // Optimistic UI Update
            const newRecord: PaymentRecord = {
                feeId: selectedPayment.id,
                amountPaid: numAmount,
                remaining: remaining,
                transactionId: mockTxnId,
                date: today,
                method: paymentMethod === 'card' ? 'Debit/Credit Card' : paymentMethod === 'upi' ? 'UPI' : 'Net Banking',
                status: remaining === 0 ? 'processing' : 'partial'
            };

            setPaymentRecords(prev => {
                const newMap = new Map(prev);
                newMap.set(selectedPayment.id, newRecord);
                return newMap;
            });

            // Note: We don't close the modal automatically here anymore, 
            // user clicks "Done" on step 3.
        }, 2000); // simulate network request for payment
    };

    return (
        <motion.div variants={staggerContainer} initial="hidden" animate="visible" exit="exit" className="space-y-6 w-full max-w-full min-w-0">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Fees & Fines</h2>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full max-w-full">
                <TabsList className="bg-[hsl(var(--surface-raised))] mb-4 overflow-x-auto flex-nowrap w-full justify-start md:justify-center p-2 rounded-xl h-auto">
                    <TabsTrigger value="dues" className="rounded-lg data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900/40 text-sm py-2">
                        Pending Dues & Fines
                    </TabsTrigger>
                    <TabsTrigger value="receipts" className="rounded-lg data-[state=active]:bg-indigo-100 dark:data-[state=active]:bg-indigo-900/40 text-sm py-2">
                        Payment History & Receipts
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="dues" className="space-y-6 outline-none">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Pending Fees List */}
                        <motion.div variants={fadeInUp} initial="hidden" animate="visible" className="space-y-4">
                            <h3 className="text-lg font-semibold flex items-center gap-2">
                                <Wallet className="w-5 h-5 text-indigo-500" />
                                Outstanding Balance
                            </h3>

                            {PENDING_FEES.map((fee, i) => {
                                const record = paymentRecords.get(fee.id);
                                const isProcessing = record?.status === 'processing';
                                const remainingAmount = record ? record.remaining : fee.amount;
                                const isPartial = record?.status === 'partial';

                                return (
                                <Card key={i} className="bg-[hsl(var(--surface-raised))] border-l-4 border-l-amber-500">
                                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-900 dark:text-white">{fee.type}</p>
                                                {isProcessing ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-amber-500/10 text-amber-600 uppercase border border-amber-500/20">Processing</span>
                                                ) : isPartial ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-amber-500/10 text-amber-600 uppercase border border-amber-500/20">Partially Paid</span>
                                                ) : null}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">Due: {new Date(fee.due).toLocaleDateString()}</p>
                                            {isProcessing ? (
                                                <p className="text-xs text-amber-600 dark:text-amber-400 mt-2 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" /> Verification pending
                                                </p>
                                            ) : isPartial ? (
                                                <p className="text-xs text-indigo-600 dark:text-indigo-400 mt-2 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Partial payment of ₹{record.amountPaid.toLocaleString('en-IN')} recorded · {record.date}
                                                </p>
                                            ) : null}
                                        </div>
                                        <div className="flex flex-col sm:items-end gap-2">
                                            <span className="text-xl font-bold">₹{remainingAmount.toLocaleString('en-IN')}</span>
                                            <button
                                                onClick={() => handlePayClick(fee)}
                                                disabled={isProcessing}
                                                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isProcessing ? 'Processing...' : isPartial ? `Pay Rem. ₹${remainingAmount.toLocaleString('en-IN')}` : 'Pay Now'}
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                                );
                            })}

                            <h3 className="text-lg font-semibold flex items-center gap-2 mt-8">
                                <AlertCircle className="w-5 h-5 text-red-500" />
                                Active Fines
                            </h3>

                            {FINES.map((fine, i) => {
                                const record = paymentRecords.get(fine.id);
                                const isSettled = record?.status === 'processing';

                                return (
                                <Card key={i} className="bg-[hsl(var(--surface-raised))] border-l-4 border-l-red-500 overflow-hidden relative">
                                    {isSettled && <div className="absolute inset-0 bg-white/50 dark:bg-black/50 backdrop-blur-[1px] z-10 hidden" aria-hidden="true" />}
                                    <CardContent className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                        <div className="relative z-20">
                                            <div className="flex items-center gap-2">
                                                <p className={`font-semibold ${isSettled ? 'text-slate-400 dark:text-slate-500 line-through' : 'text-slate-900 dark:text-white'}`}>{fine.reason}</p>
                                                {isSettled ? (
                                                    <span className="px-2 py-0.5 text-[10px] font-bold tracking-wider rounded-md bg-emerald-500/10 text-emerald-600 uppercase border border-emerald-500/20">Settled</span>
                                                ) : null}
                                            </div>
                                            <p className="text-sm text-muted-foreground mt-1">Issued: {new Date(fine.date).toLocaleDateString()}</p>
                                            {isSettled && (
                                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-2 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" /> Paid on {record.date}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex flex-col sm:items-end gap-2 relative z-20">
                                            <span className={`text-xl font-bold ${isSettled ? 'text-slate-400 dark:text-slate-500' : 'text-red-600 dark:text-red-400'}`}>
                                                {isSettled ? '₹0' : `₹${fine.amount.toLocaleString('en-IN')}`}
                                            </span>
                                            <button
                                                onClick={() => handlePayClick(fine)}
                                                disabled={isSettled}
                                                className="px-4 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-md text-sm font-medium transition-colors shadow-sm disabled:opacity-50 disabled:bg-slate-300 disabled:text-slate-500 disabled:cursor-not-allowed"
                                            >
                                                {isSettled ? 'Fine Settled' : 'Settle Fine'}
                                            </button>
                                        </div>
                                    </CardContent>
                                </Card>
                                );
                            })}
                        </motion.div>

                        {/* Payment Gateway Mock UI */}
                        <motion.div variants={fadeInUp} initial="hidden" animate="visible">
                            <AnimatePresence mode="wait">
                                {selectedPayment ? (
                                    <motion.div
                                        key="payment-gateway"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -20 }}
                                    >
                                        <Card className="bg-[hsl(var(--surface-raised))] border-indigo-200 dark:border-indigo-500/30 overflow-hidden shadow-xl shadow-indigo-500/5">
                                            <div className="bg-gradient-to-r from-indigo-500 to-purple-600 p-4 text-white">
                                                <h3 className="font-bold flex items-center gap-2 text-lg">
                                                    <CreditCard className="w-5 h-5" />
                                                    Secure Payment Demo
                                                </h3>
                                                <p className="opacity-80 text-sm mt-1">Paying for: {selectedPayment.type || selectedPayment.reason}</p>
                                                <div className="mt-4 text-3xl font-bold font-mono text-white/90">
                                                    {paymentStep === 1 
                                                        ? `Max ₹${selectedPayment.amount.toLocaleString('en-IN')}` 
                                                        : `₹${Number(enteredAmount).toLocaleString('en-IN')}`}
                                                </div>
                                            </div>
                                            <CardContent className="p-6">
                                                <AnimatePresence mode="wait">
                                                {paymentStep === 1 && (
                                                    <motion.div key="amount-step" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                                        {selectedPayment.amount > 500 ? (
                                                            <div className="space-y-4">
                                                                <div className="space-y-2">
                                                                    <label className="text-sm font-semibold text-slate-800 dark:text-white/90">How much would you like to pay?</label>
                                                                    <div className="relative">
                                                                        <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                                                        <input
                                                                            type="number"
                                                                            placeholder="Enter amount (min ₹500)"
                                                                            value={enteredAmount}
                                                                            onChange={handleAmountChange}
                                                                            min="500"
                                                                            max={selectedPayment.amount}
                                                                            step="1"
                                                                            className={`w-full bg-background border ${amountError ? 'border-red-500 focus:ring-red-500/50' : 'border-border focus:ring-indigo-500/50'} rounded-lg pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:ring-2`}
                                                                            aria-describedby={amountError ? "amount-error" : undefined}
                                                                        />
                                                                    </div>
                                                                    {amountError && (
                                                                        <p id="amount-error" className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                                            <AlertCircle className="w-3 h-3" /> {amountError}
                                                                        </p>
                                                                    )}
                                                                </div>

                                                                {/* Live calculation display */}
                                                                <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl p-4 space-y-2">
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="text-slate-500 dark:text-white/60">Paying Now</span>
                                                                        <span className="text-indigo-600 dark:text-indigo-400 font-semibold">
                                                                            ₹{Number(enteredAmount) ? Number(enteredAmount).toLocaleString('en-IN') : '0'}
                                                                        </span>
                                                                    </div>
                                                                    <div className="flex justify-between items-center text-sm">
                                                                        <span className="text-slate-500 dark:text-white/60">Remaining Balance</span>
                                                                        {(() => {
                                                                            const rem = selectedPayment.amount - (Number(enteredAmount) || 0);
                                                                            if (rem === 0) {
                                                                                return <span className="text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-1"><CheckCircle2 className="w-3.5 h-3.5"/> Paid in Full</span>;
                                                                            }
                                                                            return <span className="text-amber-600 dark:text-amber-400 font-semibold">₹{rem.toLocaleString('en-IN')}</span>;
                                                                        })()}
                                                                    </div>
                                                                </div>

                                                                {/* Quick amount buttons */}
                                                                {selectedPayment.amount > 1000 && (
                                                                    <div className="flex flex-wrap gap-2">
                                                                        <button onClick={() => setEnteredAmount('500')} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-white/[0.1] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors focus:ring-2 focus:ring-indigo-500/50">₹500</button>
                                                                        <button onClick={() => setEnteredAmount('1000')} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 dark:border-white/[0.1] hover:bg-slate-100 dark:hover:bg-white/[0.05] transition-colors focus:ring-2 focus:ring-indigo-500/50">₹1,000</button>
                                                                        <button onClick={() => setEnteredAmount(selectedPayment.amount.toString())} className="px-3 py-1.5 text-xs font-medium rounded-lg border border-indigo-200 dark:border-indigo-500/30 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-500/10 transition-colors focus:ring-2 focus:ring-indigo-500/50 flex-1 sm:flex-none">Pay Full ₹{selectedPayment.amount.toLocaleString('en-IN')}</button>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-4 text-center py-2">
                                                                <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-400 p-3 rounded-xl text-sm text-left flex gap-3 pb-4">
                                                                    <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                                    <p>This fee must be paid in full. Partial payments are not available for amounts of ₹500 or less.</p>
                                                                </div>
                                                                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-6 mb-8">Amount Due: <span className="text-indigo-600 dark:text-indigo-400">₹{selectedPayment.amount.toLocaleString('en-IN')}</span></p>
                                                            </div>
                                                        )}

                                                        <div className="pt-4 space-y-2">
                                                            <button
                                                                onClick={handleContinueToPayment}
                                                                disabled={selectedPayment.amount > 500 && (!!amountError || !enteredAmount)}
                                                                className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                            >
                                                                {selectedPayment.amount > 500 ? `Continue — Pay ₹${Number(enteredAmount) ? Number(enteredAmount).toLocaleString('en-IN') : '0'}` : `Pay ₹${selectedPayment.amount.toLocaleString('en-IN')}`}
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedPayment(null)}
                                                                className="w-full py-2 text-sm text-muted-foreground hover:bg-slate-100 dark:hover:bg-white/[0.05] rounded-xl transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}
                                                {paymentStep === 3 && (
                                                    <motion.div
                                                        key="success"
                                                        initial={{ opacity: 0, scale: 0.95 }}
                                                        animate={{ opacity: 1, scale: 1 }}
                                                        exit={{ opacity: 0, scale: 0.95 }}
                                                        className="space-y-6"
                                                    >
                                                        <div className="flex flex-col items-center justify-center p-4 text-center space-y-4">
                                                            <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-2 animate-bounce">
                                                                <CheckCircle2 className="w-10 h-10" />
                                                            </div>
                                                            <h4 className="text-2xl font-bold text-slate-900 dark:text-white">Payment Submitted</h4>
                                                        </div>

                                                        <div className="bg-slate-50 dark:bg-white/[0.02] border border-slate-200 dark:border-white/[0.06] rounded-xl p-4 text-sm divide-y divide-slate-200 dark:divide-white/[0.06]">
                                                            <div className="py-2 flex justify-between">
                                                                <span className="text-slate-500">Fee</span>
                                                                <span className="text-slate-900 text-right dark:text-white font-medium">{selectedPayment.type || selectedPayment.reason}</span>
                                                            </div>
                                                            <div className="py-2 flex justify-between">
                                                                <span className="text-slate-500">Amount Paid</span>
                                                                <span className="text-slate-900 dark:text-white font-bold">₹{Number(enteredAmount).toLocaleString('en-IN')}</span>
                                                            </div>
                                                            <div className="py-2 flex justify-between">
                                                                <span className="text-slate-500">Remaining</span>
                                                                <span className="text-slate-900 dark:text-white font-medium">
                                                                    {selectedPayment.amount - Number(enteredAmount) > 0 
                                                                        ? `₹${(selectedPayment.amount - Number(enteredAmount)).toLocaleString('en-IN')}` 
                                                                        : "None"}
                                                                </span>
                                                            </div>
                                                            <div className="py-2 flex justify-between">
                                                                <span className="text-slate-500">Method</span>
                                                                <span className="text-slate-900 dark:text-white font-medium">{paymentMethod.toUpperCase()}</span>
                                                            </div>
                                                            <div className="py-2 flex justify-between">
                                                                <span className="text-slate-500">Transaction ID</span>
                                                                <span className="text-slate-900 dark:text-white font-mono text-xs">{paymentRecords.get(selectedPayment.id)?.transactionId || 'Pending'}</span>
                                                            </div>
                                                            <div className="py-2 flex justify-between">
                                                                <span className="text-slate-500">Date</span>
                                                                <span className="text-slate-900 dark:text-white font-medium">{paymentRecords.get(selectedPayment.id)?.date || new Date().toLocaleDateString('en-GB')}</span>
                                                            </div>
                                                        </div>

                                                        {selectedPayment.amount - Number(enteredAmount) > 0 ? (
                                                            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-400 p-3 rounded-xl text-sm flex gap-3">
                                                                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                                <p>₹{(selectedPayment.amount - Number(enteredAmount)).toLocaleString('en-IN')} is still outstanding for {selectedPayment.type || selectedPayment.reason}. Your next payment is due by {selectedPayment.due ? selectedPayment.due : selectedPayment.date}.</p>
                                                            </div>
                                                        ) : (
                                                            <div className="bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-800 dark:text-emerald-400 p-3 rounded-xl text-sm flex gap-3">
                                                                <CheckCircle2 className="w-5 h-5 flex-shrink-0 mt-0.5" />
                                                                <p>This fee has been paid in full.</p>
                                                            </div>
                                                        )}

                                                        <div className="pt-2 space-y-2">
                                                            <button
                                                                disabled
                                                                className="w-full py-2.5 bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-white/40 rounded-xl font-medium cursor-not-allowed group relative"
                                                            >
                                                                <span>Download Receipt</span>
                                                                <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">Coming soon</span>
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedPayment(null)}
                                                                className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all"
                                                            >
                                                                Done
                                                            </button>
                                                        </div>
                                                    </motion.div>
                                                )}

                                                {paymentStep === 2 && (
                                                    <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                                                        <div className="grid grid-cols-3 gap-2 mb-6">
                                                                {[
                                                                    { id: 'card', icon: CreditCard, label: 'Card' },
                                                                    { id: 'upi', icon: Smartphone, label: 'UPI' },
                                                                    { id: 'netbanking', icon: Landmark, label: 'Net Banking' },
                                                                ].map(method => (
                                                                    <button
                                                                        key={method.id}
                                                                        onClick={() => setPaymentMethod(method.id as any)}
                                                                        className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${paymentMethod === method.id ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' : 'border-border text-muted-foreground hover:bg-muted/50'}`}
                                                                    >
                                                                        <method.icon className="w-6 h-6" />
                                                                        <span className="text-xs font-semibold">{method.label}</span>
                                                                    </button>
                                                                ))}
                                                            </div>

                                                            <AnimatePresence mode="wait">
                                                                {paymentMethod === 'card' && (
                                                                    <motion.div key="card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Card Number</label>
                                                                            <input type="text" placeholder="4532 0192 8832 9912" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" defaultValue="4532 0192 8832 9912" readOnly />
                                                                        </div>
                                                                        <div className="grid grid-cols-2 gap-4">
                                                                            <div className="space-y-2">
                                                                                <label className="text-xs font-semibold text-muted-foreground uppercase">Expiry</label>
                                                                                <input type="text" placeholder="MM/YY" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" defaultValue="08/28" readOnly />
                                                                            </div>
                                                                            <div className="space-y-2">
                                                                                <label className="text-xs font-semibold text-muted-foreground uppercase">CVV</label>
                                                                                <input type="password" placeholder="•••" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" defaultValue="123" readOnly />
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Name on Card</label>
                                                                            <input type="text" placeholder="STUDENT NAME" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/50" defaultValue="STUDENT NAME" readOnly />
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                                {paymentMethod === 'upi' && (
                                                                    <motion.div key="upi" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-center py-4">
                                                                        <div className="w-40 h-40 mx-auto bg-white p-2 rounded-xl border-2 border-dashed border-slate-300">
                                                                            <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=upi://pay?pa=erp@demo&pn=ERPCore&am=10" alt="UPI QR" className="w-full h-full opacity-50" />
                                                                        </div>
                                                                        <p className="text-sm text-muted-foreground">Scan with any UPI app to pay</p>
                                                                        <p className="text-xs text-muted-foreground my-2">OR</p>
                                                                        <input type="text" placeholder="student@upi" className="w-full bg-background border border-border rounded-lg px-4 py-2 text-sm text-center focus:outline-none focus:ring-2 focus:ring-indigo-500/50" defaultValue="student@upi" readOnly />
                                                                    </motion.div>
                                                                )}
                                                                {paymentMethod === 'netbanking' && (
                                                                    <motion.div key="netbanking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                                                                        <div className="space-y-2">
                                                                            <label className="text-xs font-semibold text-muted-foreground uppercase">Select Bank</label>
                                                                            <CustomSelect
                                                                                options={[
                                                                                    { value: 'sbi', label: 'State Bank of India' },
                                                                                    { value: 'hdfc', label: 'HDFC Bank' },
                                                                                    { value: 'icici', label: 'ICICI Bank' },
                                                                                    { value: 'axis', label: 'Axis Bank' },
                                                                                ]}
                                                                                placeholder="Select Your Bank"
                                                                                value="sbi"
                                                                                onChange={() => { }}
                                                                            />
                                                                        </div>
                                                                        <div className="p-4 bg-muted/50 rounded-lg text-xs text-muted-foreground flex items-center gap-2">
                                                                            <Building className="w-10 h-10 text-slate-400" />
                                                                            You will be redirected to your bank's secure portal to complete the payment.
                                                                        </div>
                                                                    </motion.div>
                                                                )}
                                                            </AnimatePresence>

                                                            <button
                                                                onClick={handleProcessPayment}
                                                                disabled={isProcessing}
                                                                className="w-full mt-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold transition-all disabled:opacity-70 flex items-center justify-center gap-2"
                                                            >
                                                                {isProcessing ? (
                                                                    <>
                                                                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                                        Processing Gateway...
                                                                    </>
                                                                ) : (
                                                                    <>Pay ₹{selectedPayment.amount.toLocaleString('en-IN')} via {paymentMethod.toUpperCase()}</>
                                                                )}
                                                            </button>
                                                            <button
                                                                onClick={() => setSelectedPayment(null)}
                                                                className="w-full mt-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                                                            >
                                                                Cancel Payment
                                                            </button>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                ) : (
                                    <motion.div
                                        key="empty"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="h-full flex flex-col items-center justify-center p-8 text-center bg-[hsl(var(--surface-raised))] rounded-xl border border-dashed border-border lg:min-h-[400px]"
                                    >
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                            <CreditCard className="w-8 h-8 text-slate-400" />
                                        </div>
                                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">Awaiting Payment Selection</h4>
                                        <p className="text-sm text-muted-foreground max-w-sm mt-2">
                                            Click "Pay Now" on any pending fee or fine to proceed with the secure checkout process.
                                        </p>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </motion.div>
                    </div>
                </TabsContent>

                <TabsContent value="receipts" className="space-y-6 outline-none">
                    {/* Filters */}
                    <div className="flex flex-col sm:flex-row gap-4 mb-4">
                        <div className="w-full sm:w-64">
                            <CustomSelect
                                options={[
                                    { value: 'all', label: 'All Semesters' },
                                    { value: 'sem5', label: 'Semester 5' },
                                    { value: 'sem4', label: 'Semester 4' },
                                    { value: 'sem3', label: 'Semester 3' },
                                ]}
                                value={historySemesterFilter}
                                onChange={setHistorySemesterFilter}
                                placeholder="Filter by Semester"
                            />
                        </div>
                        <div className="w-full sm:w-64">
                            <CustomSelect
                                options={[
                                    { value: 'all', label: 'All Statuses' },
                                    { value: 'success', label: 'Successful' },
                                    { value: 'failed', label: 'Failed' },
                                ]}
                                value={historyStatusFilter}
                                onChange={setHistoryStatusFilter}
                                placeholder="Payment Status"
                            />
                        </div>
                    </div>

                    {/* Semester Grouping */}
                    <div className="space-y-4">
                        {HISTORY_DATA.map((semesterGroup, i) => {
                            const isExpanded = expandedSemesters[semesterGroup.semester];
                            const semTotalPaid = semesterGroup.transactions.reduce((acc, curr) => acc + curr.paid, 0);
                            const semTotalPending = semesterGroup.transactions.reduce((acc, curr) => acc + curr.balance, 0);

                            return (
                                <Card key={i} className="w-full max-w-full bg-[hsl(var(--surface-raised))] overflow-hidden border border-slate-200 dark:border-white/[0.06] hover:shadow-sm transition-shadow">
                                    <div 
                                        className="bg-slate-50 dark:bg-white/[0.02] px-6 py-4 flex flex-col sm:flex-row justify-between items-start sm:items-center cursor-pointer select-none border-b border-transparent group"
                                        style={{ borderBottomColor: isExpanded ? 'var(--border)' : 'transparent' }}
                                        onClick={() => toggleSemester(semesterGroup.semester)}
                                    >
                                        <div className="flex items-center gap-3">
                                            <motion.div variants={ChevronRotateVariant} animate={isExpanded ? "open" : "closed"} transition={{ duration: 0.2 }}>
                                                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                            </motion.div>
                                            <h3 className="text-base font-bold text-slate-900 dark:text-white">{semesterGroup.semester}</h3>
                                        </div>
                                        <div className="flex items-center gap-4 mt-2 sm:mt-0 text-sm opacity-80 pl-8 sm:pl-0">
                                            <span>Paid: <span className="font-semibold text-emerald-600 dark:text-emerald-400">₹{semTotalPaid.toLocaleString('en-IN')}</span></span>
                                            <span>Pending: <span className="font-semibold text-amber-600 dark:text-amber-400">₹{semTotalPending.toLocaleString('en-IN')}</span></span>
                                        </div>
                                    </div>

                                    <AnimatePresence initial={false}>
                                        {isExpanded && (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                                className="overflow-hidden"
                                            >
                                                <div className="p-0 overflow-x-auto custom-scrollbar w-full">
                                                    <table className="w-full text-sm text-left whitespace-nowrap">
                                                        <thead>
                                                            <tr className="border-b border-slate-100 dark:border-white/[0.06] text-muted-foreground bg-slate-50/50 dark:bg-white/[0.01]">
                                                                <th className="py-3 px-6 font-medium">Receipt No</th>
                                                                <th className="py-3 px-6 font-medium">Fee Type</th>
                                                                <th className="py-3 px-6 font-medium">Total Fee</th>
                                                                <th className="py-3 px-6 font-medium">Amount Paid</th>
                                                                <th className="py-3 px-6 font-medium">Balance</th>
                                                                <th className="py-3 px-6 font-medium">Payment Date</th>
                                                                <th className="py-3 px-6 font-medium">Method</th>
                                                                <th className="py-3 px-6 font-medium">Status</th>
                                                                <th className="py-3 px-6 font-medium text-right">Receipt</th>
                                                            </tr>
                                                        </thead>
                                                        <tbody className="divide-y divide-slate-100 dark:divide-white/[0.06]">
                                                            {semesterGroup.transactions.map((tx, j) => (
                                                                <tr key={j} className="hover:bg-slate-50/80 dark:hover:bg-white/[0.02] transition-colors">
                                                                    <td className="py-4 px-6 font-mono text-xs text-slate-500 dark:text-slate-400">{tx.id}</td>
                                                                    <td className="py-4 px-6 font-medium text-slate-900 dark:text-white">{tx.type}</td>
                                                                    <td className="py-4 px-6 text-slate-600 dark:text-slate-300">₹{tx.total.toLocaleString('en-IN')}</td>
                                                                    <td className="py-4 px-6 font-bold text-slate-900 dark:text-white">₹{tx.paid.toLocaleString('en-IN')}</td>
                                                                    <td className="py-4 px-6 font-medium">
                                                                        {tx.balance > 0 ? (
                                                                            <span className="text-amber-600 dark:text-amber-400">₹{tx.balance.toLocaleString('en-IN')}</span>
                                                                        ) : (
                                                                            <span className="text-emerald-600 dark:text-emerald-400">₹0</span>
                                                                        )}
                                                                    </td>
                                                                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{tx.date}</td>
                                                                    <td className="py-4 px-6 text-slate-500 dark:text-slate-400">{tx.method}</td>
                                                                    <td className="py-4 px-6">
                                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 text-xs font-medium rounded-md bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                                                                            <CheckCircle2 className="w-3.5 h-3.5" />
                                                                            Success
                                                                        </span>
                                                                    </td>
                                                                    <td className="py-4 px-6 text-right">
                                                                        <button
                                                                            disabled
                                                                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 dark:bg-white/[0.05] text-slate-400 dark:text-slate-500 rounded-md transition-colors disabled:cursor-not-allowed group relative"
                                                                        >
                                                                            <Download className="w-3.5 h-3.5" />
                                                                            <span className="text-xs font-semibold">PDF</span>
                                                                            <span className="absolute -top-8 right-0 bg-slate-800 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">Coming soon</span>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>
                                                <div className="bg-slate-50/50 dark:bg-white/[0.01] px-6 py-3 border-t border-slate-100 dark:border-white/[0.06] flex justify-end gap-6 text-sm">
                                                    <span>Total Paid: <span className="font-bold text-slate-900 dark:text-white">₹{semTotalPaid.toLocaleString('en-IN')}</span></span>
                                                    <span>Transactions: <span className="font-bold text-slate-900 dark:text-white">{semesterGroup.transactions.length}</span></span>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </Card>
                            );
                        })}
                    </div>

                    {/* Overall Summary Footer Card */}
                    <Card className="bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-800 dark:to-slate-900 border-none text-white mt-8 shadow-xl">
                        <CardContent className="p-6 sm:p-8">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 relative z-10">
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm font-medium">Total Fees</p>
                                    <p className="text-2xl sm:text-3xl font-bold">₹2,25,000</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm font-medium">Total Amount Paid</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-emerald-400">₹1,90,000</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm font-medium">Total Outstanding</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-amber-400">₹35,000</p>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-slate-400 text-sm font-medium">Total Fines Settled</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-rose-400">₹500</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </motion.div>
    );
}
