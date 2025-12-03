"use client";

import { useEffect, useState } from "react";

interface StreamingMessageProps {
    content: string;
    isComplete: boolean;
    speed?: number; // ms per character
}

export function StreamingMessage({ content, isComplete, speed = 20 }: StreamingMessageProps) {
    const [displayedContent, setDisplayedContent] = useState("");
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        if (isComplete) {
            setDisplayedContent(content);
            return;
        }

        if (currentIndex < content.length) {
            const timeout = setTimeout(() => {
                setDisplayedContent(content.slice(0, currentIndex + 1));
                setCurrentIndex(currentIndex + 1);
            }, speed);

            return () => clearTimeout(timeout);
        }
    }, [content, currentIndex, isComplete, speed]);

    // Reset when content changes
    useEffect(() => {
        setCurrentIndex(0);
        setDisplayedContent("");
    }, [content]);

    return (
        <div className="prose dark:prose-invert max-w-none">
            {displayedContent}
            {!isComplete && currentIndex < content.length && (
                <span className="inline-block w-1 h-4 ml-0.5 bg-current animate-pulse" />
            )}
        </div>
    );
}
