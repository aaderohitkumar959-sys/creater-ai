/**
 * Continue Chatting Section
 * Horizontal scroll of recent conversations - Emotional continuity
 */

'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { cn } from '@/lib/utils';

interface RecentChat {
    id: string;
    personaId: string;
    personaName: string;
    personaAvatar: string;
    lastMessage: string;
    lastTalked: string; // "2h ago", "yesterday", etc.
}

interface ContinueChattingProps {
    recentChats: RecentChat[];
}

export const ContinueChatting: React.FC<ContinueChattingProps> = ({ recentChats }) => {
    const router = useRouter();

    if (recentChats.length === 0) {
        return null;
    }

    return (
        <section className="mb-8">
            <h2 className="text-lg font-semibold text-[var(--text-primary)] mb-4 px-4">
                Continue Chatting
            </h2>

            {/* Horizontal Scroll Container */}
            <div className="overflow-x-auto hide-scrollbar">
                <div className="flex gap-3 px-4 pb-2">
                    {recentChats.map((chat) => (
                        <RecentChatCard
                            key={chat.id}
                            chat={chat}
                            onClick={() => router.push(`/chat/${chat.personaId}`)}
                        />
                    ))}
                </div>
            </div>
        </section>
    );
};

// Recent Chat Card Component
interface RecentChatCardProps {
    chat: RecentChat;
    onClick: () => void;
}

const RecentChatCard: React.FC<RecentChatCardProps> = ({ chat, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                'flex-shrink-0 w-72 glass-medium rounded-xl p-4',
                'transition-all duration-250 cursor-pointer',
                'hover:bg-white/5 hover:-translate-y-1',
                'active:scale-98',
                'border border-[var(--border-medium)]'
            )}
        >
            <div className="flex items-start gap-3">
                {/* Avatar */}
                <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold overflow-hidden">
                        {chat.personaAvatar ? (
                            <img src={chat.personaAvatar} alt={chat.personaName} className="w-full h-full object-cover" />
                        ) : (
                            chat.personaName[0]
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-[var(--text-primary)] mb-1 truncate">
                        {chat.personaName}
                    </h3>
                    <p className="text-sm text-[var(--text-secondary)] mb-2 line-clamp-2">
                        {chat.lastMessage}
                    </p>
                    <span className="text-xs text-[var(--text-muted)]">
                        Last talked: {chat.lastTalked}
                    </span>
                </div>
            </div>
        </div>
    );
};
