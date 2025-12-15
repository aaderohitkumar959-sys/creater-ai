/**
 * Daily Streak Display Component
 * Gentle gamification for user engagement
 */

'use client';

import React from 'react';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DailyStreakProps {
    streakDays: number;
    className?: string;
}

export const DailyStreak: React.FC<DailyStreakProps> = ({
    streakDays,
    className
}) => {
    if (streakDays === 0) return null;

    return (
        <div
            className={cn(
                'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                'bg-gradient-to-r from-orange-500/20 to-red-500/20',
                'border border-orange-500/30',
                className
            )}
        >
            <Flame
                className="text-orange-500"
                size={20}
                fill="currentColor"
                style={{
                    animation: streakDays >= 7 ? 'flameFlicker 0.8s ease-in-out infinite' : 'none',
                }}
            />
            <div>
                <span className="text-lg font-bold text-orange-500">{streakDays}</span>
                <span className="text-xs text-[var(--text-muted)] ml-1">
                    {streakDays === 1 ? 'day' : 'days'} streak
                </span>
            </div>

            <style jsx>{`
        @keyframes flameFlicker {
          0%, 100% {
            transform: scale(1) rotate(0deg);
          }
          25% {
            transform: scale(1.1) rotate(5deg);
          }
          50% {
            transform: scale(1.05) rotate(-5deg);
          }
          75% {
            transform: scale(1.1) rotate(5deg);
          }
        }
      `}</style>
        </div>
    );
};
