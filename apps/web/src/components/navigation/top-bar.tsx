/**
 * Top Bar Component
 * Global header with logo, search, and notifications
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, Bell } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopBarProps {
    showSearch?: boolean;
    showNotifications?: boolean;
    className?: string;
}

export const TopBar: React.FC<TopBarProps> = ({
    showSearch = true,
    showNotifications = true,
    className,
}) => {
    const router = useRouter();
    const [scrolled, setScrolled] = useState(false);
    const [notificationCount, setNotificationCount] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        // TODO: Fetch notification count from API
        setNotificationCount(3);
    }, []);

    return (
        <header
            className={cn(
                'sticky top-0 z-40 transition-all duration-300',
                scrolled && 'glass-medium shadow-md',
                !scrolled && 'bg-transparent',
                className
            )}
            style={{
                backdropFilter: scrolled ? 'blur(15px)' : 'none',
                WebkitBackdropFilter: scrolled ? 'blur(15px)' : 'none',
            }}
        >
            <div className="container-mobile h-16 flex items-center justify-between">
                {/* Logo */}
                <div
                    className="flex items-center gap-2 cursor-pointer"
                    onClick={() => router.push('/')}
                >
                    <div className="w-8 h-8 rounded-lg bg-gradient-accent flex items-center justify-center">
                        <span className="text-white font-bold text-lg">S</span>
                    </div>
                    <span className="text-xl font-bold text-gradient hidden sm:block">
                        Syelope
                    </span>
                </div>

                {/* Right Side Actions */}
                <div className="flex items-center gap-2">
                    {/* Search Icon */}
                    {showSearch && (
                        <button
                            onClick={() => router.push('/explore')}
                            className={cn(
                                'touch-target p-2 rounded-lg',
                                'transition-all duration-250',
                                'hover:bg-white/5 active:scale-95',
                                'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            )}
                            aria-label="Search"
                        >
                            <Search size={22} />
                        </button>
                    )}


                    {/* Notifications Icon */}
                    {showNotifications && (
                        <button
                            onClick={() => router.push('/notifications')}
                            className={cn(
                                'touch-target p-2 rounded-lg relative',
                                'transition-all duration-250',
                                'hover:bg-white/5 active:scale-95',
                                'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                            )}
                            aria-label="Notifications"
                        >
                            <Bell size={22} />

                            {/* Notification Badge */}
                            {notificationCount > 0 && (
                                <div className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-red-500 flex items-center justify-center">
                                    <span className="text-[10px] font-bold text-white">
                                        {notificationCount > 9 ? '9+' : notificationCount}
                                    </span>
                                </div>
                            )}
                        </button>
                    )}

                    {/* Login Button */}
                    <button
                        onClick={() => router.push('/login')}
                        className={cn(
                            'px-4 py-2 rounded-lg font-semibold',
                            'bg-gradient-accent text-white',
                            'transition-all duration-250',
                            'hover:opacity-90 active:scale-95',
                            'shadow-lg shadow-blue-500/20'
                        )}
                    >
                        Login
                    </button>
                </div>
            </div>
        </header>
    );
};
