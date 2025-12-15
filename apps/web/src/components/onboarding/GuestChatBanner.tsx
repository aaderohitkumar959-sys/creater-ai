"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { MessageCircle } from "lucide-react";

interface GuestChatBannerProps {
    messagesRemaining: number;
    totalGuestMessages?: number;
}

export function GuestChatBanner({
    messagesRemaining,
    totalGuestMessages = 5
}: GuestChatBannerProps) {
    const router = useRouter();
    const [dismissed, setDismissed] = useState(false);

    if (dismissed || messagesRemaining > 3) return null;

    const messagesSent = totalGuestMessages - messagesRemaining;

    return (
        <Card className="p-4 mb-4 border-primary/50 bg-primary/5">
            <div className="flex items-start gap-3">
                <MessageCircle className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                    <h4 className="font-semibold text-sm mb-1">
                        {messagesRemaining > 0
                            ? `${messagesRemaining} free messages left`
                            : "You've used your free messages"}
                    </h4>
                    <p className="text-sm text-muted-foreground mb-3">
                        {messagesRemaining > 0
                            ? "Create a free account to get 20 messages/day"
                            : "Sign up for 20 free messages every day!"}
                    </p>
                    <div className="flex gap-2">
                        <Button
                            size="sm"
                            onClick={() => router.push("/auth/signin")}
                        >
                            Sign Up Free
                        </Button>
                        {messagesRemaining > 0 && (
                            <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDismissed(true)}
                            >
                                Continue as Guest
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </Card>
    );
}
