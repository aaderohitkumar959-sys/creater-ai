/**
 * Messages Page - Telegram/WhatsApp Style Chat List
 * Mobile-first design with recent conversations
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/navigation/top-bar';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Search, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Conversation {
    id: string;
    personaId: string;
    personaName: string;
    personaAvatar: string;
    lastMessage: string;
    lastMessageTime: Date;
    unreadCount: number;
    isPinned: boolean;
}

export default function MessagesPage() {
    const router = useRouter();
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');

    useEffect(() => {
        // TODO: Fetch conversations from API
        // Mock data for now
        setTimeout(() => {
            setConversations([
                {
                    id: '1',
                    personaId: 'p1',
                    personaName: 'Sarah',
                    personaAvatar: '/personas/sarah.jpg',
                    lastMessage: "That's really interesting! Tell me more about it.",
                    lastMessageTime: new Date(Date.now() - 1000 * 60 * 30),
                    unreadCount: 2,
                    isPinned: true,
                },
                {
                    id: '2',
                    personaId: 'p2',
                    personaName: 'Alex',
                    personaAvatar: '/personas/alex.jpg',
                    lastMessage: 'Hey! How was your day?',
                    lastMessageTime: new Date(Date.now() - 1000 * 60 * 60 * 2),
                    unreadCount: 0,
                    isPinned: false,
                },
            ]);
            setLoading(false);
        }, 500);
    }, []);

    const handleConversationClick = (id: string) => {
        router.push(`/chat/${id}`);
    };

    const formatTime = (date: Date): string => {
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days === 1) return 'Yesterday';
        if (days < 7) return `${days}d ago`;
        return date.toLocaleDateString();
    };

    const filteredConversations = conversations.filter(conv =>
        conv.personaName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const pinnedConversations = filteredConversations.filter(c => c.isPinned);
    const regularConversations = filteredConversations.filter(c => !c.isPinned);

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <TopBar />

            {/* Search Bar */}
            <div className="container-mobile py-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                    <input
                        type="text"
                        placeholder="Search conversations..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            'w-full pl-10 pr-4 py-3 rounded-xl',
                            'glass-medium border-[var(--border-medium)]',
                            'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                            'focus:border-[var(--accent-blue)] focus:outline-none',
                            'transition-all duration-250'
                        )}
                    />
                </div>
            </div>

            {/* Conversations List */}
            <div className="container-mobile pb-8">
                {loading ? (
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="glass-medium rounded-xl h-20 animate-pulse" />
                        ))}
                    </div>
                ) : filteredConversations.length === 0 ? (
                    <div className="text-center py-12">
                        <p className="text-[var(--text-secondary)] mb-4">No conversations yet</p>
                        <button
                            onClick={() => router.push('/explore')}
                            className="btn-primary"
                        >
                            Start Chatting
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {/* Pinned Conversations */}
                        {pinnedConversations.length > 0 && (
                            <div>
                                <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-2 px-2">
                                    Pinned
                                </h3>
                                <div className="space-y-2">
                                    {pinnedConversations.map((conv) => (
                                        <ConversationItem
                                            key={conv.id}
                                            conversation={conv}
                                            onClick={() => handleConversationClick(conv.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Regular Conversations */}
                        {regularConversations.length > 0 && (
                            <div>
                                {pinnedConversations.length > 0 && (
                                    <h3 className="text-sm font-semibold text-[var(--text-muted)] mb-2 px-2 mt-4">
                                        All Messages
                                    </h3>
                                )}
                                <div className="space-y-2">
                                    {regularConversations.map((conv) => (
                                        <ConversationItem
                                            key={conv.id}
                                            conversation={conv}
                                            onClick={() => handleConversationClick(conv.id)}
                                        />
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}

// Conversation Item Component
interface ConversationItemProps {
    conversation: Conversation;
    onClick: () => void;
}

const ConversationItem: React.FC<ConversationItemProps> = ({ conversation, onClick }) => {
    return (
        <div
            onClick={onClick}
            className={cn(
                'glass-medium rounded-xl p-4',
                'transition-all duration-250 cursor-pointer',
                'hover:bg-white/5 hover:-translate-y-0.5',
                'active:scale-98',
                'flex items-center gap-3'
            )}
        >
            {/* Avatar */}
            <div className="relative flex-shrink-0">
                <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold">
                    {conversation.personaName[0]}
                </div>
                {conversation.unreadCount > 0 && (
                    <div className="absolute -top-1 -right-1 min-w-[20px] h-5 px-1.5 rounded-full bg-[var(--accent-blue)] flex items-center justify-center">
                        <span className="text-xs font-bold text-white">
                            {conversation.unreadCount}
                        </span>
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2">
                        <h3 className={cn(
                            'font-semibold truncate',
                            conversation.unreadCount > 0 ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'
                        )}>
                            {conversation.personaName}
                        </h3>
                        {conversation.isPinned && (
                            <Star size={14} className="text-[var(--accent-blue)]" fill="currentColor" />
                        )}
                    </div>
                    <span className="text-xs text-[var(--text-muted)] flex-shrink-0">
                        {formatTime(conversation.lastMessageTime)}
                    </span>
                </div>
                <p className={cn(
                    'text-sm truncate',
                    conversation.unreadCount > 0 ? 'text-[var(--text-secondary)] font-medium' : 'text-[var(--text-tertiary)]'
                )}>
                    {conversation.lastMessage}
                </p>
            </div>
        </div>
    );
};

function formatTime(date: Date): string {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days === 1) return '1d';
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
