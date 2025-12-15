/**
 * Coin Packs Component
 * Purchase options with value highlights
 */

'use client';

import React from 'react';
import { Coins, TrendingUp } from 'lucide-react';
import { cn } from '@/lib/utils';

interface CoinPack {
    id: string;
    amount: number;
    price: number;
    bonus?: number;
    popular?: boolean;
    bestValue?: boolean;
}

const coinPacks: CoinPack[] = [
    {
        id: 'starter',
        amount: 100,
        price: 4.99,
    },
    {
        id: 'popular',
        amount: 500,
        price: 19.99,
        bonus: 50,
        popular: true,
    },
    {
        id: 'best',
        amount: 1000,
        price: 34.99,
        bonus: 200,
        bestValue: true,
    },
    {
        id: 'mega',
        amount: 2500,
        price: 79.99,
        bonus: 500,
    },
];

interface CoinPacksProps {
    onPurchase?: (packId: string) => void;
}

export const CoinPacks: React.FC<CoinPacksProps> = ({ onPurchase }) => {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                    Buy Coins
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                    2 coins per message
                </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {coinPacks.map((pack) => (
                    <CoinPackCard
                        key={pack.id}
                        pack={pack}
                        onClick={() => onPurchase?.(pack.id)}
                    />
                ))}
            </div>

            {/* Helper text */}
            <p className="text-xs text-[var(--text-secondary)] text-center mt-4">
                💬 Continue chatting with your favorite AI personalities
            </p>
        </div>
    );
};

// Coin Pack Card
interface CoinPackCardProps {
    pack: CoinPack;
    onClick: () => void;
}

const CoinPackCard: React.FC<CoinPackCardProps> = ({ pack, onClick }) => {
    const totalCoins = pack.amount + (pack.bonus || 0);

    return (
        <div
            onClick={onClick}
            className={cn(
                'relative overflow-hidden rounded-xl p-4',
                'glass-medium border transition-all duration-250 cursor-pointer',
                'hover:bg-white/5 hover:-translate-y-1 hover:shadow-lg',
                'active:scale-98',
                pack.popular && 'border-[var(--accent-blue)]',
                pack.bestValue && 'border-[var(--accent-purple)]',
                !pack.popular && !pack.bestValue && 'border-[var(--border-medium)]'
            )}
        >
            {/* Badge */}
            {(pack.popular || pack.bestValue) && (
                <div className="absolute top-2 right-2">
                    <span
                        className={cn(
                            'px-2 py-1 rounded-full text-[10px] font-bold uppercase',
                            pack.popular && 'bg-[var(--accent-blue)] text-white',
                            pack.bestValue && 'bg-gradient-accent text-white'
                        )}
                    >
                        {pack.popular && 'Popular'}
                        {pack.bestValue && 'Best Value'}
                    </span>
                </div>
            )}

            {/* Icon */}
            <div className="flex items-center gap-3 mb-3">
                <div
                    className={cn(
                        'p-3 rounded-full',
                        pack.bestValue && 'bg-gradient-accent',
                        pack.popular && 'bg-[var(--accent-blue)]',
                        !pack.popular && !pack.bestValue && 'bg-[var(--bg-tertiary)]'
                    )}
                >
                    <Coins className="text-white" size={24} />
                </div>
                <div>
                    <p className="text-2xl font-bold text-[var(--text-primary)]">
                        {totalCoins.toLocaleString()}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">coins</p>
                </div>
            </div>

            {/* Bonus */}
            {pack.bonus && (
                <div className="flex items-center gap-1 mb-2">
                    <TrendingUp size={14} className="text-green-500" />
                    <span className="text-xs font-medium text-green-500">
                        +{pack.bonus} bonus coins
                    </span>
                </div>
            )}

            {/* Price */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--border-subtle)]">
                <span className="text-sm text-[var(--text-secondary)]">
                    {(totalCoins / 2).toLocaleString()} messages
                </span>
                <span className="text-lg font-bold text-[var(--text-primary)]">
                    ${pack.price.toFixed(2)}
                </span>
            </div>
        </div>
    );
};
