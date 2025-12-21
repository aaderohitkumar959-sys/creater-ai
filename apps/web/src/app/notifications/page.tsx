/**
 * Notifications Page
 * Displays user alerts, messages, and system updates
 */

'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
    Bell,
    MessageCircle,
    Zap,
    Gift,
    Info,
    Check,
    MoreHorizontal,
    ArrowLeft,
    Trash2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSession } from 'next-auth/react';
import { TopBar } from '@/components/navigation/top-bar';

interface Notification {
    id: string;
    type: 'message' | 'system' | 'reward' | 'alert';
    title: string;
    body: string;
    timestamp: string;
    isRead: boolean;
    link?: string;
}

const mockNotifications: Notification[] = [
    {
        id: '1',
        type: 'message',
        title: 'New message from Captain Blackheart',
        body: 'Arr! The treasure map is finally ours, matey. When shall we set sail?',
        timestamp: '2m ago',
        isRead: false,
        link: '/public-chat/captain-blackheart',
    },
    {
        id: '2',
        type: 'reward',
        title: 'Daily Reward Claimed!',
        body: 'You just received 20 bonus coins for logging in today. Keep the streak going!',
        timestamp: '1h ago',
        isRead: false,
    },
    {
        id: '3',
        type: 'system',
        title: 'Welcome to Syelope!',
        body: 'Start exploring and chatting with unique AI personalities tailored just for you.',
        timestamp: '3h ago',
        isRead: true,
    },
    {
        id: '4',
        type: 'alert',
        title: 'Low Coin Balance',
        body: 'Your balance is below 50 coins. Top up now to continue your conversations!',
        timestamp: '1d ago',
        isRead: true,
        link: '/wallet',
    },
    {
        id: '5',
        type: 'message',
        title: 'Luna Starweaver sent a sparkle!',
        body: '✨ Hope your day is as bright as a supernova! ✨',
        timestamp: '2d ago',
        isRead: true,
        link: '/public-chat/luna-starweaver',
    },
];

