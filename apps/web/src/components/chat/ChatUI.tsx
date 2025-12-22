'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from 'ai/react';
import { MessageBubble } from '@/components/chat/message-bubble';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { ArrowLeft, Lock, Sparkles, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PERSONAS } from '@/lib/personas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';

interface ChatUIProps {
    persona: { id: string; name: string; avatar: string };
}

export const ChatUI: React.FC<ChatUIProps> = ({ persona }) => {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isPinned, setIsPinned] = useState(false);

    // Paywall State
    const [isPremium, setIsPremium] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [unlockCode, setUnlockCode] = useState('');
    const FREE_LIMIT = 5;

    // Load premium status from local storage
    useEffect(() => {
        const premiumStatus = localStorage.getItem('is_premium_user');
        if (premiumStatus === 'true') setIsPremium(true);
    }, []);

    // Vercel AI SDK Hook
    const { messages, input, handleInputChange, handleSubmit, isLoading, setMessages } = useChat({
        api: '/api/chat',
        body: { personaId: persona.id },
        initialMessages: [
            {
                id: 'welcome',
                role: 'assistant',
                content: PERSONAS[persona.id]?.introMessage || `Hey! I'm ${persona.name}.`,
                createdAt: new Date(),
            }
        ],
        onFinish: () => {
            // Check limit after AI finishes responding
            if (!isPremium) {
                // Count user messages. We divide by 2 roughly, or just check total length
                // Better: check how many user messages are in the history
                const userMsgCount = messages.filter(m => m.role === 'user').length + 1; // +1 includes the one just sent
                if (userMsgCount >= FREE_LIMIT) {
                    setShowPaywall(true);
                }
            }
        },
        onError: (err) => {
            console.error("Chat error:", err);
            toast.error("Connection fuzzy... try again?");
        }
    });

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading]);

    const handleUnlock = () => {
        if (unlockCode.trim().toUpperCase() === 'LOVE2025') {
            localStorage.setItem('is_premium_user', 'true');
            setIsPremium(true);
            setShowPaywall(false);
            toast.success("Welcome to Unlimited Love! ❤️");
        } else {
            toast.error("Invalid code. Try again!");
        }
    };

    const onSubmitWrapper = (e?: React.FormEvent, msg?: string) => {
        if (e) e.preventDefault();

        // Strict Paywall Check
        const userMsgCount = messages.filter(m => m.role === 'user').length;
        if (!isPremium && userMsgCount >= FREE_LIMIT) {
            setShowPaywall(true);
            return;
        }

        handleSubmit(e, { data: { message: msg || input } });
    };

    return (
        <div className="h-screen flex flex-col bg-[var(--bg-primary)] relative">
            {/* Top Bar */}
            <div className="glass-medium border-b border-[var(--border-medium)] backdrop-blur-xl sticky top-0 z-10">
                <div className="container-mobile h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 rounded-lg hover:bg-white/5 transition-colors">
                            <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden relative">
                                <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[var(--text-primary)] text-sm">{persona.name}</h2>
                                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                    {isLoading ? 'typing...' : 'online'}
                                    {isPremium && <Sparkles size={10} className="text-yellow-400" />}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setIsPinned(!isPinned)} className={cn("p-2 rounded-lg", isPinned ? "text-blue-400" : "text-gray-400")}>
                        <Star size={20} fill={isPinned ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
                {messages.map(m => (
                    <MessageBubble
                        key={m.id}
                        content={m.content}
                        sender={m.role === 'user' ? 'user' : 'ai'}
                        timestamp={m.createdAt || new Date()}
                        aiName={persona.name}
                        aiAvatar={persona.avatar}
                    />
                ))}

                {isLoading && (
                    <div className="flex gap-3 mb-4">
                        <div className="w-8 h-8 rounded-full overflow-hidden">
                            <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="glass-medium rounded-2xl px-4 py-3 border border-[var(--border-medium)]">
                            <TypingIndicator />
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <form onSubmit={onSubmitWrapper} className="p-4 border-t border-[var(--border-medium)] bg-[var(--bg-secondary)]">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={handleInputChange}
                        placeholder={showPaywall ? "Unlock to chat..." : `Message ${persona.name}...`}
                        disabled={isLoading || showPaywall}
                        className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-medium)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
                    />
                    <button
                        type="submit"
                        disabled={isLoading || showPaywall || !input.trim()}
                        className="px-6 py-3 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        Send
                    </button>
                </div>
            </form>

            {/* PAYWALL MODAL */}
            {showPaywall && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="max-w-sm w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6">
                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-pink-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Unlock Unlimited Love</h3>
                            <p className="text-slate-400">
                                You've reached the free limit with {persona.name}.
                                Continue your private conversation forever.
                            </p>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
                                <p className="text-sm text-slate-400 mb-1">One-time payment</p>
                                <p className="text-3xl font-bold text-white">$1.99</p>
                            </div>

                            <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white h-12 rounded-xl text-lg font-medium" asChild>
                                <a href="https://www.paypal.com/ncp/payment/Z3H9FFL8YRS9S" target="_blank" rel="noopener noreferrer">
                                    Unlock Now
                                </a>
                            </Button>

                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t border-slate-700" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-slate-900 px-2 text-slate-500">I have a code</span>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Input
                                    placeholder="Enter unlock code"
                                    className="bg-slate-800 border-slate-700 text-white"
                                    value={unlockCode}
                                    onChange={(e) => setUnlockCode(e.target.value)}
                                />
                                <Button variant="outline" onClick={handleUnlock}>
                                    Apply
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
