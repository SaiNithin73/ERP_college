/**
 * formatters.ts — Formatting utilities for institutional data (Rule F6).
 */

/**
 * formatNumber — Formats numbers using Indian numbering system.
 * @example 14250 -> 14,250
 */
export const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-IN').format(num);
};

/**
 * formatPercent — Formats decimal or whole number as percentage.
 * @example 0.942 -> 94.2%
 */
export const formatPercent = (val: number, decimals: number = 1): string => {
    return `${val.toFixed(decimals)}%`;
};

/**
 * formatAttendance — Formatting specifically for attendance figures.
 */
export const formatAttendance = (val: number): string => {
    return `${val.toFixed(1)}%`;
};

/**
 * formatCurrency — For financial figures (mocked for enrollment stats if needed).
 */
export const formatCurrency = (val: number): string => {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
    }).format(val);
};
