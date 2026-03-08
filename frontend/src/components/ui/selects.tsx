/**
 * selects.tsx — CustomSelect dropdown (Rule F13).
 * @purpose The only dropdown component for all portal select needs.
 * @props options, value, onChange, placeholder?, disabled?, data-testid?
 * @a11y role="listbox", aria-expanded, aria-selected, keyboard nav, focus trap
 */

import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dropdownVariant } from '@/components/animations/transitions';
import type { CustomSelectProps } from '@/types/components';

export function CustomSelect({
    options,
    value,
    onChange,
    placeholder = 'Select...',
    disabled = false,
    'data-testid': testId,
}: CustomSelectProps) {
    const [open, setOpen] = React.useState(false);
    const containerRef = React.useRef<HTMLDivElement>(null);
    const listRef = React.useRef<HTMLUListElement>(null);
    const [focusIndex, setFocusIndex] = React.useState(-1);

    const selectedLabel = options.find((o) => o.value === value)?.label ?? placeholder;

    // Click outside close
    React.useEffect(() => {
        function handleClickOutside(e: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
            return () => document.removeEventListener('mousedown', handleClickOutside);
        }
    }, [open]);

    // Keyboard navigation
    const handleKeyDown = React.useCallback(
        (e: React.KeyboardEvent) => {
            if (disabled) return;
            switch (e.key) {
                case 'Enter':
                case ' ':
                    e.preventDefault();
                    if (open && focusIndex >= 0) {
                        onChange(options[focusIndex].value);
                        setOpen(false);
                    } else {
                        setOpen(!open);
                    }
                    break;
                case 'ArrowDown':
                    e.preventDefault();
                    if (!open) { setOpen(true); setFocusIndex(0); }
                    else setFocusIndex((i) => Math.min(i + 1, options.length - 1));
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    setFocusIndex((i) => Math.max(i - 1, 0));
                    break;
                case 'Escape':
                    setOpen(false);
                    break;
            }
        },
        [open, focusIndex, options, onChange, disabled]
    );

    return (
        <div ref={containerRef} className="relative" data-testid={testId}>
            <button
                type="button"
                onClick={() => !disabled && setOpen(!open)}
                onKeyDown={handleKeyDown}
                className={cn(
                    'flex min-h-[44px] w-full items-center justify-between rounded-lg border border-border',
                    'bg-background px-3 py-2 text-sm transition-colors',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                    disabled && 'cursor-not-allowed opacity-50',
                    !disabled && 'hover:border-primary/50'
                )}
                aria-expanded={open}
                aria-haspopup="listbox"
                disabled={disabled}
            >
                <span className={cn(!value && 'text-muted-foreground')}>{selectedLabel}</span>
                <ChevronDown
                    className={cn(
                        'ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200',
                        open && 'rotate-180'
                    )}
                />
            </button>

            <AnimatePresence>
                {open && (
                    <motion.ul
                        ref={listRef}
                        role="listbox"
                        variants={dropdownVariant}
                        initial="hidden"
                        animate="visible"
                        exit="exit"
                        className={cn(
                            'absolute z-50 mt-1 w-full origin-top rounded-lg border border-border',
                            'bg-[hsl(var(--surface-raised))] shadow-md',
                            'max-h-60 overflow-auto py-1'
                        )}
                        onKeyDown={handleKeyDown}
                    >
                        {options.map((option, idx) => (
                            <li
                                key={option.value}
                                role="option"
                                aria-selected={value === option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setOpen(false);
                                }}
                                onMouseEnter={() => setFocusIndex(idx)}
                                className={cn(
                                    'flex min-h-[40px] cursor-pointer items-center gap-2 px-3 py-2 text-sm',
                                    'transition-colors',
                                    focusIndex === idx && 'bg-primary/10 text-primary',
                                    value === option.value && 'font-semibold',
                                    focusIndex !== idx && 'text-foreground hover:bg-muted'
                                )}
                            >
                                {value === option.value && (
                                    <Check className="h-4 w-4 text-primary" />
                                )}
                                <span className={cn(value !== option.value && 'ml-6')}>
                                    {option.label}
                                </span>
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
}
