'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DailyRewardModal } from './DailyRewardModal';
import { toast } from 'react-hot-toast';
import { useCoins } from '@/hooks/useCoins';

export const DailyRewardCheck: React.FC = () => {
    const { data: session } = useSession();
    const { refreshBalance } = useCoins();
    const [open, setOpen] = useState(false);
    const [status, setStatus] = useState<any>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            if (!session?.user?.id) return;

            // Don't check if we already checked this session (optimization)
            if (sessionStorage.getItem('daily_checked')) return;

            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quests/daily`, {
                    headers: { 'Authorization': `Bearer ${session.user.accessToken || ''}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    if (data.canClaim) {
                        setStatus(data);
                        setOpen(true);
                    }
                    sessionStorage.setItem('daily_checked', 'true');
                }
            } catch (error) {
                console.error('Failed to check daily reward:', error);
            }
        };

        checkStatus();
    }, [session]);

    const handleClaim = async () => {
        setLoading(true);
        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/quests/daily/claim`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${session?.user?.accessToken || ''}` }
            });

            if (res.ok) {
                const data = await res.json();
                toast.success(data.message);
                setOpen(false);
                refreshBalance();
            } else {
                toast.error("Failed to claim reward");
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    if (!status) return null;

    return (
        <DailyRewardModal
            open={open}
            onOpenChange={setOpen}
            streak={status.streak}
            reward={status.rewardAmount}
            onClaim={handleClaim}
            loading={loading}
        />
    );
};
