"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { CoinBalance } from "@/components/coin/CoinBalance";
import { WelcomeTutorial } from "@/components/onboarding/WelcomeTutorial";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
    const { data: session } = useSession();

    return (
        <>
            <nav className="border-b border-border backdrop-blur-xl bg-glass sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4 flex justify-between items-center">
                    <Link href="/" className="flex items-center gap-2">
                        <Sparkles className="w-8 h-8 text-primary animate-float" />
                        <span className="text-2xl font-bold text-gradient">
                            CreatorAI
                        </span>
                    </Link>

                    <div className="flex gap-4 items-center">
                        <Link href="/explore">
                            <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
                                Explore
                            </Button>
                        </Link>
                        <Link href="/pricing">
                            <Button variant="ghost" className="text-text-secondary hover:text-text-primary">
                                Pricing
                            </Button>
                        </Link>

                        {session ? (
                            <>
                                <CoinBalance />
                                <Link href="/dashboard">
                                    <Button variant="outline">Dashboard</Button>
                                </Link>
                            </>
                        ) : (
                            <Link href="/login">
                                <Button className="btn-primary glow">Start Free</Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Welcome tutorial for first-time users */}
            <WelcomeTutorial />
        </>
    );
}
