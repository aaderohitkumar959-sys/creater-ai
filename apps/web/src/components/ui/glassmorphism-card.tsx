/**
 * Glassmorphism Card Component
 * Premium glass effect with blur and subtle borders
 */

import React from 'react';
import { cn } from '@/lib/utils';
import { theme, createGlassEffect } from '@/styles/theme';

interface GlassmorphismCardProps {
    children: React.ReactNode;
    className?: string;
    opacity?: 'light' | 'medium' | 'heavy';
    withBorder?: boolean;
    withGlow?: boolean;
    glowColor?: 'blue' | 'purple';
    onClick?: () => void;
    hoverable?: boolean;
}

export const GlassmorphismCard: React.FC<GlassmorphismCardProps> = ({
    children,
    className,
    opacity = 'medium',
    withBorder = true,
    withGlow = false,
    glowColor = 'blue',
    onClick,
    hoverable = false,
}) => {
    const glassEffect = createGlassEffect(opacity);

    return (
        <div
            onClick={onClick}
            className={cn(
                'rounded-xl p-4',
                hoverable && 'transition-all duration-250 hover:-translate-y-1 hover:shadow-xl cursor-pointer',
                withGlow && 'hover:shadow-glow',
                className
            )}
            style={{
                background: glassEffect.background,
                backdropFilter: glassEffect.backdropFilter,
                WebkitBackdropFilter: glassEffect.WebkitBackdropFilter,
                border: withBorder ? glassEffect.border : 'none',
                ...(withGlow && {
                    boxShadow: `0 0 20px ${glowColor === 'blue' ? 'rgba(59, 130, 246, 0.2)' : 'rgba(139, 92, 246, 0.2)'}`,
                }),
            }}
        >
            {children}
        </div>
    );
};

/**
 * Preset variants for common use cases
 */
export const GlassCard = {
    Container: ({ children, className, ...props }: Omit<GlassmorphismCardProps, 'opacity'>) => (
        <GlassmorphismCard opacity="medium" className={className} {...props}>
            {children}
        </GlassmorphismCard>
    ),

    Light: ({ children, className, ...props }: Omit<GlassmorphismCardProps, 'opacity'>) => (
        <GlassmorphismCard opacity="light" className={className} {...props}>
            {children}
        </GlassmorphismCard>
    ),

    Heavy: ({ children, className, ...props }: Omit<GlassmorphismCardProps, 'opacity'>) => (
        <GlassmorphismCard opacity="heavy" className={className} {...props}>
            {children}
        </GlassmorphismCard>
    ),

    Hoverable: ({ children, className, ...props }: Omit<GlassmorphismCardProps, 'hoverable'>) => (
        <GlassmorphismCard hoverable className={className} {...props}>
            {children}
        </GlassmorphismCard>
    ),

    WithGlow: ({ children, className, glowColor = 'blue', ...props }: Omit<GlassmorphismCardProps, 'withGlow'>) => (
        <GlassmorphismCard withGlow glowColor={glowColor} className={className} {...props}>
            {children}
        </GlassmorphismCard>
    ),
};
