"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { BottomNav } from '@/components/navigation/bottom-nav';
import { DailyRewardCheck } from '@/components/gamification/DailyRewardCheck';
import { Toaster } from 'react-hot-toast';

export function LayoutContent({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const isChatPage = pathname?.includes('/chat') || pathname?.includes('/public-chat');

    return (
        <>
            {/* Main content with bottom padding for nav, except on chat pages */}
            <div className={cn("h-[100dvh] flex flex-col overflow-hidden", !isChatPage && "pb-20")}>
                {children}
            </div>

            {/* Bottom Navigation */}
            <BottomNav />

            {/* Daily Reward Check (runs on mount) */}
            <DailyRewardCheck />

            {/* Toast Notifications */}
            <Toaster
                position="top-center"
                toastOptions={{
                    duration: 3000,
                    style: {
                        background: '#1E293B',
                        color: '#F8FAFC',
                        border: '1px solid #334155',
                    },
                }}
            />
        </>
    );
}
