"use client";

import { useEffect, useState } from "react";
import { CoinPack } from "@/types/payment";
import { CoinPackCard } from "@/components/payment/CoinPackCard";
import { PaymentModal } from "@/components/payment/PaymentModal";
import Script from "next/script";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { AdRewardButton } from "@/components/payment/AdRewardButton";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function BuyCoinsPage() {
    const [coinPacks, setCoinPacks] = useState<CoinPack[]>([]);
    const [selectedPack, setSelectedPack] = useState<CoinPack | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    useEffect(() => {
        async function loadPacks() {
            try {
                const packs = await api.getCoinPacks();
                setCoinPacks(packs);
            } catch (error) {
                console.error('Failed to load coin packs:', error);
            } finally {
                setLoading(false);
            }
        }

        loadPacks();
    }, []);

    const handleBuy = (pack: CoinPack) => {
        setSelectedPack(pack);
        setIsModalOpen(true);
    };

    const handleSuccess = () => {
        // Refresh balance or redirect
        router.push('/wallet');
    };

    if (loading) {
        return <div className="flex justify-center items-center h-screen">Loading...</div>;
    }

    return (
        <div className="container mx-auto py-8 px-4">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />

            <div className="mb-8">
                <Link href="/wallet">
                    <Button variant="ghost" className="gap-2 mb-4">
                        <ArrowLeft className="w-4 h-4" />
                        Back to Wallet
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Buy Coins</h1>
                <p className="text-muted-foreground mt-2">
                    Select a coin pack to top up your wallet
                </p>
            </div>

            {/* Ad Reward Section */}
            <Card className="mb-8 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/20 dark:to-blue-950/20 border-2 border-purple-200 dark:border-purple-800">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-600" />
                        Earn Free Coins
                    </CardTitle>
                    <CardDescription>
                        Watch short ads to earn coins for free! Limited to 5 ads per day.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <AdRewardButton />
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {
                    coinPacks.map((pack) => (
                        <CoinPackCard key={pack.id} pack={pack} onBuy={handleBuy} />
                    ))
                }
            </div>

            <PaymentModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                selectedPack={selectedPack}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
