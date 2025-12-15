"use client";

import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { Coins } from "lucide-react";
import Link from "next/link";

export function CoinBalance() {
    const { data: session } = useSession();
    const [balance, setBalance] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!session?.user?.id) {
            setLoading(false);
            return;
        }

        const fetchBalance = async () => {
            try {
                const res = await fetch(
                    `${process.env.NEXT_PUBLIC_API_URL}/coins/balance`,
                    {
                        headers: {
                            Authorization: `Bearer ${(session.user as any).accessToken || ""}`,
                        },
                    }
                );

                if (res.ok) {
                    const data = await res.json();
                    setBalance(data.balance || session.user.coins || 50);
                } else {
                    // Fallback to session coins
                    setBalance(session.user.coins || 50);
                }
            } catch (error) {
                console.error("Failed to fetch coin balance:", error);
                setBalance(session.user.coins || 50);
            } finally {
                setLoading(false);
            }
        };

        fetchBalance();
    }, [session]);

    if (!session || loading) {
        return null;
    }

    return (
        <Link
            href="/pricing"
            className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 border border-yellow-500/30 rounded-full hover:from-yellow-500/30 hover:to-yellow-600/30 transition-all"
        >
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="font-semibold text-sm">
                {balance !== null ? balance.toLocaleString() : "..."}
            </span>
        </Link>
    );
}
