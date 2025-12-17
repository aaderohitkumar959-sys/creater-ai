"use client";

import { Button } from "@/components/ui/button";
import { Copy, ThumbsUp, ThumbsDown, RotateCw, Flag } from "lucide-react";
import { useState } from "react";
import { toast } from "react-hot-toast";
import { ReportModal } from "@/components/moderation/ReportModal";

interface MessageActionsProps {
    messageId: string;
    content: string;
    onRegenerate?: () => void;
}

export function MessageActions({ messageId, content, onRegenerate }: MessageActionsProps) {
    const [reaction, setReaction] = useState<'up' | 'down' | null>(null);
    const [showReportModal, setShowReportModal] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(content);
        toast.success("Copied to clipboard!");
    };

    const handleReaction = async (type: 'up' | 'down') => {
        setReaction(type);
        toast.success(type === 'up' ? "Thanks for the feedback!" : "Feedback noted");
        // TODO: Send reaction to API
    };

    return (
        <>
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCopy}
                    className="h-7 w-7 p-0"
                >
                    <Copy className="h-3.5 w-3.5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction('up')}
                    className={`h-7 w-7 p-0 ${reaction === 'up' ? 'text-green-600' : ''}`}
                >
                    <ThumbsUp className="h-3.5 w-3.5" />
                </Button>

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReaction('down')}
                    className={`h-7 w-7 p-0 ${reaction === 'down' ? 'text-red-600' : ''}`}
                >
                    <ThumbsDown className="h-3.5 w-3.5" />
                </Button>

                {onRegenerate && (
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={onRegenerate}
                        className="h-7 w-7 p-0"
                    >
                        <RotateCw className="h-3.5 w-3.5" />
                    </Button>
                )}

                <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReportModal(true)}
                    className="h-7 w-7 p-0 text-red-600"
                >
                    <Flag className="h-3.5 w-3.5" />
                </Button>
            </div>

            {showReportModal && (
                <ReportModal
                    messageId={messageId}
                    messageContent={content}
                    onClose={() => setShowReportModal(false)}
                />
            )}
        </>
    );
}
