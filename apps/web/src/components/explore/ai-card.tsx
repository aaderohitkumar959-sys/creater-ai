/**
 * Enhanced AI Card for Explore Page
 * Premium card with hover effects, badges, and social proof
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, TrendingUp, Star, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AICardProps {
    id: string;
    name: string;
    avatar: string;
    vibe?: string;
    category?: string;
    messageCount?: number;
    description?: string;
    rating?: number;
    isNew?: boolean;
    isTrending?: boolean;
    isFeatured?: boolean;
    isPinned?: boolean;
    onPin?: (id: string) => void;
}

export const AICard: React.FC<AICardProps> = ({
    id,
    name,
    avatar,
    vibe,
    category,
    messageCount,
    rating,
    isNew,
    isTrending,
    isFeatured,
    isPinned,
    onPin,
}) => {
    const router = useRouter();

    const handleClick = () => {
        router.push(`/chat/${id}`);
    };

    const handlePin = (e: React.MouseEvent) => {
        e.stopPropagation();
        onPin?.(id);
    };

    return (
        <div
            onClick={handleClick}
            className={cn(
                'glass-medium rounded-xl p-4',
                'transition-all duration-250 cursor-pointer',
                'hover:bg-white/5 hover:-translate-y-1 hover:shadow-xl',
                'active:scale-98',
                'border border-[var(--border-medium)]',
                'relative overflow-hidden group'
            )}
        >
            {/* Badges */}
            <div className="absolute top-3 right-3 flex gap-1 z-10">
                {isNew && (
                    <span className="px-2 py-1 rounded-full bg-[var(--accent-blue)] text-[10px] font-bold text-white uppercase">
                        New
                    </span>
                )}
                {isTrending && (
                    <div className="p-1.5 rounded-full bg-orange-500/20 backdrop-blur">
                        <TrendingUp size={12} className="text-orange-500" />
                    </div>
                )}
                {isFeatured && (
                    <div className="p-1.5 rounded-full bg-yellow-500/20 backdrop-blur">
                        <Sparkles size={12} className="text-yellow-500" />
                    </div>
                )}
            </div>

            {/* Avatar */}
            <div className="mb-3 relative">
                <div className="aspect-square w-full rounded-lg bg-gradient-accent flex items-center justify-center text-white font-semibold text-3xl overflow-hidden">
                    {avatar ? (
                        <img src={avatar} alt={name} className="w-full h-full object-cover" />
                    ) : (
                        name[0]
                    )}
                </div>

                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-250 flex items-center justify-center rounded-lg">
                    <span className="text-white text-sm font-medium">Chat Now</span>
                </div>
            </div>

            {/* Content */}
            <div className="space-y-2">
                {/* Name and Category */}
                <div>
                    <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-[var(--text-primary)] truncate flex-1">
                            {name}
                        </h3>
                        {onPin && (
                            <button
                                onClick={handlePin}
                                className={cn(
                                    'p-1 rounded-lg transition-colors',
                                    'hover:bg-white/10',
                                    isPinned ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)]'
                                )}
                                aria-label={isPinned ? 'Unpin' : 'Pin'}
                            >
                                <Star size={16} fill={isPinned ? 'currentColor' : 'none'} />
                            </button>
                        )}
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">{category}</p>
                </div>

                {/* Vibe/Description */}
                <p className="text-sm text-[var(--text-secondary)] line-clamp-2 min-h-[2.5rem]">
                    {vibe}
                </p>

                {/* Stats */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--border-subtle)]">
                    <div className="flex items-center gap-1 text-[var(--text-muted)]">
                        <MessageCircle size={14} />
                        <span className="text-xs">
                            {messageCount >= 1000
                                ? `${(messageCount / 1000).toFixed(1)}k`
                                : messageCount}
                        </span>
                    </div>

                    {rating && (
                        <div className="flex items-center gap-1">
                            <Star size={14} className="text-yellow-500" fill="currentColor" />
                            <span className="text-xs text-[var(--text-secondary)]">{rating.toFixed(1)}</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Subtle glow on hover */}
            <div
                className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-250 pointer-events-none"
                style={{
                    background: 'radial-gradient(circle at center, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
                }}
            />
        </div>
    );
};
