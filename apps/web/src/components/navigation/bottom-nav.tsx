/**
 * Bottom Navigation Bar
 * Instagram/Telegram style mobile-first navigation
 */

'use client';

import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Home, Search, MessageCircle, Wallet, User } from 'lucide-react';
import { cn } from '@/lib/utils';
// import { useSession } from 'next-auth/react';

// MOCK USE SESSION
const useSession = () => {
    return {
        data: null,
        status: 'unauthenticated'
    };
};

interface NavItem {
    id: string;
    label: string;
    icon: React.ReactNode;
    href: string;
    activePattern: RegExp;
}

const navItems: NavItem[] = [
    {
        id: 'home',
        label: 'Home',
        icon: <Home />,
        href: '/',
        activePattern: /^\/$/,
    },
    {
        id: 'explore',
        label: 'Explore',
        icon: <Search />,
        href: '/explore',
        activePattern: /^\/explore/,
    },
    {
        id: 'messages',
        label: 'Messages',
        icon: <MessageCircle />,
        href: '/messages',
        activePattern: /^\/(messages|chat|public-chat)/,
    },
    {
        id: 'wallet',
        label: 'Wallet',
        icon: <Wallet />,
        href: '/wallet',
        activePattern: /^\/wallet/,
    },
    {
        id: 'profile',
        label: 'Profile',
        icon: <User />,
        href: '/profile',
        activePattern: /^\/profile/,
    },
];

export const BottomNav: React.FC = () => {
    const pathname = usePathname();
    const router = useRouter();
    const { data: session } = useSession();

    const handleNavClick = (href: string) => {
        router.push(href);
    };

    const isActive = (item: NavItem): boolean => {
        return item.activePattern.test(pathname || '/');
    };

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50 safe-bottom glass-medium border-t border-[var(--border-medium)]"
            style={{
                background: 'var(--bg-glass)',
                backdropFilter: 'blur(15px)',
                WebkitBackdropFilter: 'blur(15px)',
            }}
        >
            <div className="flex items-center justify-around h-16">
                {navItems.map((item) => {
                    const active = isActive(item);

                    // Customize label for Profile
                    let displayLabel = item.label;
                    if (item.id === 'profile' && session?.user?.name) {
                        displayLabel = session.user.name.split(' ')[0];
                    }

                    return (
                        <button
                            key={item.id}
                            onClick={() => handleNavClick(item.href)}
                            className={cn(
                                'flex flex-col items-center justify-center',
                                'touch-target w-full h-full',
                                'transition-all duration-250',
                                'hover:bg-white/5',
                                'active:scale-95',
                                active && 'text-[var(--accent-blue)]',
                                !active && 'text-[var(--text-secondary)]'
                            )}
                            aria-label={displayLabel}
                        >
                            {/* Icon with glow effect when active */}
                            <div
                                className={cn(
                                    'relative mb-1 transition-all duration-250',
                                    active && 'scale-110'
                                )}
                                style={{
                                    filter: active ? 'drop-shadow(0 0 8px rgba(59, 130, 246, 0.6))' : 'none',
                                }}
                            >
                                <div style={{ width: 24, height: 24 }}>
                                    {item.id === 'profile' && session?.user?.image ? (
                                        <div className={cn(
                                            "w-6 h-6 rounded-full overflow-hidden border",
                                            active ? "border-[var(--accent-blue)]" : "border-[var(--border-medium)]"
                                        )}>
                                            <img src={session.user.image} alt="U" className="w-full h-full object-cover" />
                                        </div>
                                    ) : (
                                        React.cloneElement(item.icon as React.ReactElement, {
                                            size: 24,
                                            strokeWidth: active ? 2.5 : 2,
                                        } as any)
                                    )}
                                </div>

                                {/* Active indicator dot */}
                                {active && (
                                    <div
                                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[var(--accent-blue)]"
                                        style={{
                                            boxShadow: '0 0 6px rgba(59, 130, 246, 0.8)',
                                        }}
                                    />
                                )}
                            </div>

                            {/* Label */}
                            <span
                                className={cn(
                                    'text-[10px] font-medium transition-all duration-250 truncate w-full text-center px-1',
                                    active && 'font-semibold'
                                )}
                            >
                                {displayLabel}
                            </span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
};
