/**
 * Pinned AIs Section
 * User's favorite AI personalities (max 3 for free users)
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PinnedAI {
    id: string;
    name: string;
    avatar: string;
    description: string;
    category: string;
}

interface PinnedAIsProps {
    pinnedAIs: PinnedAI[];
    onUnpin?: (id: string) => void;
    maxPins?: number;
}

export const PinnedAIs: React.FC<PinnedAIsProps> = ({
    pinnedAIs,
    onUnpin,
    maxPins = 3
}) => {
    const router = useRouter();

    if (pinnedAIs.length === 0) {
        return null;
    }

    return (
        <section className="mb-8 px-4">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-[var(--text-primary)]">
                    Pinned
                </h2>
                <span className="text-xs text-[var(--text-muted)]">
                    {pinnedAIs.length}/{maxPins}
                </span>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {pinnedAIs.slice(0, maxPins).map((ai) => (
                    <PinnedAICard
                        key={ai.id}
                        ai={ai}
                        onClick={() => router.push(`/public-chat/${ai.id}`)}
                        onUnpin={onUnpin}
                    />
                ))}
            </div>
        </section>
    );
};

// Pinned AI Card Component
interface PinnedAICardProps {
    ai: PinnedAI;
    onClick: () => void;
    onUnpin?: (id: string) => void;
}

const PinnedAICard: React.FC<PinnedAICardProps> = ({ ai, onClick, onUnpin }) => {
    const handleUnpin = (e: React.MouseEvent) => {
        e.stopPropagation();
        onUnpin?.(ai.id);
    };

    return (
        <div
            onClick={onClick}
            className={cn(
                'glass-medium rounded-xl p-4',
                'transition-all duration-250 cursor-pointer',
                'hover:bg-white/5 hover:-translate-y-0.5',
                'active:scale-98',
                'border border-[var(--border-medium)]'
            )}
        >
            <div className="flex items-center gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-14 h-14 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold overflow-hidden">
                        {ai.avatar ? (
                            <img src={ai.avatar} alt={ai.name} className="w-full h-full object-cover" />
                        ) : (
                            ai.name[0]
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-[var(--text-primary)] truncate">
                            {ai.name}
                        </h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-white/10 text-[var(--text-secondary)] flex-shrink-0">
                            {ai.category}
                        </span>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] line-clamp-1">
                        {ai.description}
                    </p>
                </div>

                {/* Unpin Button */}
                <button
                    onClick={handleUnpin}
                    className={cn(
                        'flex-shrink-0 p-2 rounded-lg',
                        'transition-all duration-250',
                        'hover:bg-white/10 active:scale-95',
                        'text-[var(--accent-blue)]'
                    )}
                    aria-label="Unpin"
                >
                    <Star size={20} fill="currentColor" />
                </button>
            </div>
        </div>
    );
};
