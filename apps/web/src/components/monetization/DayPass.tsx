import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Lock } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useCoins } from '@/hooks/useCoins'; // Assuming this hook exists or will be created

interface DayPassProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export const DayPass: React.FC<DayPassProps> = ({ isOpen, onClose, onSuccess }) => {
    const [loading, setLoading] = useState(false);
    const { balance, spendCoins } = useCoins();
    const PRICE = 19; // INR or equivalent coins

    const handlePurchase = async () => {
        setLoading(true);
        try {
            // Logic to purchase day pass
            // This would likely involve an API call to deduct coins/money and grant the pass
            // For now, simulating coin deduction
            if (balance < PRICE) {
                toast.error("Insufficient balance. Please top up.");
                return;
            }

            await spendCoins(PRICE, "Day Pass Purchase");
            toast.success("Day Pass Unlocked! Enjoy unlimited chatting.");
            onSuccess();
            onClose();
        } catch (error) {
            toast.error("Failed to purchase Day Pass.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px] bg-card text-card-foreground border-border">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl">
                        <Lock className="w-5 h-5 text-primary" />
                        Unlock Unlimited Chat
                    </DialogTitle>
                    <DialogDescription>
                        You've reached your daily limit of 40 messages.
                        Unlock a 24-hour Day Pass to keep the conversation going.
                    </DialogDescription>
                </DialogHeader>

                <div className="py-6 flex flex-col items-center justify-center space-y-4">
                    <div className="text-4xl font-bold text-primary">₹{PRICE}</div>
                    <p className="text-sm text-muted-foreground">Valid for 24 hours</p>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Wait for refill
                    </Button>
                    <Button onClick={handlePurchase} disabled={loading} className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary/90">
                        {loading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                        Unlock Now
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
