/**
 * Message Bubble Component
 * ChatGPT-style message bubbles with avatar
 */

'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface MessageBubbleProps {
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    aiName?: string;
    aiAvatar?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
    content,
    sender,
    timestamp,
    aiName,
    aiAvatar,
}) => {
    const isUser = sender === 'user';

    return (
        <div
            className={cn(
                'flex gap-3 mb-8 animate-fadeIn',
                isUser && 'flex-row-reverse'
            )}
        >
            {/* Avatar */}
            {!isUser && (
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                        {aiAvatar ? (
                            <img src={aiAvatar} alt={aiName} className="w-full h-full object-cover" />
                        ) : (
                            aiName?.[0] || 'AI'
                        )}
                    </div>
                </div>
            )}

            {/* Message Content */}
            <div
                className={cn(
                    'max-w-[75%] sm:max-w-[65%]',
                    'rounded-2xl px-4 py-2.5',
                    'transition-all duration-250',
                    isUser && 'bg-gradient-accent text-white shadow-glow',
                    !isUser && 'glass-medium border border-[var(--border-medium)]'
                )}
            >
                {/* AI Name removed to reduce clutter */}

                {/* Message Text */}
                <p className={cn(
                    'text-sm leading-relaxed whitespace-pre-wrap break-words',
                    isUser ? 'text-white' : 'text-[var(--text-primary)]'
                )}>
                    {content}
                </p>

                {/* Timestamp */}
                <p className={cn(
                    'text-[10px] mt-1',
                    isUser ? 'text-white/70 text-right' : 'text-[var(--text-muted)]'
                )}>
                    {format(timestamp, 'h:mm a')}
                </p>
            </div>

            {/* User avatar placeholder (optional) */}
            {isUser && (
                <div className="flex-shrink-0">
                    <div className="w-8 h-8 rounded-full bg-[var(--accent-blue)] flex items-center justify-center text-white text-sm font-semibold">
                        You
                    </div>
                </div>
            )}
        </div>
    );
};
