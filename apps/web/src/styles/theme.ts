/**
 * CreatorAI Premium Design System
 * World-class dark theme with glassmorphism
 */

export const theme = {
    // Core Colors - Pure Black / Dark Blue
    colors: {
        // Backgrounds
        background: {
            primary: '#0B0F14',
            secondary: '#0E1623',
            tertiary: '#1A1F2E',
            glass: 'rgba(14, 22, 35, 0.7)',
        },

        // Accents - Soft neon blue/purple
        accent: {
            blue: '#3B82F6',
            purple: '#8B5CF6',
            gradient: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        },

        // Text
        text: {
            primary: '#FFFFFF',
            secondary: '#94A3B8',
            tertiary: '#64748B',
            muted: '#475569',
        },

        // UI Elements
        border: {
            subtle: 'rgba(255, 255, 255, 0.05)',
            medium: 'rgba(255, 255, 255, 0.1)',
            strong: 'rgba(255, 255, 255, 0.15)',
        },

        // Status
        success: '#10B981',
        warning: '#F59E0B',
        error: '#EF4444',
        info: '#3B82F6',
    },

    // Gradients
    gradients: {
        background: 'linear-gradient(180deg, #0B0F14 0%, #0E1623 100%)',
        card: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
        accent: 'linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%)',
        glass: 'linear-gradient(135deg, rgba(255, 255, 255, 0.05) 0%, rgba(255, 255, 255, 0.02) 100%)',
    },

    // Glassmorphism
    glass: {
        blur: {
            light: 'blur(10px)',
            medium: 'blur(15px)',
            heavy: 'blur(20px)',
        },
        background: {
            light: 'rgba(14, 22, 35, 0.6)',
            medium: 'rgba(14, 22, 35, 0.7)',
            heavy: 'rgba(14, 22, 35, 0.8)',
        },
        border: '1px solid rgba(255, 255, 255, 0.1)',
    },

    // Typography - Mobile First
    typography: {
        fontFamily: {
            primary: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
            mono: '"SF Mono", Monaco, "Cascadia Code", "Roboto Mono", Consolas, monospace',
        },

        // Mobile-optimized sizes
        fontSize: {
            xs: '0.75rem',    // 12px
            sm: '0.875rem',   // 14px
            base: '1rem',     // 16px
            lg: '1.125rem',   // 18px
            xl: '1.25rem',    // 20px
            '2xl': '1.5rem',  // 24px
            '3xl': '1.875rem', // 30px
            '4xl': '2.25rem', // 36px
        },

        lineHeight: {
            tight: 1.25,
            normal: 1.5,
            relaxed: 1.75,
        },

        fontWeight: {
            normal: 400,
            medium: 500,
            semibold: 600,
            bold: 700,
        },
    },

    // Spacing - Thumb-friendly for mobile
    spacing: {
        xs: '0.25rem',   // 4px
        sm: '0.5rem',    // 8px
        md: '1rem',      // 16px
        lg: '1.5rem',    // 24px
        xl: '2rem',      // 32px
        '2xl': '3rem',   // 48px
        '3xl': '4rem',   // 64px
    },

    // Border Radius
    radius: {
        sm: '0.375rem',  // 6px
        md: '0.5rem',    // 8px
        lg: '0.75rem',   // 12px
        xl: '1rem',      // 16px
        '2xl': '1.5rem', // 24px
        full: '9999px',
    },

    // Shadows - Subtle and premium
    shadows: {
        sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
        md: '0 4px 6px -1px rgba(0, 0, 0, 0.4)',
        lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5)',
        xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5)',
        glow: '0 0 20px rgba(59, 130, 246, 0.3)',
        glowPurple: '0 0 20px rgba(139, 92, 246, 0.3)',
    },

    // Animations - Smooth and calm
    animations: {
        duration: {
            fast: '150ms',
            normal: '250ms',
            slow: '350ms',
        },
        timing: {
            ease: 'cubic-bezier(0.4, 0, 0.2, 1)',
            easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
            easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
            easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
        },
    },

    // Breakpoints - Mobile First
    breakpoints: {
        xs: '375px',   // iPhone SE
        sm: '640px',   // Mobile landscape
        md: '768px',   // Tablet
        lg: '1024px',  // Desktop
        xl: '1280px',  // Large desktop
        '2xl': '1536px', // Extra large
    },

    // Z-index layers
    zIndex: {
        dropdown: 1000,
        sticky: 1020,
        fixed: 1030,
        modalBackdrop: 1040,
        modal: 1050,
        popover: 1060,
        tooltip: 1070,
    },
} as const;

// Helper function to create glassmorphism styles
export const createGlassEffect = (opacity: 'light' | 'medium' | 'heavy' = 'medium') => ({
    background: theme.glass.background[opacity],
    backdropFilter: theme.glass.blur.medium,
    WebkitBackdropFilter: theme.glass.blur.medium,
    border: theme.glass.border,
});

// Helper function for glow effects
export const createGlowEffect = (color: 'blue' | 'purple' = 'blue') => ({
    boxShadow: color === 'blue' ? theme.shadows.glow : theme.shadows.glowPurple,
});

export type Theme = typeof theme;
