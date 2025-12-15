"use client";

import { useState } from "react";
import { Check, Sparkles, Zap } from "lucide-react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import toast from "react-hot-toast";

const coinPacks = [
    {
        id: "starter",
        name: "Starter",
        coins: 100,
        price: 0.99,
        priceINR: 79,
        popular: false,
    },
    {
        id: "popular",
        name: "Popular",
        coins: 550,
        bonusCoins: 50,
        price: 4.99,
        priceINR: 399,
        popular: true,
        savings: "10% bonus",
    },
    {
        id: "best-value",
        name: "Best Value",
        coins: 1200,
        bonusCoins: 200,
        price: 9.99,
        priceINR: 799,
        popular: false,
        savings: "20% bonus",
    },
];

const subscriptionPlan = {
    name: "Premium Unlimited",
    price: 9.99,
    priceINR: 799,
    pricePerMonth: true,
    features: [
        "Unlimited messages",
        "Priority AI responses (faster)",
        "No ads",
        "Early access to new characters",
        "Exclusive premium characters (coming soon)",
    ],
};

export default function PricingPage() {
    const { data: session } = useSession();
    const router = useRouter();
    const [loading, setLoading] = useState<string | null>(null);
    const [selectedTab, setSelectedTab] = useState<"coins" | "subscription">(
        "coins"
    );

    const handleBuyCoins = async (packId: string) => {
        if (!session) {
            toast.error("Please sign in to purchase coins");
            router.push("/auth/signin");
            return;
        }

        setLoading(packId);
        try {
            const res = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/payments/stripe/create-intent`,
                {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${(session.user as any).accessToken || ""}`,
                    },
                    body: JSON.stringify({
                        coinPackId: packId,
                    }),
                }
            );

            if (!res.ok) {
                throw new Error("Failed to create payment intent");
            }

            const { url } = await res.json();
            window.location.href = url;
        } catch (error) {
            console.error("Payment error:", error);
            toast.error("Failed to start payment. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    const handleSubscribe = async () => {
        if (!session) {
            toast.error("Please sign in to subscribe");
            router.push("/auth/signin");
            return;
        }

        setLoading("subscription");
        try {
            // TODO: Implement subscription checkout
            toast.error("Subscription coming soon!");
        } catch (error) {
            console.error("Subscription error:", error);
            toast.error("Failed to start subscription. Please try again.");
        } finally {
            setLoading(null);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-background to-background/80">
            <div className="container mx-auto px-4 py-16 max-w-6xl">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold mb-4">
                        Choose Your Plan
                    </h1>
                    <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
                        Chat unlimited or pay as you go. No commitment required.
                    </p>
                </div>

                {/* Toggle */}
                <div className="flex justify-center mb-12">
                    <div className="inline-flex bg-muted p-1 rounded-lg">
                        <button
                            onClick={() => setSelectedTab("coins")}
                            className={`px-6 py-2 rounded-md transition-all ${selectedTab === "coins"
                                    ? "bg-background shadow-sm"
                                    : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            Coins
                        </button>
                        <button
                            onClick={() => setSelectedTab("subscription")}
                            className={`px-6 py-2 rounded-md transition-all ${selected Tab === "subscription"
                        ? "bg-background shadow-sm"
                        : "text-muted-foreground hover:text-foreground"
              }`}
            >
                        Subscription
                    </button>
                </div>
            </div>

            {/* Coins Tab */}
            {selectedTab === "coins" && (
                <div className="grid md:grid-cols-3 gap-6">
                    {coinPacks.map((pack) => (
                        <Card
                            key={pack.id}
                            className={`p-6 relative ${pack.popular
                                    ? "border-primary shadow-lg shadow-primary/20"
                                    : ""
                                }`}
                        >
                            {pack.popular && (
                                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-semibold">
                                        MOST POPULAR
                                    </span>
                                </div>
                            )}

                            <div className="text-center mb-6">
                                <h3 className="text-xl font-semibold mb-2">{pack.name}</h3>
                                <div className="flex items-baseline justify-center gap-1">
                                    <span className="text-4xl font-bold">${pack.price}</span>
                                    {pack.savings && (
                                        <span className="text-sm text-primary font-medium">
                                            {pack.savings}
                                        </span>
                                    )}
                                </div>
                                <p className="text-muted-foreground text-sm mt-1">
                                    ₹{pack.priceINR} in India
                                </p>
                            </div>

                            <div className="mb-6">
                                <div className="flex items-center justify-center gap-2 text-2xl font-bold text-yellow-500 mb-2">
                                    <Sparkles className="w-6 h-6" />
                                    {pack.coins + (pack.bonusCoins || 0)} coins
                                </div>
                                {pack.bonusCoins && (
                                    <p className="text-center text-sm text-muted-foreground">
                                        {pack.coins} + {pack.bonusCoins} bonus
                                    </p>
                                )}
                                <p className="text-center text-xs text-muted-foreground mt-2">
                                    ~{Math.floor((pack.coins + (pack.bonusCoins || 0)) / 2)}{" "}
                                    messages
                                </p>
                            </div>

                            <Button
                                onClick={() => handleBuyCoins(pack.id)}
                                disabled={loading === pack.id}
                                className={`w-full ${pack.popular ? "bg-primary hover:bg-primary/90" : ""
                                    }`}
                                variant={pack.popular ? "default" : "outline"}
                            >
                                {loading === pack.id ? "Processing..." : "Buy Coins"}
                            </Button>
                        </Card>
                    ))}
                </div>
            )}

            {/* Subscription Tab */}
            {selectedTab === "subscription" && (
                <div className="max-w-md mx-auto">
                    <Card className="p-8 border-primary shadow-xl shadow-primary/20">
                        <div className="text-center mb-6">
                            <div className="inline-flex items-center gap-2 mb-4">
                                <Zap className="w-8 h-8 text-primary" />
                                <h3 className="text-2xl font-bold">
                                    {subscriptionPlan.name}
                                </h3>
                            </div>
                            <div className="flex items-baseline justify-center gap-1">
                                <span className="text-5xl font-bold">
                                    ${subscriptionPlan.price}
                                </span>
                                <span className="text-muted-foreground">/month</span>
                            </div>
                            <p className="text-muted-foreground text-sm mt-1">
                                ₹{subscriptionPlan.priceINR}/month in India
                            </p>
                        </div>

                        <ul className="space-y-3 mb-8">
                            {subscriptionPlan.features.map((feature, index) => (
                                <li key={index} className="flex items-start gap-3">
                                    <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                                    <span className="text-sm">{feature}</span>
                                </li>
                            ))}
                        </ul>

                        <Button
                            onClick={handleSubscribe}
                            disabled={loading === "subscription"}
                            className="w-full bg-primary hover:bg-primary/90"
                            size="lg"
                        >
                            {loading === "subscription"
                                ? "Processing..."
                                : "Go Premium"}
                        </Button>

                        <p className="text-center text-xs text-muted-foreground mt-4">
                            Cancel anytime. No questions asked.
                        </p>
                    </Card>

                    <div className="text-center mt-8 text-sm text-muted-foreground">
                        <p>
                            Prefer pay-as-you-go?{" "}
                            <button
                                onClick={() => setSelectedTab("coins")}
                                className="text-primary hover:underline"
                            >
                                Buy coins instead
                            </button>
                        </p>
                    </div>
                </div>
            )}

            {/* FAQ or Info Section */}
            <div className="mt-16 text-center text-sm text-muted-foreground">
                <p>
                    All prices in USD. Payments secured by Stripe.{" "}
                    <a href="/refund-policy" className="text-primary hover:underline">
                        7-day money-back guarantee
                    </a>
                </p>
            </div>
        </div>
    </div >
  );
}