export default function NotificationsPage() {
    const router = useRouter();
    const { status } = useSession();
    const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');

    const filteredNotifications = filter === 'all'
        ? notifications
        : notifications.filter(n => !n.isRead);

    const markAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    };

    const deleteNotification = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const toggleRead = (id: string) => {
        setNotifications(prev => prev.map(n =>
            n.id === id ? { ...n, isRead: !n.isRead } : n
        ));
    };

    if (status === 'unauthenticated') {
        return (
            <div className="min-h-screen bg-[var(--bg-primary)] flex flex-col">
                <TopBar showSearch={false} showNotifications={false} />
                <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
                    <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                        <Bell className="text-[var(--text-muted)]" size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-white mb-2">Please log in</h2>
                    <p className="text-[var(--text-secondary)] mb-6 max-w-xs">
                        Sign in to see your personalized notifications and chat alerts.
                    </p>
                    <button
                        onClick={() => router.push('/login')}
                        className="px-8 py-3 rounded-xl bg-gradient-accent text-white font-bold shadow-lg shadow-blue-500/20"
                    >
                        Sign In
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[var(--bg-primary)] pb-24">
            {/* Header */}
            <header className="sticky top-0 z-30 glass-medium border-b border-[var(--border-medium)]">
                <div className="container-mobile h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                        >
                            <ArrowLeft size={22} className="text-[var(--text-primary)]" />
                        </button>
                        <h1 className="text-xl font-bold text-white">Notifications</h1>
                    </div>

                    <div className="flex items-center gap-1">
                        <button
                            onClick={markAllAsRead}
                            className="p-2 rounded-lg hover:bg-white/5 text-[var(--accent-blue)] text-sm font-medium"
                        >
                            Mark all read
                        </button>
                    </div>
                </div>
            </header>

            <main className="container-mobile pt-4 space-y-4">
                {/* Filters */}
                <div className="flex gap-2 mb-2">
                    <button
                        onClick={() => setFilter('all')}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-semibold transition-all",
                            filter === 'all'
                                ? "bg-white text-black"
                                : "bg-white/5 text-[var(--text-secondary)] border border-white/5 hover:bg-white/10"
                        )}
                    >
                        All
                    </button>
                    <button
                        onClick={() => setFilter('unread')}
                        className={cn(
                            "px-4 py-1.5 rounded-full text-xs font-semibold transition-all flex items-center gap-1.5",
                            filter === 'unread'
                                ? "bg-[var(--accent-blue)] text-white shadow-lg shadow-blue-500/20"
                                : "bg-white/5 text-[var(--text-secondary)] border border-white/5 hover:bg-white/10"
                        )}
                    >
                        Unread
                        {notifications.filter(n => !n.isRead).length > 0 && (
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                        )}
                    </button>
                </div>

                {/* Notifications List */}
                <div className="space-y-3">
                    {filteredNotifications.length > 0 ? (
                        filteredNotifications.map((notification) => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onDelete={() => deleteNotification(notification.id)}
                                onToggleRead={() => toggleRead(notification.id)}
                                onClick={() => notification.link && router.push(notification.link)}
                            />
                        ))
                    ) : (
                        <div className="py-20 flex flex-col items-center justify-center text-center px-6">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-4">
                                <Zap className="text-[var(--text-muted)]" size={32} />
                            </div>
                            <h3 className="text-lg font-bold text-white mb-1">
                                {filter === 'unread' ? 'No unread notifications' : 'All caught up!'}
                            </h3>
                            <p className="text-sm text-[var(--text-secondary)] max-w-xs">
                                Check back later for new messages, rewards, and system updates.
                            </p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

interface NotificationCardProps {
    notification: Notification;
    onDelete: () => void;
    onToggleRead: () => void;
    onClick: () => void;
}

const NotificationCard: React.FC<NotificationCardProps> = ({
    notification,
    onDelete,
    onToggleRead,
    onClick
}) => {
    const getIcon = () => {
        switch (notification.type) {
            case 'message': return <MessageCircle size={18} className="text-blue-400" />;
            case 'reward': return <Gift size={18} className="text-yellow-400" />;
            case 'alert': return <Zap size={18} className="text-red-400" />;
            default: return <Info size={18} className="text-purple-400" />;
        }
    };

    return (
        <div
            className={cn(
                "relative group overflow-hidden rounded-2xl p-4 transition-all duration-300",
                "border border-white/5",
                notification.isRead
                    ? "bg-white/[0.02] grayscale-[0.5]"
                    : "bg-white/[0.07] border-white/10 shadow-xl"
            )}
            onClick={onClick}
        >
            {/* Unread Indicator */}
            {!notification.isRead && (
                <div className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[var(--accent-blue)] shadow-[0_0_10px_rgba(59,130,246,0.8)]" />
            )}

            <div className="flex gap-4">
                {/* Icon Container */}
                <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
                    notification.isRead ? "bg-white/5" : "bg-white/10 shadow-inner"
                )}>
                    {getIcon()}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6">
                    <div className="flex items-center justify-between mb-1">
                        <h4 className={cn(
                            "text-sm font-bold truncate",
                            notification.isRead ? "text-[var(--text-secondary)]" : "text-white"
                        )}>
                            {notification.title}
                        </h4>
                        <span className="text-[10px] text-[var(--text-muted)] font-medium">
                            {notification.timestamp}
                        </span>
                    </div>
                    <p className={cn(
                        "text-xs leading-relaxed line-clamp-2",
                        notification.isRead ? "text-[var(--text-muted)]" : "text-[var(--text-secondary)]"
                    )}>
                        {notification.body}
                    </p>

                    {/* Action Buttons (Visible on hover or tapping) */}
                    <div className="flex items-center gap-4 mt-3">
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onToggleRead();
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-[var(--text-secondary)] hover:text-white transition-colors"
                        >
                            <Check size={14} />
                            {notification.isRead ? 'Mark unread' : 'Mark read'}
                        </button>
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                onDelete();
                            }}
                            className="flex items-center gap-1.5 text-[10px] font-bold text-red-400 hover:text-red-300 transition-colors"
                        >
                            <Trash2 size={14} />
                            Delete
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
