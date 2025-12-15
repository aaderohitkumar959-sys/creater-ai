/**
 * Achievement Toast Component
 * Gentle, supportive achievement notifications
 */

'use client';

import React, { useEffect, useState } from 'react';
import { Trophy, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AchievementToastProps {
    title: string;
    message: string;
    onClose: () => void;
    duration?: number;
}

export const AchievementToast: React.FC<AchievementToastProps> = ({
    title,
    message,
    onClose,
    duration = 5000,
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Slide in animation
        setTimeout(() => setIsVisible(true), 100);

        // Auto close
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    return (
        <div
            className={cn(
                'fixed top-20 right-4 z-50',
                'glass-medium rounded-xl p-4 pr-12',
                'border border-[var(--border-medium)]',
                'shadow-2xl',
                'transition-all duration-300',
                'max-w-sm',
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            )}
            style={{
                backdropFilter: 'blur(20px)',
            }}
        >
            {/* Close button */}
            <button
                onClick={() => {
                    setIsVisible(false);
                    setTimeout(onClose, 300);
                }}
                className="absolute top-2 right-2 p-1 rounded-lg hover:bg-white/10 transition-colors"
                aria-label="Close"
            >
                <X size={16} className="text-[var(--text-muted)]" />
            </button>

            {/* Content */}
            <div className="flex items-start gap-3">
                <div className="flex-shrink-0 p-2 rounded-full bg-yellow-500/20">
                    <Trophy className="text-yellow-500" size={24} />
                </div>
                <div className="flex-1">
                    <h4 className="font-semibold text-[var(--text-primary)] mb-1">
                        {title}
                    </h4>
                    <p className="text-sm text-[var(--text-secondary)]">
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
};

// Hook to manage achievement toasts
export const useAchievementToast = () => {
    const [toast, setToast] = useState<{ title: string; message: string } | null>(null);

    const showAchievement = (title: string, message: string) => {
        setToast({ title, message });
    };

    const ToastComponent = toast ? (
        <AchievementToast
            title={toast.title}
            message={toast.message}
            onClose={() => setToast(null)}
        />
    ) : null;

    return { showAchievement, ToastComponent };
};
