"use client";

import { CoinPack } from "@/types/payment";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Coins } from "lucide-react";

interface CoinPackCardProps {
    pack: CoinPack;
    onBuy: (pack: CoinPack) => void;
}

export function CoinPackCard({ pack, onBuy }: CoinPackCardProps) {
    return (
        <Card className="w-full max-w-sm hover:shadow-lg transition-shadow duration-200 border-primary/10">
            <CardHeader className="text-center pb-2">
                <CardTitle className="text-2xl font-bold flex items-center justify-center gap-2">
                    <Coins className="w-6 h-6 text-yellow-500" />
                    {pack.coins.toLocaleString()} Coins
                </CardTitle>
                {pack.bonusCoins > 0 && (
                    <Badge variant="secondary" className="mx-auto mt-2 bg-green-100 text-green-800 hover:bg-green-200">
                        +{pack.bonusCoins.toLocaleString()} Bonus
                    </Badge>
                )}
            </CardHeader>
            <CardContent className="text-center pt-4">
                <div className="text-3xl font-bold text-primary">
                    ${pack.priceUSD}
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                    (₹{pack.priceINR})
                </p>
                <p className="text-sm text-muted-foreground mt-4">
                    {pack.description}
                </p>
            </CardContent>
            <CardFooter>
                <Button className="w-full" size="lg" onClick={() => onBuy(pack)}>
                    Buy Now
                </Button>
            </CardFooter>
        </Card>
    );
}
