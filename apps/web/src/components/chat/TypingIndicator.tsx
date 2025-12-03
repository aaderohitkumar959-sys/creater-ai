"use client";

export function TypingIndicator() {
    return (
        <div className="flex items-center space-x-2 p-3 bg-muted rounded-lg max-w-fit">
            <div className="flex space-x-1">
                <div
                    className="w-2 h-2 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: "0ms", animationDuration: "1s" }}
                />
                <div
                    className="w-2 h-2 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: "150ms", animationDuration: "1s" }}
                />
                <div
                    className="w-2 h-2 bg-current rounded-full animate-bounce"
                    style={{ animationDelay: "300ms", animationDuration: "1s" }}
                />
            </div>
            <span className="text-xs text-muted-foreground">AI is thinking...</span>
        </div>
    );
}
