/**
 * Theme Toggle Button
 * Telegram-style theme switcher
 */

'use client';

import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';
import { cn } from '@/lib/utils';

export const ThemeToggle: React.FC = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <button
            onClick={toggleTheme}
            className={cn(
                'p-2 rounded-lg transition-all duration-250',
                'hover:bg-white/5 active:scale-95',
                'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
            )}
            aria-label={theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'}
        >
            {theme === 'dark' ? (
                <Sun size={20} />
            ) : (
                <Moon size={20} />
            )}
        </button>
    );
};
