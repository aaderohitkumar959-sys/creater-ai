import React from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Gift, Coffee, Gem, Crown } from 'lucide-react';
import { useCoins } from '@/hooks/useCoins';
import { toast } from 'react-hot-toast';

const GIFTS = [
    { id: 'coffee', name: 'Coffee', cost: 10, icon: Coffee, color: 'text-amber-700' },
    { id: 'rose', name: 'Rose', cost: 50, icon: Gift, color: 'text-red-500' },
    { id: 'gem', name: 'Gem', cost: 100, icon: Gem, color: 'text-blue-500' },
    { id: 'crown', name: 'Crown', cost: 500, icon: Crown, color: 'text-yellow-500' },
];

interface GiftSelectorProps {
    onSendGift: (giftId: string, cost: number) => Promise<void>;
    disabled?: boolean;
}

export const GiftSelector: React.FC<GiftSelectorProps> = ({ onSendGift, disabled }) => {
    const { balance } = useCoins();

    const handleSend = async (gift: typeof GIFTS[0]) => {
        if (balance < gift.cost) {
            toast.error(`Not enough coins! Need ${gift.cost - balance} more.`);
            return;
        }

        try {
            await onSendGift(gift.id, gift.cost);
            toast.success(`Sent ${gift.name}!`);
        } catch (error) {
            toast.error("Failed to send gift");
        }
    };

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" disabled={disabled} className="text-pink-500 hover:text-pink-600 hover:bg-pink-50">
                    <Gift className="h-5 w-5" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-2" align="end">
                <div className="grid grid-cols-2 gap-2">
                    {GIFTS.map((gift) => (
                        <button
                            key={gift.id}
                            onClick={() => handleSend(gift)}
                            className="flex flex-col items-center justify-center gap-1 rounded-lg border p-3 hover:bg-muted transition-colors"
                        >
                            <gift.icon className={`h-6 w-6 ${gift.color}`} />
                            <span className="text-xs font-medium">{gift.name}</span>
                            <span className="text-[10px] text-muted-foreground">{gift.cost} coins</span>
                        </button>
                    ))}
                </div>
                <div className="mt-2 text-center text-xs text-muted-foreground border-t pt-2">
                    Balance: {balance} coins
                </div>
            </PopoverContent>
        </Popover>
    );
};
