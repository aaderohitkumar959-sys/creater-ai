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
import { useSession } from 'next-auth/react';

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
    const { data: session } = useSession();
    const [backendToken, setBackendToken] = useState<string | null>(null);

    // Sync with backend to get a valid JWT
    useEffect(() => {
        const syncAuth = async () => {
            if (session?.user) {
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://creator-ai-api.onrender.com';
                    const response = await fetch(`${baseUrl}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: session.user.id,
                            email: session.user.email,
                            name: session.user.name,
                        }),
                    });
                    if (response.ok) {
                        const data = await response.json();
                        setBackendToken(data.accessToken);
                        console.log('Backend auth synced successfully');
                    }
                } catch (err) {
                    console.error('Failed to sync with backend auth:', err);
                }
            }
        };
        syncAuth();
    }, [session]);

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

        try {
            // Call real backend API
            const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://creator-ai-api.onrender.com';
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };

            // Add Authorization header if we have a token
            if (backendToken) {
                headers['Authorization'] = `Bearer ${backendToken}`;
            }

            const response = await fetch(`${baseUrl}/chat/send`, {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    personaId: persona.id,
                    message: content,
                }),
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            const data = await response.json();

            const aiMessage: Message = {
                id: data.aiMessage?.id || (Date.now() + 1).toString(),
                content: data.aiMessage?.content || "I'm having trouble responding right now. Please try again.",
                sender: 'ai',
                timestamp: new Date(data.aiMessage?.createdAt || Date.now()),
            };
            setMessages(prev => [...prev, aiMessage]);
        } catch (error) {
            console.error('Chat error:', error);
            // Show error message to user
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: "Sorry, I couldn't process your message. Please make sure you're logged in and try again.",
                sender: 'ai',
                timestamp: new Date(),
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsTyping(false);
        }
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
