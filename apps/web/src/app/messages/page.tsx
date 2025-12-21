/**
 * Messages Page - Telegram/WhatsApp Style Chat List
 * Mobile-first design with recent conversations
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { TopBar } from '@/components/navigation/top-bar';
import { GlassmorphismCard } from '@/components/ui/glassmorphism-card';
import { Search, Star, MessageSquare } from 'lucide-react';

import { cn } from '@/lib/utils';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';


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

    const { status: authStatus } = useSession();

    useEffect(() => {
        const fetchConversations = async () => {
            if (authStatus === 'unauthenticated') {
                setLoading(false);
                return;
            }

            try {
                const data = await api.getConversations();
                const mapped = data.map((c: any) => ({
                    id: c.id,
                    personaId: c.personaId,
                    personaName: c.persona?.name || 'Unknown',
                    personaAvatar: c.persona?.avatarUrl || '',
                    lastMessage: c.messages?.[0]?.content || 'No messages yet',
                    lastMessageTime: new Date(c.updatedAt),
                    unreadCount: 0, // Not implemented in backend yet
                    isPinned: false,
                }));
                setConversations(mapped);
            } catch (error) {
                console.error('Failed to fetch conversations:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchConversations();
    }, [authStatus]);

    const handleConversationClick = (id: string) => {
        router.push(`/public-chat/${id}`);
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
                    <div className="text-center py-20 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center mb-6">
                            <MessageSquare className="text-[var(--text-muted)]" size={32} />
                        </div>
                        <h3 className="text-lg font-bold text-white mb-2">
                            {authStatus === 'unauthenticated' ? 'Log in to see messages' : 'No conversations yet'}
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-8 max-w-xs mx-auto">
                            {authStatus === 'unauthenticated'
                                ? 'Sign in to start chatting with your favorite AI personalities.'
                                : 'Start a conversation with an AI character from the explore page.'}
                        </p>
                        <button
                            onClick={() => router.push(authStatus === 'unauthenticated' ? '/login' : '/explore')}
                            className="px-8 py-3 rounded-xl bg-gradient-accent text-white font-bold shadow-lg shadow-blue-500/20"
                        >
                            {authStatus === 'unauthenticated' ? 'Sign In' : 'Explore AI'}
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
