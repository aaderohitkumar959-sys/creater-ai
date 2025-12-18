/**
 * Wallet Page - Telegram Style
 * Large coin balance, premium card, and purchase options
 */

'use client';

import React, { useEffect, useState } from 'react';
import { TopBar } from '@/components/navigation/top-bar';
import { PremiumCard } from '@/components/wallet/premium-card';
import { CoinPacks } from '@/components/wallet/coin-packs';
import { Coins, TrendingUp, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { api } from '@/lib/api';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';


interface Transaction {
    id: string;
    type: 'PURCHASE' | 'SPEND' | 'EARN' | 'REWARD';
    amount: number;
    description: string;
    createdAt: Date;
}

// Mock data
const mockTransactions: Transaction[] = [
    {
        id: '1',
        type: 'PURCHASE',
        amount: 500,
        description: 'Purchased 500 coins',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24),
    },
    {
        id: '2',
        type: 'SPEND',
        amount: -20,
        description: 'Chat with Sarah the Mentor',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
    },
    {
        id: '3',
        type: 'REWARD',
        amount: 10,
        description: 'Daily login bonus',
        createdAt: new Date(Date.now() - 1000 * 60 * 30),
    },
];

export default function WalletPage() {
    const [balance, setBalance] = useState(240);
    const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
    const [isPremium, setIsPremium] = useState(false);
    const [loading, setLoading] = useState(true);

    const { data: session, status: authStatus } = useSession();
    const router = useRouter();

    useEffect(() => {
        const fetchWalletData = async () => {
            if (authStatus === 'unauthenticated') {
                setLoading(false);
                return;
            }

            if (session?.user?.id) {
                try {
                    const [walletBalance, history] = await Promise.all([
                        api.getWalletBalance(),
                        api.getTransactionHistory()
                    ]);
                    setBalance(walletBalance);
                    setTransactions(history.map((tx: any) => ({
                        id: tx.id,
                        type: tx.type,
                        amount: tx.amount,
                        description: tx.description,
                        createdAt: new Date(tx.createdAt),
                    })));
                } catch (error) {
                    console.error('Failed to fetch wallet data:', error);
                } finally {
                    setLoading(false);
                }
            }
        };

        fetchWalletData();
    }, [session, authStatus]);

    const handleUpgrade = () => {
        // TODO: Navigate to premium purchase flow
        alert('Premium upgrade flow coming soon!');
    };

    const handlePurchase = (packId: string) => {
        // TODO: Navigate to purchase flow
        alert(`Purchase pack: ${packId}`);
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <TopBar showSearch={false} />

            <div className="container-mobile pt-4 pb-8 space-y-6">
                {/* Coin Balance - Large display */}
                <div className="relative overflow-hidden rounded-2xl p-8 glass-medium border border-[var(--border-medium)]">
                    {/* Background gradient */}
                    <div
                        className="absolute inset-0 opacity-10"
                        style={{
                            background: 'radial-gradient(circle at top right, rgba(59, 130, 246, 0.5), transparent 50%)',
                        }}
                    />

                    <div className="relative z-10 text-center">
                        <p className="text-sm text-[var(--text-muted)] mb-2">Your Balance</p>
                        <div className="flex items-center justify-center gap-3 mb-2">
                            <Coins className="text-yellow-500" size={40} />
                            <h1 className="text-5xl font-bold text-gradient">
                                {balance.toLocaleString()}
                            </h1>
                        </div>
                        <p className="text-sm text-[var(--text-secondary)]">
                            ≈ {Math.floor(balance / 2)} messages remaining
                        </p>
                    </div>
                </div>

                {/* Premium Card */}
                <PremiumCard
                    isPremium={isPremium}
                    onUpgrade={handleUpgrade}
                />

                {/* Coin Packs */}
                {!isPremium && (
                    <CoinPacks onPurchase={handlePurchase} />
                )}

                {/* Transaction History */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">
                        Recent Activity
                    </h3>

                    {loading ? (
                        <div className="space-y-2">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="h-16 glass-medium rounded-xl animate-pulse" />
                            ))}
                        </div>
                    ) : transactions.length === 0 ? (
                        <div className="text-center py-12 glass-medium rounded-xl">
                            <Coins size={48} className="text-[var(--text-muted)] mx-auto mb-3" />
                            <p className="text-[var(--text-secondary)]">No transactions yet</p>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {transactions.map((tx) => (
                                <TransactionItem key={tx.id} transaction={tx} />
                            ))}
                        </div>
                    )}
                </div>

                {/* Helper info */}
                <div className="glass-light rounded-xl p-4 space-y-2">
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                        💡 How coins work
                    </p>
                    <ul className="text-xs text-[var(--text-secondary)] space-y-1 pl-4">
                        <li>• Each message costs 2 coins</li>
                        <li>• Earn free coins daily by logging in</li>
                        <li>• Premium members get unlimited messages</li>
                        <li>• Unused coins never expire</li>
                    </ul>
                </div>
            </div>
        </div>
    );
}

// Transaction Item Component
interface TransactionItemProps {
    transaction: Transaction;
}

const TransactionItem: React.FC<TransactionItemProps> = ({ transaction }) => {
    const getIcon = () => {
        switch (transaction.type) {
            case 'PURCHASE':
                return <ArrowDownLeft className="text-green-500" size={20} />;
            case 'SPEND':
                return <ArrowUpRight className="text-red-500" size={20} />;
            case 'EARN':
            case 'REWARD':
                return <TrendingUp className="text-blue-500" size={20} />;
            default:
                return <Coins className="text-[var(--text-muted)]" size={20} />;
        }
    };

    const isPositive = transaction.amount > 0;

    return (
        <div className="glass-medium rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-[var(--bg-tertiary)]">
                    {getIcon()}
                </div>
                <div>
                    <p className="text-sm font-medium text-[var(--text-primary)]">
                        {transaction.description}
                    </p>
                    <p className="text-xs text-[var(--text-muted)]">
                        {format(transaction.createdAt, 'MMM d, h:mm a')}
                    </p>
                </div>
            </div>

            <div className="text-right">
                <p
                    className={cn(
                        'text-lg font-bold',
                        isPositive ? 'text-green-500' : 'text-red-500'
                    )}
                >
                    {isPositive ? '+' : ''}{transaction.amount}
                </p>
                <p className="text-xs text-[var(--text-muted)]">coins</p>
            </div>
        </div>
    );
};
