import React from 'react';
import { Button } from '@/components/ui/button';
import { MessageCircle, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface PersonaCardProps {
    id: string;
    name: string;
    description: string;
    avatarUrl: string;
    creatorName: string;
    isPremium?: boolean;
    index?: number;
}

export const PersonaCard: React.FC<PersonaCardProps> = ({
    id,
    name,
    description,
    avatarUrl,
    creatorName,
    isPremium,
    index = 0,
}) => {
    return (
        <Link href={`/chat/${id}`}>
            <div
                className="group relative aspect-[3/4] overflow-hidden rounded-2xl bg-muted shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                {/* Image */}
                <Image
                    src={avatarUrl}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 20vw"
                    priority={index < 4}
                />

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-80 transition-opacity group-hover:opacity-90" />

                {/* Content */}
                <div className="absolute bottom-0 left-0 w-full p-4 text-white">
                    <div className="mb-1 flex items-center justify-between">
                        <h3 className="text-lg font-bold leading-tight font-display relative z-10">{name}</h3>
                        {isPremium && (
                            <span className="flex items-center gap-1 rounded-full bg-yellow-500/20 px-2 py-0.5 text-[10px] font-medium text-yellow-300 backdrop-blur-sm border border-yellow-500/30 relative z-10">
                                <Sparkles className="h-3 w-3" />
                                Premium
                            </span>
                        )}
                    </div>

                    <p className="mb-3 line-clamp-2 text-xs text-white/80 font-light relative z-10">
                        {description}
                    </p>

                    <div className="flex items-center justify-between relative z-10">
                        <span className="text-[10px] text-white/60">
                            by {creatorName}
                        </span>
                        <Button
                            size="sm"
                            className="h-8 rounded-full bg-white/10 px-4 text-white hover:bg-white/20 backdrop-blur-md border border-white/10"
                        >
                            <MessageCircle className="mr-1.5 h-3.5 w-3.5" />
                            Chat
                        </Button>
                    </div>
                </div>
            </div>
        </Link>
    );
};
