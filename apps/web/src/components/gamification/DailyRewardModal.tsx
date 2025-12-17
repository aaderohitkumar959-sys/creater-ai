'use client';

import { useState, useEffect } from 'react';
import { Gift, Flame, Calendar, Trophy } from 'lucide-react';

interface DailyRewardStatus {
    canClaim: boolean;
    currentStreak: number;
    nextRewardAt: Date | null;
    potentialReward: number;
}

interface StreakDay {
    date: string;
    claimed: boolean;
    dayNumber: number;
}

export function DailyRewardModal({ onClose }: { onClose: () => void }) {
    const [status, setStatus] = useState<DailyRewardStatus | null>(null);
    const [calendar, setCalendar] = useState<StreakDay[]>([]);
    const [claiming, setClaiming] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const [claimedCoins, setClaimedCoins] = useState(0);

    useEffect(() => {
        fetchStatus();
        fetchCalendar();
    }, []);

    const fetchStatus = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/gamification/daily-reward/status`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                },
            );
            const data = await response.json();
            setStatus(data);
        } catch (error) {
            console.error('Failed to fetch daily reward status:', error);
        }
    };

    const fetchCalendar = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/gamification/daily-reward/calendar`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                },
            );
            const data = await response.json();
            setCalendar(data.days || []);
        } catch (error) {
            console.error('Failed to fetch calendar:', error);
        }
    };

    const handleClaim = async () => {
        setClaiming(true);
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/gamification/daily-reward/claim`,
                {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                },
            );

            const data = await response.json();

            if (data.success) {
                setClaimedCoins(data.coinsGranted);
                setShowSuccess(true);

                // Refresh status after claim
                setTimeout(() => {
                    fetchStatus();
                    fetchCalendar();
                }, 2000);
            } else {
                alert(data.message);
            }
        } catch (error) {
            console.error('Failed to claim reward:', error);
            alert('Failed to claim reward. Please try again.');
        } finally {
            setClaiming(false);
        }
    };

    if (!status) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
                <div className="bg-gray-800 rounded-2xl p-8">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
                </div>
            </div>
        );
    }

    if (showSuccess) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="mb-6">
                        <Trophy className="w-20 h-20 mx-auto text-yellow-300 animate-bounce" />
                    </div>

                    <h2 className="text-3xl font-bold text-white mb-4">
                        Reward Claimed!
                    </h2>

                    <div className="bg-white/20 backdrop-blur-md rounded-xl p-6 mb-6">
                        <p className="text-6xl font-bold text-yellow-300 mb-2">
                            +{claimedCoins}
                        </p>
                        <p className="text-white text-lg">Coins Added</p>
                    </div>

                    <button
                        onClick={onClose}
                        className="w-full bg-white text-violet-600 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                    >
                        Awesome!
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-violet-600 to-purple-600 p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                            <Gift className="w-8 h-8" />
                            Daily Reward
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                    </div>

                    {/* Streak */}
                    <div className="flex items-center gap-2 text-white">
                        <Flame className="w-6 h-6 text-orange-400" />
                        <span className="text-lg font-semibold">
                            {status.currentStreak} Day Streak!
                        </span>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 space-y-6">
                    {/* Calendar */}
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <Calendar className="w-5 h-5 text-violet-400" />
                            <h3 className="text-white font-semibold">Last 7 Days</h3>
                        </div>

                        <div className="grid grid-cols-7 gap-2">
                            {calendar.map((day) => (
                                <div
                                    key={day.date}
                                    className={`aspect-square rounded-lg flex items-center justify-center ${day.claimed
                                            ? 'bg-violet-600'
                                            : 'bg-gray-800 border border-gray-700'
                                        }`}
                                >
                                    <span className="text-xs text-white font-medium">
                                        D{day.dayNumber}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Reward Info */}
                    <div className="bg-gray-800 rounded-xl p-4">
                        <div className="text-center">
                            <p className="text-gray-400 mb-2">Today's Reward</p>
                            <p className="text-4xl font-bold text-violet-400">
                                {status.potentialReward} Coins
                            </p>
                            {status.currentStreak >= 7 && (
                                <p className="text-green-400 text-sm mt-2">
                                    🔥 Streak Bonus Active!
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Claim Button */}
                    {status.canClaim ? (
                        <button
                            onClick={handleClaim}
                            disabled={claiming}
                            className={`w-full py-4 rounded-xl font-semibold text-lg transition-all ${claiming
                                    ? 'bg-gray-600 cursor-not-allowed'
                                    : 'bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-700 hover:to-purple-700 text-white shadow-lg hover:shadow-violet-500/50'
                                }`}
                        >
                            {claiming ? 'Claiming...' : 'Claim Reward'}
                        </button>
                    ) : (
                        <div className="text-center">
                            <p className="text-gray-400 mb-2">Come back tomorrow!</p>
                            <p className="text-white font-semibold">
                                Next reward available at{' '}
                                {status.nextRewardAt &&
                                    new Date(status.nextRewardAt).toLocaleTimeString()}
                            </p>
                        </div>
                    )}

                    {/* Milestones */}
                    <div className="bg-gray-800/50 rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-3">Streak Milestones</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">7 days</span>
                                <span className="text-green-400">2x Bonus unlocked!</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">30 days</span>
                                <span className="text-violet-400">3x Bonus unlocked!</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
