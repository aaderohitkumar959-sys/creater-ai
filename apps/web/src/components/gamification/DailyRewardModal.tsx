import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Coins, Flame } from 'lucide-react';

interface DailyRewardModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    streak: number;
    reward: number;
    onClaim: () => void;
    loading: boolean;
}

export const DailyRewardModal: React.FC<DailyRewardModalProps> = ({
    open,
    onOpenChange,
    streak,
    reward,
    onClaim,
    loading
}) => {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md text-center overflow-hidden">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                        <div className="animate-pulse">
                            <Flame className="text-orange-500 fill-orange-500" />
                        </div>
                        Daily Login Bonus
                    </DialogTitle>
                    <DialogDescription>
                        Keep your streak alive to earn more coins!
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <div className="relative">
                        <div className="absolute inset-0 bg-yellow-500/20 blur-xl rounded-full animate-pulse" />
                        <div className="animate-bounce">
                            <Coins className="w-24 h-24 text-yellow-500 relative z-10" />
                        </div>
                    </div>

                    <div className="space-y-1 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="text-4xl font-black text-primary">{reward}</div>
                        <div className="text-sm font-medium text-muted-foreground">COINS</div>
                    </div>

                    <div className="flex items-center gap-2 bg-muted px-4 py-2 rounded-full animate-in zoom-in duration-500 delay-150">
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-bold">{streak} Day Streak</span>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center">
                    <Button size="lg" className="w-full sm:w-auto px-8" onClick={onClaim} disabled={loading}>
                        {loading ? "Claiming..." : "Claim Reward"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
