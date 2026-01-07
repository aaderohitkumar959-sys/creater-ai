import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'react-hot-toast';

export function useCoins() {
    const { user } = useAuth();
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    const fetchBalance = useCallback(async () => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coin/balance/${user.uid}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await res.json();
            setBalance(data.balance);
        } catch (error) {
            console.error('Failed to fetch balance:', error);
        } finally {
            setLoading(false);
        }
    }, [user]);

    useEffect(() => {
        fetchBalance();
    }, [fetchBalance]);

    const spendCoins = async (amount: number, description: string) => {
        if (!user) return;
        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/coin/spend`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ amount, description }),
            });

            if (!res.ok) throw new Error('Failed to spend coins');

            setBalance((prev) => prev - amount);
            return true;
        } catch (error) {
            console.error('Spend error:', error);
            throw error;
        }
    };

    const buyCoins = async (packId: string, price: number) => {
        // Placeholder for payment gateway integration
        console.log(`Buying pack ${packId} for ${price}`);

        // Simulate successful purchase for demo
        setTimeout(() => {
            const coinsToAdd = packId === 'small' ? 100 : packId === 'medium' ? 500 : 1200;
            setBalance(prev => prev + coinsToAdd);
        }, 1000);

        return true;
    };

    return {
        balance,
        loading,
        spendCoins,
        buyCoins,
        refreshBalance: fetchBalance,
    };
}
