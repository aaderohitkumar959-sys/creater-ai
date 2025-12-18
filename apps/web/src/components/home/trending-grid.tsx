/**
 * Trending Grid Component
 * Popular/Trending AI personalities with addictive browse experience
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { MessageCircle, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TrendingAI {
    id: string;
    name: string;
    avatar: string;
    vibe: string; // Short description line
    category: string;
    messageCount: number;
    description?: string;
    isNew?: boolean;
    isTrending?: boolean;
    isFeatured?: boolean;
}

interface TrendingGridProps {
    ais: TrendingAI[];
    title?: string;
}

export const TrendingGrid: React.FC<TrendingGridProps> = ({
    ais,
    title = "Popular AI Characters"
}) => {
    const router = useRouter();

    return (
        <section className="mb-8 px-4">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                {title}
            </h2>

            {/* Grid Layout - 2 columns mobile, 3 tablet, 4 desktop */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                {ais.map((ai) => (
                    <TrendingCard
                        key={ai.id}
                        ai={ai}
                        onClick={() => router.push(`/chat/${ai.id}`)}
                    />
                ))}
            </div>
        </section>
    );
};

// Trending Card Component
interface TrendingCardProps {
    ai: TrendingAI;
    onClick: () => void;
}

const TrendingCard: React.FC<TrendingCardProps> = ({ ai, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                'glass-medium rounded-xl p-3 sm:p-4',
                'transition-all duration-250 cursor-pointer',
                'hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg',
                'active:scale-98',
                'border border-[var(--border-medium)]',
                'relative overflow-hidden'
            )}
            style={{
                backdropFilter: 'blur(15px)',
            }}
        >
            {/* Badges */}
            <div className="absolute top-2 right-2 flex gap-1">
                {ai.isNew && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--accent-blue)] text-[10px] font-bold text-white">
                        NEW
                    </span>
                )}
                {ai.isTrending && (
                    <div className="p-1 rounded-full bg-orange-500/20">
                        <TrendingUp size={12} className="text-orange-500" />
                    </div>
                )}
            </div>

            {/* Avatar */}
            <div className="mb-3">
                <div className="aspect-square w-full rounded-lg bg-gradient-accent flex items-center justify-center text-white font-semibold text-2xl overflow-hidden">
                    {ai.avatar ? (
                        <img
                            src={ai.avatar}
                            alt={ai.name}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                e.currentTarget.style.display = 'none';
                                if (e.currentTarget.nextElementSibling) {
                                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                                }
                            }}
                        />
                    ) : null}
                    <div className={ai.avatar ? 'hidden w-full h-full flex items-center justify-center' : 'w-full h-full flex items-center justify-center'}>
                        {ai.name[0]}
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
                <div>
                    <h3 className="font-semibold text-[var(--text-primary)] truncate text-sm sm:text-base">
                        {ai.name}
                    </h3>
                    <p className="text-xs text-[var(--text-muted)] truncate">
                        {ai.category}
                    </p>
                </div>

                <p className="text-xs sm:text-sm text-[var(--text-secondary)] line-clamp-2 min-h-[2.5rem]">
                    {ai.vibe}
                </p>

                {/* Social Proof */}
                <div className="flex items-center gap-1 text-[var(--text-muted)]">
                    <MessageCircle size={14} />
                    <span className="text-xs">
                        {ai.messageCount >= 1000
                            ? `${(ai.messageCount / 1000).toFixed(1)}k`
                            : ai.messageCount} chats
                    </span>
                </div>
            </div>

            {/* Glow Effect on Hover */}
            <div
                className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-250 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                }}
            />
        </div>
    );
};
