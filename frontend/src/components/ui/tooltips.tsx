/**
 * tooltips.tsx — Hover/focus tooltip wrapper.
 * @purpose Display contextual tooltips on hover or focus.
 * @usage <Tooltip content="Tooltip text"><Button>Hover me</Button></Tooltip>
 */

import * as React from 'react';
import { cn } from '@/lib/utils';

interface TooltipProps {
    content: string;
    children: React.ReactNode;
    className?: string;
    side?: 'top' | 'bottom' | 'left' | 'right';
}

export function Tooltip({ content, children, className, side = 'top' }: TooltipProps) {
    const [visible, setVisible] = React.useState(false);

    const positionClasses: Record<string, string> = {
        top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
        bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
        left: 'right-full top-1/2 -translate-y-1/2 mr-2',
        right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    };

    return (
        <span
            className="relative inline-flex"
            onMouseEnter={() => setVisible(true)}
            onMouseLeave={() => setVisible(false)}
            onFocus={() => setVisible(true)}
            onBlur={() => setVisible(false)}
        >
            {children}
            {visible && (
                <span
                    role="tooltip"
                    className={cn(
                        'absolute z-50 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-medium',
                        'bg-foreground text-background shadow-md',
                        'pointer-events-none animate-in fade-in-0 zoom-in-95',
                        positionClasses[side],
                        className
                    )}
                >
                    {content}
                </span>
            )}
        </span>
    );
}
