/**
 * Profile Page - Minimal & Clean
 * User settings and account management
 */

'use client';

import React, { useState } from 'react';
import { TopBar } from '@/components/navigation/top-bar';
import {
    User,
    Coins,
    Settings,
    HelpCircle,
    LogOut,
    Crown,
    ChevronRight,
    Moon,
    Sun
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/contexts/theme-context';

export default function ProfilePage() {
    const router = useRouter();
    const { theme, toggleTheme } = useTheme();
    const [user, setUser] = useState({
        name: 'User',
        email: 'user@example.com',
        avatar: '',
        plan: 'Free',
        coinBalance: 240,
        isPremium: false,
    });

    const handleLogout = () => {
        // TODO: Implement logout
        if (confirm('Are you sure you want to logout?')) {
            alert('Logout functionality coming soon!');
        }
    };

    const menuItems = [
        {
            icon: theme === 'dark' ? Sun : Moon,
            label: theme === 'dark' ? 'Light Theme' : 'Dark Theme',
            description: 'Switch between dark and light themes',
            onClick: toggleTheme,
        },
        {
            icon: Settings,
            label: 'Settings',
            description: 'Manage your preferences',
            onClick: () => alert('Settings coming soon!'),
        },
        {
            icon: HelpCircle,
            label: 'Help & Support',
            description: 'Get help and contact us',
            onClick: () => alert('Support coming soon!'),
        },
        {
            icon: LogOut,
            label: 'Logout',
            description: 'Sign out of your account',
            onClick: handleLogout,
            danger: true,
        },
    ];
    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <TopBar showSearch={false} showNotifications={false} />

            <div className="container-mobile pt-6 pb-8 space-y-6">
                {/* Profile Header */}
                <div className="glass-medium rounded-2xl p-6 border border-[var(--border-medium)]">
                    <div className="flex items-center gap-4 mb-4">
                        {/* Avatar */}
                        <div className="w-20 h-20 rounded-full bg-gradient-accent flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                            {user.avatar ? (
                                <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                            ) : (
                                user.name[0]
                            )}
                        </div>

                        {/* User info */}
                        <div className="flex-1">
                            <h2 className="text-xl font-bold text-[var(--text-primary)] mb-1">
                                {user.name}
                            </h2>
                            <p className="text-sm text-[var(--text-secondary)]">
                                {user.email}
                            </p>
                        </div>
                    </div>

                    {/* Plan Badge */}
                    <div
                        className={cn(
                            'inline-flex items-center gap-2 px-4 py-2 rounded-full',
                            user.isPremium
                                ? 'bg-gradient-to-r from-yellow-500/20 to-purple-500/20 border border-yellow-500/30'
                                : 'bg-[var(--bg-tertiary)] border border-[var(--border-medium)]'
                        )}
                    >
                        {user.isPremium && <Crown className="text-yellow-500" size={16} fill="currentColor" />}
                        <span className={cn(
                            'text-sm font-semibold',
                            user.isPremium ? 'text-gradient' : 'text-[var(--text-secondary)]'
                        )}>
                            {user.plan} Plan
                        </span>
                    </div>
                </div>

                {/* Coin Balance Card */}
                <div
                    onClick={() => router.push('/wallet')}
                    className="glass-medium rounded-xl p-4 border border-[var(--border-medium)] cursor-pointer hover:bg-white/5 transition-all duration-250 hover:-translate-y-0.5"
                >
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="p-3 rounded-full bg-yellow-500/20">
                                <Coins className="text-yellow-500" size={24} />
                            </div>
                            <div>
                                <p className="text-sm text-[var(--text-muted)]">Coin Balance</p>
                                <p className="text-2xl font-bold text-[var(--text-primary)]">
                                    {user.coinBalance.toLocaleString()}
                                </p>
                            </div>
                        </div>
                        <ChevronRight className="text-[var(--text-muted)]" size={20} />
                    </div>
                </div>

                {/* Upgrade to Premium (if not premium) */}
                {!user.isPremium && (
                    <div
                        onClick={() => router.push('/wallet')}
                        className="relative overflow-hidden rounded-xl p-6 cursor-pointer hover:-translate-y-1 transition-all duration-250"
                        style={{
                            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
                            border: '1px solid rgba(139, 92, 246, 0.3)',
                        }}
                    >
                        {/* Shimmer */}
                        <div
                            className="absolute inset-0 opacity-30"
                            style={{
                                background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
                                backgroundSize: '200% 100%',
                                animation: 'shimmer 3s linear infinite',
                            }}
                        />

                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-full bg-gradient-accent">
                                    <Crown className="text-white" size={24} />
                                </div>
                                <div>
                                    <p className="font-semibold text-gradient text-lg">Upgrade to Premium</p>
                                    <p className="text-xs text-[var(--text-secondary)]">Unlimited AI conversations</p>
                                </div>
                            </div>
                            <ChevronRight className="text-[var(--accent-purple)]" size={20} />
                        </div>
                    </div>
                )}

                {/* Menu Items */}
                <div className="space-y-2">
                    {menuItems.map((item, index) => (
                        <button
                            key={index}
                            onClick={item.onClick}
                            className={cn(
                                'w-full glass-medium rounded-xl p-4',
                                'border border-[var(--border-medium)]',
                                'transition-all duration-250',
                                'hover:bg-white/5 active:scale-98',
                                'flex items-center justify-between',
                                item.danger && 'hover:border-red-500/30'
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    'p-2 rounded-lg',
                                    item.danger ? 'bg-red-500/10' : 'bg-[var(--bg-tertiary)]'
                                )}>
                                    <item.icon
                                        className={item.danger ? 'text-red-500' : 'text-[var(--text-secondary)]'}
                                        size={20}
                                    />
                                </div>
                                <div className="text-left">
                                    <p className={cn(
                                        'font-medium',
                                        item.danger ? 'text-red-500' : 'text-[var(--text-primary)]'
                                    )}>
                                        {item.label}
                                    </p>
                                    <p className="text-xs text-[var(--text-muted)]">
                                        {item.description}
                                    </p>
                                </div>
                            </div>
                            <ChevronRight
                                className={item.danger ? 'text-red-500/50' : 'text-[var(--text-muted)]'}
                                size={20}
                            />
                        </button>
                    ))}
                </div>

                {/* App Info */}
                <div className="text-center pt-4">
                    <p className="text-xs text-[var(--text-muted)]">
                        CreatorAI v1.0.0
                    </p>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                        Made with ❤️ for amazing conversations
                    </p>
                </div>
            </div>

            <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
      `}</style>
        </div>
    );
}
