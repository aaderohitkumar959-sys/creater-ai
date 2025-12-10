import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Coins } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCoins } from '@/hooks/useCoins';

interface CoinPurchaseModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const COIN_PACKS = [
    { id: 'small', coins: 100, price: 49, label: 'Starter Stash' },
    { id: 'medium', coins: 500, price: 199, label: 'Popular Choice', popular: true },
    { id: 'large', coins: 1200, price: 499, label: 'Best Value', bonus: '20% Bonus' },
];

export const CoinPurchaseModal: React.FC<CoinPurchaseModalProps> = ({ isOpen, onClose }) => {
    const [loading, setLoading] = useState<string | null>(null);
    const { buyCoins } = useCoins();

    const handlePurchase = async (packId: string, price: number) => {
        setLoading(packId);
        try {
            // Logic to initiate payment gateway (Stripe/Razorpay)
            await buyCoins(packId, price);
            toast.success("Coins added to your wallet!");
            onClose();
        } catch (error) {
            toast.error("Purchase failed. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] bg-card text-card-foreground border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Coins className="w-5 h-5 text-yellow-500" />
                        Top Up Coins
                    </DialogTitle>
                    <DialogDescription>
                        Use coins to unlock premium messages, gifts, and more.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 py-4">
                    {COIN_PACKS.map((pack) => (
                        <div
                            key={pack.id}
                            className={`relative border rounded-xl p-4 flex flex-col items-center justify-between hover:border-primary transition-colors ${pack.popular ? 'border-primary bg-primary/5' : 'border-border'}`}
                        >
                            {pack.popular && (
                                <div className="absolute -top-3 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full">
                                    Most Popular
                                </div>
                            )}
                            {pack.bonus && (
                                <div className="absolute -top-3 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                                    {pack.bonus}
                                </div>
                            )}

                            <div className="text-center mt-2">
                                <div className="text-2xl font-bold text-yellow-500 flex items-center justify-center gap-1">
                                    <Coins className="w-4 h-4" />
                                    {pack.coins}
                                </div>
                                <div className="text-sm font-medium text-muted-foreground">{pack.label}</div>
                            </div>

                            <Button
                                onClick={() => handlePurchase(pack.id, pack.price)}
                                disabled={!!loading}
                                className="w-full mt-4"
                                variant={pack.popular ? "default" : "outline"}
                            >
                                {loading === pack.id ? <Loader2 className="w-4 h-4 animate-spin" /> : `₹${pack.price}`}
                            </Button>
                        </div>
                    ))}
                </div>
            </DialogContent>
        </Dialog>
    );
};
