/**
 * transitions.tsx — Named Framer Motion variant exports (Rule F5).
 * All page-level AnimatePresence variants live here.
 * GPU-safe only: animate transform + opacity exclusively.
 */

import type { Variants } from 'framer-motion';

/**
 * fadeInUp — Card/section entrance animation.
 * @trigger On mount / AnimatePresence enter
 * @duration 0.35s ease-out
 * @gpu-safe Yes (opacity + translateY only)
 */
export const fadeInUp: Variants = {
    hidden: { opacity: 0, y: 12 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
    exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: 'easeIn' } },
};

/**
 * fadeSlideUp — Specialized entrance for cards and list items.
 */
export const fadeSlideUp: Variants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.25, 0.1, 0.25, 1] } },
    exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};


/**
 * staggerContainer — Parent variant that staggers children.
 * @trigger Wrap around children using fadeInUp
 * @duration stagger 0.07s per child
 * @gpu-safe Yes (no direct animation, only orchestrates children)
 */
export const staggerContainer: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.07, delayChildren: 0.05 },
    },
};

/**
 * dropdownVariant — CustomSelect panel open/close.
 * @trigger On open state change
 * @duration 0.2s ease-out
 * @gpu-safe Yes (opacity + scaleY only)
 */
export const dropdownVariant: Variants = {
    hidden: { opacity: 0, scaleY: 0.9, transition: { duration: 0.15, ease: 'easeIn' } },
    visible: { opacity: 1, scaleY: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    exit: { opacity: 0, scaleY: 0.9, transition: { duration: 0.15, ease: 'easeIn' } },
};

/**
 * modalVariant — Modal/drawer entrance/exit.
 * @trigger On modal open/close
 * @duration 0.25s ease-out
 * @gpu-safe Yes (opacity + scale only)
 */
export const modalVariant: Variants = {
    hidden: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
    visible: { opacity: 1, scale: 1, transition: { duration: 0.25, ease: 'easeOut' } },
    exit: { opacity: 0, scale: 0.95, transition: { duration: 0.15, ease: 'easeIn' } },
};

/**
 * overlayVariant — Backdrop overlay fade.
 * @trigger On modal/drawer open
 * @duration 0.2s
 * @gpu-safe Yes (opacity only)
 */
export const overlayVariant: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.2 } },
    exit: { opacity: 0, transition: { duration: 0.15 } },
};

/**
 * successVariant — Checkmark/success entrance animation.
 * @trigger On payment or form success
 * @duration 0.5s spring
 * @gpu-safe Yes (opacity + scale only)
 */
export const successVariant: Variants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: { opacity: 1, scale: 1, transition: { type: 'spring', stiffness: 200, damping: 15 } },
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } },
};
