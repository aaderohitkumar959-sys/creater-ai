"use client";

import { MessageCircle, Search, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

interface EmptyStateProps {
    type: "no-conversations" | "no-results" | "out-of-messages";
    searchQuery?: string;
}

export function EmptyState({ type, searchQuery }: EmptyStateProps) {
    const states = {
        "no-conversations": {
            icon: MessageCircle,
            title: "No conversations yet",
            description: "Start chatting with a character to begin your journey",
            actionLabel: "Explore Characters",
            actionHref: "/explore",
        },
        "no-results": {
            icon: Search,
            title: "No characters found",
            description: searchQuery
                ? `No results for "${searchQuery}". Try different keywords or browse all.`
                : "No characters match your filters",
            actionLabel: "Clear Search",
            actionHref: "/explore",
        },
        "out-of-messages": {
            icon: Sparkles,
            title: "You've used your daily messages",
            description: "Come back tomorrow for more free messages, or upgrade now!",
            actionLabel: "Buy Coins",
            actionHref: "/pricing",
            secondaryLabel: "Go Premium",
            secondaryHref: "/pricing",
        },
    };

    const state = states[type];
    const Icon = state.icon;

    return (
        <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-muted-foreground" />
            </div>

            <h3 className="text-xl font-semibold mb-2">{state.title}</h3>
            <p className="text-muted-foreground max-w-md mb-6">{state.description}</p>

            <div className="flex gap-3">
                <Button asChild>
                    <Link href={state.actionHref}>{state.actionLabel}</Link>
                </Button>
                {state.secondaryLabel && state.secondaryHref && (
                    <Button variant="outline" asChild>
                        <Link href={state.secondaryHref}>{state.secondaryLabel}</Link>
                    </Button>
                )}
            </div>
        </div>
    );
}
