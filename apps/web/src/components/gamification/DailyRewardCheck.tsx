'use client';

import React, { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { DailyRewardModal } from './DailyRewardModal';

export const DailyRewardCheck: React.FC = () => {
    const { user } = useAuth();
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const checkDailyReward = async () => {
            if (!user?.uid) return;

            // Don't check if we already checked this session
            if (sessionStorage.getItem('daily_reward_checked')) return;

            try {
                const token = await user.getIdToken();
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/gamification/daily-reward/status`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
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
    }, [user]);

    if (!showModal) return null;

    return <DailyRewardModal onClose={() => setShowModal(false)} />;
};
