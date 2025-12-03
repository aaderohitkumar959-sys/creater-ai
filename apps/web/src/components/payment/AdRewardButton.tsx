"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Play, Loader2, CheckCircle2 } from "lucide-react";
import { api } from "@/lib/api";
import { toast } from "react-hot-toast";

export function AdRewardButton() {
    const [loading, setLoading] = useState(false);
    const [availability, setAvailability] = useState({
        canEarn: true,
        adsWatchedToday: 0,
        maxAdsPerDay: 5,
        coinsPerAd: 10,
    });
    const [checkingAvailability, setCheckingAvailability] = useState(true);

    useEffect(() => {
        checkAvailability();
    }, []);

    const checkAvailability = async () => {
        try {
            const data = await api.checkAdAvailability();
            setAvailability(data);
        } catch (error) {
            console.error("Failed to check ad availability:", error);
        } finally {
            setCheckingAvailability(false);
        }
    };

    const handleWatchAd = async () => {
        setLoading(true);
        try {
            // In production, this would trigger the actual ad SDK
            // For now, we'll simulate an ad watch with a test token
            await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate ad duration

            const result = await api.validateAdReward({
                adToken: `test_${Date.now()}`,
                adProvider: 'test',
            });

            if (result.success) {
                toast.success(`${result.message} +${result.coinsEarned} coins!`);
                checkAvailability(); // Refresh availability
            } else {
                toast.error(result.error || "Failed to earn coins");
            }
        } catch (error: any) {
            toast.error(error.message || "Failed to watch ad");
        } finally {
            setLoading(false);
        }
    };

    if (checkingAvailability) {
        return <div className="text-sm text-muted-foreground">Checking availability...</div>;
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div>
                    <div className="font-semibold">
                        {availability.canEarn ? "Watch an ad to earn coins" : "Daily limit reached"}
                    </div>
                    <div className="text-sm text-muted-foreground">
                        {availability.adsWatchedToday} / {availability.maxAdsPerDay} ads watched today
                        {availability.canEarn && ` • Earn ${availability.coinsPerAd} coins per ad`}
                    </div>
                </div>
            </div>

            <Button
                onClick={handleWatchAd}
                disabled={!availability.canEarn || loading}
                className="w-full sm:w-auto"
                size="lg"
                variant={availability.canEarn ? "default" : "secondary"}
            >
                {loading ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Watching Ad...
                    </>
                ) : availability.canEarn ? (
                    <>
                        <Play className="mr-2 h-4 w-4" />
                        Watch Ad (+{availability.coinsPerAd} coins)
                    </>
                ) : (
                    <>
                        <CheckCircle2 className="mr-2 h-4 w-4" />
                        Come back tomorrow
                    </>
                )}
            </Button>
        </div>
    );
}
