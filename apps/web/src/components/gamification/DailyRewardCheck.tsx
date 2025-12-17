'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { DailyRewardModal } from './DailyRewardModal';

export const DailyRewardCheck: React.FC = () => {
    const { data: session } = useSession();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const checkDailyReward = async () => {
            if (!session?.user?.id) return;

            // Don't check if we already checked this session
            if (sessionStorage.getItem('daily_reward_checked')) return;

            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/gamification/daily-reward/status`,
                    {
                        headers: {
                            Authorization: `Bearer ${(session.user as any).accessToken || ''}`,
                        },
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    // Show modal if user can claim
                    if (data.canClaim) {
                        setShowModal(true);
                    }
                    sessionStorage.setItem('daily_reward_checked', 'true');
                }
            } catch (error) {
                console.error('Failed to check daily reward:', error);
            }
        };

        checkDailyReward();
    }, [session]);

    if (!showModal) return null;

    return <DailyRewardModal onClose={() => setShowModal(false)} />;
};
