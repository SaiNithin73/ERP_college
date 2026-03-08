/**
 * components.d.ts — All component prop interfaces.
 * Rule F4: No inline prop type definitions in component files — use this file.
 * Rule F13: CustomSelect props defined here.
 */

// ─── CustomSelect (Rule F13) ───────────────────────────────────────────────

export interface SelectOption {
    label: string;
    value: string;
}

export interface CustomSelectProps {
    options: SelectOption[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    disabled?: boolean;
    'data-testid'?: string;
}

// ─── Icon ──────────────────────────────────────────────────────────────────

export interface IconProps {
    className?: string;
    size?: number;
    'aria-label'?: string;
    'aria-hidden'?: boolean;
}

// ─── Error Boundary ────────────────────────────────────────────────────────

export interface ErrorBoundaryProps {
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

export interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

// ─── Shared Layout ─────────────────────────────────────────────────────────

export interface SectionPlaceholderProps {
    sectionName: string;
    icon?: React.ComponentType<IconProps>;
}

export interface RetryErrorStateProps {
    message?: string;
    onRetry: () => void;
}

// ─── Control Panels ────────────────────────────────────────────────────────

export interface PreviewBannerProps {
    message?: string;
}

export interface PortalMonitorCardProps {
    portal: import('./api').PortalStatusCard;
}

export interface EditDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    record: any; // Type narrowed in usage
    onSave: (data: any) => void;
}

export interface LeaveOverrideModalProps {
    isOpen: boolean;
    onClose: () => void;
    staffName: string;
    currentBalance: number;
    onSubmit: (newBalance: number, reason: string) => void;
}

export interface DeactivateConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    staffName: string;
    onConfirm: () => void;
}

export interface SparklineProps {
    data: number[];
    color: string;
}

// ─── Payment Records ───────────────────────────────────────────────────────

export interface PaymentRecord {
    feeId: string;
    amountPaid: number;
    remaining: number;
    transactionId: string;
    date: string;
    method: string;
    status: 'processing' | 'partial' | 'settled';
}
