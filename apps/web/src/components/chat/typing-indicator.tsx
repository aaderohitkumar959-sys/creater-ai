/**
 * Typing Indicator Component
 * 3-dot animation for AI response loading
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';

interface TypingIndicatorProps {
    className?: string;
}

export const TypingIndicator: React.FC<TypingIndicatorProps> = ({ className }) => {
    return (
        <div className={cn('flex items-center gap-1', className)}>
            <div
                className="w-2 h-2 rounded-full bg-[var(--text-muted)]"
                style={{
                    animation: 'typing 1.4s infinite',
                    animationDelay: '0ms',
                }}
            />
            <div
                className="w-2 h-2 rounded-full bg-[var(--text-muted)]"
                style={{
                    animation: 'typing 1.4s infinite',
                    animationDelay: '200ms',
                }}
            />
            <div
                className="w-2 h-2 rounded-full bg-[var(--text-muted)]"
                style={{
                    animation: 'typing 1.4s infinite',
                    animationDelay: '400ms',
                }}
            />

            <style jsx>{`
        @keyframes typing {
          0%, 60%, 100% {
            transform: translateY(0);
            opacity: 0.6;
          }
          30% {
            transform: translateY(-8px);
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
};
