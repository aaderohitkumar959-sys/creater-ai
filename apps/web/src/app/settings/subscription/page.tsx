'use client';

import { useState, useEffect } from 'react';
import { CreditCard, Calendar, AlertCircle, Check, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Subscription {
    tier: string;
    status: string;
    currentPeriodEnd: string;
    cancelAtPeriodEnd: boolean;
}

export default function SubscriptionManagementPage() {
    const router = useRouter();
    const [subscription, setSubscription] = useState<Subscription | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchSubscription();
    }, []);

    const fetchSubscription = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/subscription/status`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                },
            );
            const data = await response.json();
            setSubscription(data);
        } catch (error) {
            console.error('Failed to fetch subscription:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = async () => {
        if (
            !confirm(
                'Are you sure you want to cancel? Your subscription will remain active until the end of your billing period.',
            )
        ) {
            return;
        }

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/cancel`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            fetchSubscription();
            alert('Subscription will be canceled at the end of the billing period');
        } catch (error) {
            console.error('Failed to cancel subscription:', error);
            alert('Failed to cancel subscription');
        }
    };

    const handleReactivate = async () => {
        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/subscription/reactivate`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            fetchSubscription();
            alert('Subscription reactivated successfully');
        } catch (error) {
            console.error('Failed to reactivate subscription:', error);
            alert('Failed to reactivate subscription');
        }
    };

    const handleUpgrade = () => {
        router.push('/pricing');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading subscription...</p>
                </div>
            </div>
        );
    }

    const isFree = subscription?.tier === 'FREE';
    const isPremium = subscription?.tier === 'PREMIUM_MONTHLY' || subscription?.tier === 'PREMIUM_YEARLY';
    const isActive = subscription?.status === 'ACTIVE';

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">
                        Subscription Management
                    </h1>
                    <p className="text-gray-300">Manage your premium subscription</p>
                </div>

                {/* Current Plan */}
                <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-8 mb-6">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">
                                {isFree ? 'Free Plan' : subscription?.tier?.replace('_', ' ')}
                            </h2>
                            <div className="flex items-center gap-2">
                                {isActive ? (
                                    <>
                                        <Check className="w-5 h-5 text-green-400" />
                                        <span className="text-green-400 font-medium">Active</span>
                                    </>
                                ) : (
                                    <>
                                        <AlertCircle className="w-5 h-5 text-yellow-400" />
                                        <span className="text-yellow-400 font-medium">
                                            {subscription?.status}
                                        </span>
                                    </>
                                )}
                            </div>
                        </div>

                        {!isFree && (
                            <div className="text-right">
                                <p className="text-gray-400 text-sm mb-1">Monthly</p>
                                <p className="text-3xl font-bold text-white">
                                    ${subscription?.tier === 'PREMIUM_YEARLY' ? '8.33' : '9.99'}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Benefits */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                            <div className="text-2xl">💬</div>
                            <div>
                                <p className="text-white font-medium">
                                    {isFree ? '100' : '500'} messages/day
                                </p>
                                <p className="text-gray-400 text-sm">Daily limit</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                            <div className="text-2xl">🧠</div>
                            <div>
                                <p className="text-white font-medium">
                                    {isPremium ? 'Long-term memory' : 'Short-term only'}
                                </p>
                                <p className="text-gray-400 text-sm">AI memory</p>
                            </div>
                        </div>

                        {isPremium && (
                            <>
                                <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl">⚡</div>
                                    <div>
                                        <p className="text-white font-medium">Priority AI</p>
                                        <p className="text-gray-400 text-sm">Faster responses</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-lg">
                                    <div className="text-2xl">✨</div>
                                    <div>
                                        <p className="text-white font-medium">Ad-free</p>
                                        <p className="text-gray-400 text-sm">No advertisements</p>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Renewal Info */}
                    {isPremium && isActive && subscription?.currentPeriodEnd && (
                        <div className="flex items-center gap-2 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg mb-6">
                            <Calendar className="w-5 h-5 text-blue-400" />
                            <p className="text-blue-300">
                                {subscription.cancelAtPeriodEnd
                                    ? `Cancels on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`
                                    : `Renews on ${new Date(subscription.currentPeriodEnd).toLocaleDateString()}`}
                            </p>
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3">
                        {isFree && (
                            <button
                                onClick={handleUpgrade}
                                className="flex-1 bg-gradient-to-r from-violet-600 to-purple-600 text-white py-3 rounded-lg font-semibold hover:from-violet-700 hover:to-purple-700 transition-all"
                            >
                                Upgrade to Premium
                            </button>
                        )}

                        {isPremium && !subscription?.cancelAtPeriodEnd && (
                            <button
                                onClick={handleCancel}
                                className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                            >
                                Cancel Subscription
                            </button>
                        )}

                        {isPremium && subscription?.cancelAtPeriodEnd && (
                            <button
                                onClick={handleReactivate}
                                className="flex-1 bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                            >
                                Reactivate Subscription
                            </button>
                        )}
                    </div>
                </div>

                {/* Payment Method (Placeholder) */}
                {isPremium && (
                    <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-8">
                        <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                            <CreditCard className="w-6 h-6" />
                            Payment Method
                        </h3>

                        <div className="flex items-center gap-4 p-4 bg-gray-900/50 rounded-lg mb-4">
                            <div className="w-12 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded flex items-center justify-center text-white font-bold text-xs">
                                VISA
                            </div>
                            <div>
                                <p className="text-white font-medium">•••• •••• •••• 4242</p>
                                <p className="text-gray-400 text-sm">Expires 12/25</p>
                            </div>
                        </div>

                        <button className="text-violet-400 hover:text-violet-300 transition-colors font-medium">
                            Update Payment Method →
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
