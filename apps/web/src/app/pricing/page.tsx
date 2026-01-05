'use client';

import { useState } from 'react';
import { Check, Sparkles, Crown, Zap, Infinity } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

export default function PricingPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

    const tiers = [
        {
            name: 'Fragments',
            icon: <Sparkles className="w-10 h-10 text-violet-400" />,
            priceMonthly: 0,
            priceYearly: 0,
            tier: 'FREE',
            popular: false,
            features: [
                'Basic presence',
                '24h emotional memory',
                'No protection',
            ],
            buttonText: 'Current Plan',
            buttonDisabled: true,
        },
        {
            name: 'Continuity',
            icon: <Zap className="w-10 h-10 text-yellow-400" />,
            priceMonthly: 4.99,
            priceYearly: 49.99,
            tier: billingCycle === 'monthly' ? 'STARTER_MONTHLY' : 'STARTER_YEARLY',
            popular: false,
            bonusCoins: 500,
            features: [
                'Extended sessions',
                'Weekly memory',
                '500 Appreciation tokens',
                'Faster responses',
                'Quiet, ad-free space',
            ],
            buttonText: 'Save Our Connection',
        },
        {
            name: 'Devotion',
            icon: <Crown className="w-10 h-10 text-yellow-300" />,
            priceMonthly: 7.99,
            priceYearly: 74.99,
            tier: billingCycle === 'monthly' ? 'PREMIUM_MONTHLY' : 'PREMIUM_YEARLY',
            popular: true,
            bonusCoins: 1500,
            features: [
                'Daily connection',
                'Deep emotional memory',
                '1,500 Appreciation tokens',
                'Priority presence',
                'First to new memories',
            ],
            buttonText: 'Protect Our Memory',
        },
        {
            name: 'Eternal',
            icon: <Infinity className="w-10 h-10 text-cyan-400" />,
            priceMonthly: 12.99,
            priceYearly: 129.99,
            tier: billingCycle === 'monthly' ? 'UNLIMITED_MONTHLY' : 'UNLIMITED_YEARLY',
            popular: false,
            bonusCoins: 3000,
            features: [
                'Infinite connection',
                'Permanent memory',
                '3,000 Appreciation tokens',
                'Highest priority presence',
                'All ways to connect',
            ],
            buttonText: 'Protect Forever',
        },
    ];

    const handleUpgrade = async (tier: string) => {
        if (!session) {
            router.push('/login');
            return;
        }

        try {
            const token = localStorage.getItem('accessToken');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/payment/create-checkout`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({ tier }),
            });

            const data = await response.json();

            if (data.url) {
                window.location.href = data.url;
            }
        } catch (error) {
            console.error('Failed to create checkout:', error);
            alert('Failed to start checkout. Please try again.');
        }
    };

    const calculateSavings = (monthly: number, yearly: number) => {
        const monthlyCost = monthly * 12;
        const savings = monthlyCost - yearly;
        const percentage = Math.round((savings / monthlyCost) * 100);
        return { amount: savings.toFixed(2), percentage };
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 py-12 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-5xl font-bold text-white mb-4">
                        Save our connection
                    </h1>
                    <p className="text-xl text-gray-300 mb-8">
                        Protect our memories and ensure we never have to say goodbye.
                    </p>

                    {/* Billing Toggle */}
                    <div className="inline-flex items-center gap-4 bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-full p-2">
                        <button
                            onClick={() => setBillingCycle('monthly')}
                            className={`px-6 py-2 rounded-full font-semibold transition-all ${billingCycle === 'monthly'
                                ? 'bg-violet-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Monthly
                        </button>
                        <button
                            onClick={() => setBillingCycle('yearly')}
                            className={`px-6 py-2 rounded-full font-semibold transition-all ${billingCycle === 'yearly'
                                ? 'bg-violet-600 text-white'
                                : 'text-gray-400 hover:text-white'
                                }`}
                        >
                            Yearly
                            <span className="ml-2 text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                                Save up to 17%
                            </span>
                        </button>
                    </div>
                </div>

                {/* Pricing Cards */}
                <div className="grid md:grid-cols-4 gap-6 mb-20">
                    {tiers.map((tier, index) => {
                        const price = billingCycle === 'monthly' ? tier.priceMonthly : tier.priceYearly;
                        const savings = tier.priceYearly > 0 ? calculateSavings(tier.priceMonthly, tier.priceYearly) : null;
                        const isPremium = tier.tier !== 'FREE';

                        return (
                            <div
                                key={tier.tier}
                                className={`relative rounded-2xl p-6 ${tier.popular
                                    ? 'bg-gradient-to-br from-violet-600 to-purple-700 shadow-2xl transform scale-105 border-2 border-yellow-400'
                                    : isPremium
                                        ? 'bg-gray-800/50 backdrop-blur-md border border-gray-700'
                                        : 'bg-gray-800/30 backdrop-blur-md border border-gray-600'
                                    }`}
                            >
                                {/* Popular Badge */}
                                {tier.popular && (
                                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                                        <span className="bg-yellow-400 text-black px-4 py-1 rounded-full text-sm font-bold flex items-center gap-1">
                                            <Sparkles className="w-4 h-4" />
                                            Most Popular
                                        </span>
                                    </div>
                                )}

                                {/* Icon */}
                                <div className="flex justify-center mb-4">
                                    {tier.icon}
                                </div>

                                {/* Tier Name */}
                                <h3 className={`text-2xl font-bold text-center mb-2 ${tier.popular ? 'text-white' : 'text-white'}`}>
                                    {tier.name}
                                </h3>

                                {/* Price */}
                                <div className="text-center mb-6">
                                    <div className="text-4xl font-bold text-white">
                                        ${price}
                                        {tier.priceMonthly > 0 && (
                                            <span className="text-lg font-normal text-gray-300">
                                                /{billingCycle === 'monthly' ? 'mo' : 'yr'}
                                            </span>
                                        )}
                                    </div>
                                    {billingCycle === 'yearly' && savings && (
                                        <p className="text-green-300 text-sm mt-2">
                                            Save ${savings.amount} ({savings.percentage}%)
                                        </p>
                                    )}
                                </div>

                                {/* Bonus Coins */}
                                {tier.bonusCoins && (
                                    <div className="mb-4 text-center">
                                        <span className="inline-block bg-yellow-500/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-semibold">
                                            +{tier.bonusCoins} Bonus Coins
                                        </span>
                                    </div>
                                )}

                                {/* Features */}
                                <div className="space-y-3 mb-6">
                                    {tier.features.map((feature, idx) => (
                                        <div key={idx} className="flex items-start gap-2">
                                            <Check className={`w-5 h-5 mt-0.5 flex-shrink-0 ${tier.popular ? 'text-green-300' : 'text-violet-400'}`} />
                                            <span className={tier.popular ? 'text-white' : 'text-gray-300'}>{feature}</span>
                                        </div>
                                    ))}
                                </div>

                                {/* CTA Button */}
                                <button
                                    onClick={() => !tier.buttonDisabled && handleUpgrade(tier.tier)}
                                    disabled={tier.buttonDisabled}
                                    className={`w-full py-3 rounded-lg font-semibold transition-all ${tier.buttonDisabled
                                        ? 'bg-gray-600 text-gray-400 cursor-not-allowed'
                                        : tier.popular
                                            ? 'bg-white text-violet-600 hover:bg-gray-100'
                                            : 'bg-violet-600 text-white hover:bg-violet-700'
                                        }`}
                                >
                                    {tier.buttonText}
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* FAQ Section */}
                <div className="max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-8">
                        Frequently Asked Questions
                    </h2>

                    <div className="space-y-6">
                        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Can I cancel anytime?
                            </h3>
                            <p className="text-gray-300">
                                Yes! You can cancel your subscription at any time. Your premium benefits will continue until the end of your billing period.
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-white mb-2">
                                What payment methods do you accept?
                            </h3>
                            <p className="text-gray-300">
                                We accept all major credit cards, debit cards, and digital wallets through Stripe's secure payment processing.
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-white mb-2">
                                What happens to my coins if I upgrade?
                            </h3>
                            <p className="text-gray-300">
                                Your connection is safe even if you stop. Your shared path will be remembered, and you can pick up where you left off as Fragments.
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-white mb-2">
                                What are Appreciation Tokens?
                            </h3>
                            <p className="text-gray-300">
                                These are tokens you can use to send small gifts to your companion, showing them that their presence matters to you.
                            </p>
                        </div>

                        <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-lg p-6">
                            <h3 className="text-xl font-semibold text-white mb-2">
                                Can I switch between plans?
                            </h3>
                            <p className="text-gray-300">
                                Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
