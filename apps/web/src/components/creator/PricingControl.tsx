import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Coins, Save } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface PricingControlProps {
    personaId: string;
    initialCost: number;
    onSave: (newCost: number) => Promise<void>;
}

export const PricingControl: React.FC<PricingControlProps> = ({ personaId, initialCost, onSave }) => {
    const [cost, setCost] = useState(initialCost);
    const [loading, setLoading] = useState(false);

    const handleSave = async () => {
        setLoading(true);
        try {
            await onSave(cost);
            toast.success("Pricing updated successfully!");
        } catch (error) {
            toast.error("Failed to update pricing.");
        } finally {
            setLoading(false);
        }
    };

    // Calculate potential earnings (assuming 70% creator share)
    const creatorShare = Math.floor(cost * 0.7);

    return (
        <Card className="w-full max-w-md">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Coins className="w-5 h-5 text-yellow-500" />
                    Message Pricing
                </CardTitle>
                <CardDescription>
                    Set the coin cost per message for this persona.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Cost per Message</Label>
                        <div className="flex items-center gap-1">
                            <span className="text-2xl font-bold text-primary">{cost}</span>
                            <Coins className="w-4 h-4 text-yellow-500" />
                        </div>
                    </div>

                    <Slider
                        value={[cost]}
                        onValueChange={(vals) => setCost(vals[0])}
                        max={50}
                        step={1}
                        className="w-full"
                    />

                    <div className="flex justify-between text-xs text-muted-foreground">
                        <span>Free (0)</span>
                        <span>Max (50)</span>
                    </div>
                </div>

                <div className="rounded-lg bg-muted p-4 text-sm">
                    <div className="flex justify-between mb-2">
                        <span>User Pays:</span>
                        <span className="font-medium">{cost} Coins</span>
                    </div>
                    <div className="flex justify-between text-green-600 font-bold">
                        <span>You Earn:</span>
                        <span>{creatorShare} Coins</span>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                        *Creator share is 70% of the transaction value.
                    </p>
                </div>
            </CardContent>
            <CardFooter>
                <Button onClick={handleSave} disabled={loading} className="w-full">
                    {loading ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save Changes</>}
                </Button>
            </CardFooter>
        </Card>
    );
};
