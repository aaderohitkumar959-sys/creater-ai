import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles, Star } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PersonaCardProps {
    id: string;
    name: string;
    description: string;
    avatarUrl: string;
    creatorName: string;
    category?: string;
    isPremium?: boolean;
    defaultCoinCost?: number;
    index?: number;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
    id,
    name,
    description,
    avatarUrl,
    creatorName,
    category,
    isPremium,
    defaultCoinCost,
    index = 0,
}) => {
    return (
        <Link href={`/chat/${id}`}>
            <div
                className="persona-card group relative aspect-[3/4] overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                {/* Image */}
                <Image
                    src={avatarUrl}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                    priority={index < 4}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent opacity-90 transition-opacity group-hover:opacity-95" />

                {/* Glow Effect on Hover */}
                <div className="absolute inset-0 bg-gradient-primary opacity-0 group-hover:opacity-10 transition-opacity duration-500" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-5 text-white transform transition-transform duration-300 group-hover:translate-y-[-4px]">
                    {/* Category Badge */}
                    {category && (
                        <span className="inline-block mb-2 px-3 py-1 text-xs font-medium bg-surface-elevated/80 backdrop-blur-sm rounded-full text-text-secondary border border-border-light">
                            {category}
                        </span>
                    )}

                    <div className="mb-2 flex items-center justify-between">
                        <h3 className="text-xl font-bold leading-tight font-display text-text-primary group-hover:text-gradient transition-all duration-300">
                            {name}
                        </h3>
                        {isPremium && (
                            <span className="flex items-center gap-1 rounded-full bg-accent-yellow/20 px-2.5 py-1 text-xs font-semibold text-accent-yellow backdrop-blur-sm border border-accent-yellow/40 shadow-glow-sm">
                                <Sparkles className="h-3 w-3" />
                                {defaultCoinCost ? `${defaultCoinCost} coins` : 'Premium'}
                            </span>
                        )}
                    </div>

                    <p className="mb-4 line-clamp-2 text-sm text-text-secondary font-light">
                        {description}
                    </p>

                    <div className="flex items-center justify-between">
                        <span className="text-xs text-text-muted flex items-center gap-1">
                            <Star className="h-3 w-3 text-accent-yellow fill-accent-yellow" />
                            by {creatorName}
                        </span>
                        <Button
                            size="sm"
                            className="h-9 rounded-xl bg-surface-elevated/50 px-5 text-text-primary font-medium hover:bg-primary hover:text-white backdrop-blur-md border border-border-light hover:border-primary transition-all duration-300 shadow-card group-hover:shadow-glow-sm"
                        >
                            <MessageCircle className="mr-2 h-4 w-4" />
                            Chat
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
};
