/**
 * Animation Utilities
 * Smooth, calm, premium animations for CreatorAI
 */

import { theme } from '@/styles/theme';

// Page transition animations
export const pageTransitions = {
    fadeSlide: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -20 },
        transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] },
    },

    fade: {
        initial: { opacity: 0 },
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0.25 },
    },

    slideUp: {
        initial: { opacity: 0, y: 40 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: -40 },
        transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
    },
};

// Card animations
export const cardAnimations = {
    hover: {
        scale: 1.02,
        y: -4,
        transition: { duration: 0.2 },
    },

    tap: {
        scale: 0.98,
        transition: { duration: 0.1 },
    },

    lift: {
        y: -8,
        boxShadow: theme.shadows.xl,
        transition: { duration: 0.25 },
    },
};

// Button animations
export const buttonAnimations = {
    ripple: {
        scale: [1, 1.5],
        opacity: [0.3, 0],
        transition: { duration: 0.6 },
    },

    glow: {
        boxShadow: [
            '0 0 0px rgba(59, 130, 246, 0)',
            '0 0 20px rgba(59, 130, 246, 0.5)',
            '0 0 0px rgba(59, 130, 246, 0)',
        ],
        transition: { duration: 2, repeat: Infinity },
    },

    press: {
        scale: 0.95,
        transition: { duration: 0.1 },
    },
};

// Typing indicator animation
export const typingAnimation = {
    dot: {
        y: [0, -10, 0],
        transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Coin animations
export const coinAnimations = {
    add: {
        scale: [1, 1.3, 1],
        rotate: [0, 10, -10, 0],
        transition: { duration: 0.5 },
    },

    float: {
        y: [0, -20, 0],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },

    sparkle: {
        opacity: [0, 1, 0],
        scale: [0.5, 1, 0.5],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// Premium unlock animation
export const premiumAnimations = {
    shimmer: {
        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
        transition: {
            duration: 3,
            repeat: Infinity,
            ease: 'linear',
        },
    },

    unlock: {
        scale: [0.9, 1.05, 1],
        opacity: [0, 1, 1],
        transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] },
    },

    cardLift: {
        y: [-10, 0],
        opacity: [0, 1],
        transition: { duration: 0.5, ease: 'easeOut' },
    },
};

// List item stagger animation
export const staggerAnimations = {
    container: {
        animate: {
            transition: {
                staggerChildren: 0.05,
            },
        },
    },

    item: {
        initial: { opacity: 0, y: 20 },
        animate: { opacity: 1, y: 0 },
        transition: { duration: 0.3 },
    },
};

// Bottom nav animation
export const navAnimations = {
    tabChange: {
        scale: [1, 1.1, 1],
        transition: { duration: 0.2 },
    },

    glow: {
        boxShadow: [
            '0 0 0px rgba(59, 130, 246, 0)',
            '0 0 15px rgba(59, 130, 246, 0.6)',
        ],
        transition: { duration: 0.3 },
    },
};

// Avatar animations
export const avatarAnimations = {
    pulse: {
        scale: [1, 1.05, 1],
        transition: {
            duration: 2,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },

    ring: {
        boxShadow: [
            '0 0 0 0 rgba(59, 130, 246, 0.7)',
            '0 0 0 10px rgba(59, 130, 246, 0)',
        ],
        transition: {
            duration: 1.5,
            repeat: Infinity,
        },
    },
};

// Notification animations
export const notificationAnimations = {
    slideIn: {
        initial: { opacity: 0, x: 100 },
        animate: { opacity: 1, x: 0 },
        exit: { opacity: 0, x: 100 },
        transition: { duration: 0.3, ease: 'easeOut' },
    },

    bounce: {
        y: [0, -5, 0],
        transition: { duration: 0.4 },
    },
};

// Streak animation
export const streakAnimations = {
    fire: {
        scale: [1, 1.1, 1],
        rotate: [0, 5, -5, 0],
        transition: {
            duration: 0.8,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },

    celebration: {
        scale: [1, 1.3, 1],
        rotate: [0, 10, -10, 0],
        transition: { duration: 0.6 },
    },
};

// Scroll reveal animation
export const scrollRevealAnimation = {
    initial: { opacity: 0, y: 30 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, margin: '-50px' },
    transition: { duration: 0.5, ease: 'easeOut' },
};

// Search animations
export const searchAnimations = {
    expand: {
        width: ['40px', '100%'],
        transition: { duration: 0.3, ease: 'easeOut' },
    },

    collapse: {
        width: ['100%', '40px'],
        transition: { duration: 0.3, ease: 'easeIn' },
    },
};

// Loading animations
export const loadingAnimations = {
    spinner: {
        rotate: 360,
        transition: {
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
        },
    },

    pulse: {
        opacity: [0.5, 1, 0.5],
        transition: {
            duration: 1.5,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },

    dots: {
        scale: [1, 1.2, 1],
        transition: {
            duration: 0.6,
            repeat: Infinity,
            ease: 'easeInOut',
        },
    },
};

// CSS animation classes for non-framer-motion usage
export const cssAnimationClasses = {
    fadeIn: 'animate-[fadeIn_0.3s_ease-out]',
    slideUp: 'animate-[slideUp_0.4s_ease-out]',
    scaleIn: 'animate-[scaleIn_0.3s_ease-out]',
    shimmer: 'animate-[shimmer_3s_linear_infinite]',
    spin: 'animate-spin',
    ping: 'animate-ping',
    pulse: 'animate-pulse',
    bounce: 'animate-bounce',
};
