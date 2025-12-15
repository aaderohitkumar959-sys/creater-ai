/**
 * Chat UI Component (Client Side)
 * Handles interactive chat interface
 */

'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MessageBubble } from '@/components/chat/message-bubble';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { FloatingInput } from '@/components/chat/floating-input';
import { ArrowLeft, MoreVertical, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
    id: string;
    content: string;
    sender: 'user' | 'ai';
    timestamp: Date;
}

interface Persona {
    id: string;
    name: string;
    avatar: string;
    isPremium?: boolean;
}

interface ChatUIProps {
    persona: Persona;
}

export const ChatUI: React.FC<ChatUIProps> = ({ persona }) => {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [isPinned, setIsPinned] = useState(false);

    // Initialize with welcome message
    useEffect(() => {
        setMessages([
            {
                id: '1',
                content: `Hey! I'm ${persona.name}. How can I help you today?`,
                sender: 'ai',
                timestamp: new Date(),
            },
        ]);
    }, [persona.name]);

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const handleSendMessage = async (content: string) => {
        const userMessage: Message = {
            id: Date.now().toString(),
            content,
            sender: 'user',
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, userMessage]);

        setIsTyping(true);

        setTimeout(() => {
            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: `Thanks for your message! I'm ${persona.name} and I'm here to chat with you. (This is a demo response - connect to real AI API for actual responses)`,
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, aiMessage]);
            setIsTyping(false);
        }, 2000);
    };

    const handlePin = () => {
        setIsPinned(!isPinned);
    };

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-primary)]">
            {/* Top Bar */}
            <div className="glass-medium border-b border-[var(--border-medium)] backdrop-blur-xl sticky top-0 z-10">
                <div className="container-mobile h-16 flex items-center justify-between">
                    {/* Left: Back + Avatar + Name */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                            aria-label="Go back"
                        >
                            <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
                        </button>

                        <div
                            onClick={() => router.push(`/persona/${persona.id}`)}
                            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
                        >
                            <div className="w-10 h-10 rounded-full bg-gradient-accent flex items-center justify-center text-white font-semibold overflow-hidden">
                                {persona.avatar ? (
                                    <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                                ) : (
                                    persona.name[0]
                                )}
                            </div>
                            <div>
                                <h2 className="font-semibold text-[var(--text-primary)] text-sm">
                                    {persona.name}
                                </h2>
                                <p className="text-xs text-[var(--text-muted)]">
                                    {isTyping ? 'typing...' : 'online'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Right: Pin + Options */}
                    <div className="flex items-center gap-1">
                        <button
                            onClick={handlePin}
                            className={cn(
                                'p-2 rounded-lg transition-colors',
                                isPinned ? 'text-[var(--accent-blue)]' : 'text-[var(--text-muted)]',
                                'hover:bg-white/5'
                            )}
                            aria-label={isPinned ? 'Unpin' : 'Pin'}
                        >
                            <Star size={20} fill={isPinned ? 'currentColor' : 'none'} />
                        </button>

                        <button
                            className="p-2 rounded-lg hover:bg-white/5 transition-colors text-[var(--text-muted)]"
                            aria-label="Options"
                        >
                            <MoreVertical size={20} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.map((message) => (
                    <MessageBubble
                        key={message.id}
                        content={message.content}
                        sender={message.sender}
                        timestamp={message.timestamp}
                        aiName={persona.name}
                        aiAvatar={persona.avatar}
                    />
                ))}

                {/* Typing Indicator */}
                {isTyping && (
                    <div className="flex gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full bg-gradient-accent flex items-center justify-center text-white text-sm font-semibold overflow-hidden">
                            {persona.avatar ? (
                                <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                            ) : (
                                persona.name[0]
                            )}
                        </div>
                        <div className="glass-medium rounded-2xl px-4 py-3 border border-[var(--border-medium)]">
                            <TypingIndicator />
                        </div>
                    </div>
                )}

                {/* Auto-scroll anchor */}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <FloatingInput
                onSend={handleSendMessage}
                placeholder={`Message ${persona.name}...`}
                disabled={isTyping}
            />
        </div>
    );
};
