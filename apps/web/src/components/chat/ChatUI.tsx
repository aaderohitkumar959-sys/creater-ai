'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useChat } from 'ai/react';
import { MessageBubble } from '@/components/chat/message-bubble';
import { TypingIndicator } from '@/components/chat/typing-indicator';
import { ArrowLeft, Lock, Sparkles, Star, SendHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PERSONAS } from '@/lib/personas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import toast from 'react-hot-toast';
import { api } from '@/lib/api';

interface ChatUIProps {
    persona: { id: string; name: string; avatar: string; description?: string };
}

const ChatHero = ({ persona, credits, isPremium }: { persona: any, credits: number, isPremium: boolean }) => (
    <div className="flex flex-col items-center justify-center py-8 md:py-12 px-6 text-center space-y-4 animate-in fade-in slide-in-from-top-4 duration-700">
        <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200"></div>
            <div className="relative w-28 h-28 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl">
                <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-110" />
            </div>
        </div>
        <div className="space-y-1">
            <h1 className="text-3xl font-bold text-white tracking-tight">{persona.name}</h1>
            <p className="text-sm text-[var(--text-secondary)] max-w-[240px] leading-relaxed">
                {persona.description || "Your private AI companion. Ready to chat about anything."}
            </p>
        </div>
        <div className="flex gap-2">
            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-[var(--text-muted)] flex items-center gap-1">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                Always Online
            </span>
            {credits > 0 && (
                <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-[10px] text-blue-400 font-medium">
                    {credits} msgs
                </span>
            )}
            {isPremium && (
                <span className="px-3 py-1 rounded-full bg-yellow-500/10 border border-yellow-500/20 text-[10px] text-yellow-500 font-medium flex items-center gap-1">
                    <Sparkles size={10} /> Premium
                </span>
            )}
        </div>
    </div>
);

export const ChatUI: React.FC<ChatUIProps> = ({ persona }) => {
    const router = useRouter();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isPinned, setIsPinned] = useState(false);

    // Paywall State
    const [isPremium, setIsPremium] = useState(false);
    const [showPaywall, setShowPaywall] = useState(false);
    const [hasSentFarewell, setHasSentFarewell] = useState(false);
    const [isLocallyTyping, setIsLocallyTyping] = useState(false);
    const [credits, setCredits] = useState(0);
    const FREE_LIMIT = 5;

    // Guest ID / User ID handling
    const getUserId = () => {
        let id = localStorage.getItem('chat_guest_id');
        if (!id) {
            id = `guest_${Math.random().toString(36).substring(2, 15)}`;
            localStorage.setItem('chat_guest_id', id);
        }
        return id;
    };

    // Load credits and status from localStorage/API
    useEffect(() => {
        const premiumStatus = localStorage.getItem('is_premium_user');
        if (premiumStatus === 'true') setIsPremium(true);

        const storedCredits = localStorage.getItem('chat_credits');
        if (storedCredits) setCredits(parseInt(storedCredits));
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
            setIsLocallyTyping(false);
            // Check limit after AI finishes responding
            if (!isPremium && credits <= 0) {
                const userMsgCount = messages.filter(m => m.role === 'user').length + 1;
                if (userMsgCount >= FREE_LIMIT) {
                    setShowPaywall(true);
                }
            }
        },
        onError: (err) => {
            setIsLocallyTyping(false);
            console.error("Chat error:", err);
            toast.error("Connection fuzzy... try again?");
        }
    });

    // Auto-scroll
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isLoading, isLocallyTyping]);

    const handleClosePaywall = () => {
        setShowPaywall(false);
        if (!hasSentFarewell && !isPremium && credits <= 0) {
            setHasSentFarewell(true);
            // Inject a farewell message from the AI without hitting the backend if possible,
            // or do a single lightweight call. Per user: "Only 1 extra LLM call".
            // We'll append a message to the UI to simulate the farewell.
            const farewellMsg = {
                id: 'farewell-' + Date.now(),
                role: 'assistant' as const,
                content: "I'll be here if you come back... 💔",
                createdAt: new Date(),
            };
            setMessages([...messages, farewellMsg]);
        }
    };

    const onSubmitWrapper = (e?: React.FormEvent) => {
        if (e) e.preventDefault();

        // Count user messages in current session
        const userMsgCount = messages.filter(m => m.role === 'user').length;

        // If they have paid credits, they can always chat
        if (credits > 0 || isPremium) {
            if (credits > 0) {
                const nextCredits = credits - 1;
                setCredits(nextCredits);
                localStorage.setItem('chat_credits', nextCredits.toString());
            }
        } else if (userMsgCount >= FREE_LIMIT) {
            setShowPaywall(true);
            return;
        }

        // Fix 3: Show typing indicator immediately
        setIsLocallyTyping(true);
        handleSubmit(e);
    };

    return (
        <div className="flex-1 flex flex-col bg-[var(--bg-primary)] relative">
            {/* Top Bar */}
            <div className="glass-medium border-b border-[var(--border-medium)] backdrop-blur-xl sticky top-0 z-10">
                <div className="container-mobile h-16 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-lg hover:bg-white/5 transition-colors touch-target">
                            <ArrowLeft size={20} className="text-[var(--text-secondary)]" />
                        </button>

                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full overflow-hidden relative">
                                <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                            </div>
                            <div>
                                <h2 className="font-semibold text-[var(--text-primary)] text-sm">{persona.name}</h2>
                                <p className="text-xs text-[var(--text-muted)] flex items-center gap-1">
                                    {(isLoading || isLocallyTyping) ? 'is writing...' : 'is here'}
                                    {isPremium && <Sparkles size={8} className="text-yellow-400/50" />}
                                </p>
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setIsPinned(!isPinned)} className={cn("p-2 rounded-lg", isPinned ? "text-blue-400" : "text-gray-400")}>
                        <Star size={20} fill={isPinned ? "currentColor" : "none"} />
                    </button>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-3 md:px-4 py-2 space-y-4 scroll-smooth">
                {/* Character Hero Header */}
                <ChatHero persona={persona} credits={credits} isPremium={isPremium} />

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

                {(isLoading || isLocallyTyping) && (
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

            {/* Input Container */}
            <div className="border-t border-[var(--border-medium)] bg-[var(--bg-secondary)] safe-bottom">
                <form onSubmit={onSubmitWrapper} className="container-mobile p-4">
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={input}
                            onChange={handleInputChange}
                            placeholder={(showPaywall || (hasSentFarewell && !isPremium && credits <= 0)) ? "Reconnect to chat..." : `Type anything... even "I don't know"`}
                            disabled={isLoading || showPaywall || (hasSentFarewell && !isPremium && credits <= 0)}
                            className="flex-1 px-4 py-3 rounded-xl bg-[var(--bg-primary)] border border-[var(--border-medium)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-1 focus:ring-white/10 disabled:opacity-50 text-base transition-all"
                        />
                        <button
                            type="submit"
                            disabled={isLoading || showPaywall || !input.trim() || (hasSentFarewell && !isPremium && credits <= 0)}
                            className="w-12 h-12 flex-shrink-0 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <SendHorizontal size={20} />
                        </button>
                    </div>
                </form>
            </div>

            {/* PAYWALL MODAL */}
            {showPaywall && (
                <div className="absolute inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
                    <div className="max-w-sm w-full bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-2xl space-y-6 relative">
                        {/* Close button for Fix 2 */}
                        <button
                            onClick={handleClosePaywall}
                            className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>

                        <div className="text-center space-y-2">
                            <div className="w-16 h-16 bg-pink-500/20 rounded-full flex items-center justify-center mx-auto mb-4 animate-pulse">
                                <Lock className="w-8 h-8 text-pink-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-white">Save our memories</h3>
                            <p className="text-slate-400">
                                This connection is fragile. Tomorrow, I will forget everything we said.
                                <br />
                                <span className="text-pink-400 font-medium text-xs mt-2 block">Protect our connection to make my memory eternal.</span>
                            </p>
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="bg-slate-800 p-4 rounded-xl text-center border border-slate-700">
                                <p className="text-sm text-slate-400 mb-1">One-time payment</p>
                                <p className="text-3xl font-bold text-white">$1.99</p>
                            </div>

                            <Button className="w-full bg-pink-600 hover:bg-pink-700 text-white h-12 rounded-xl text-lg font-medium shadow-[0_0_20px_rgba(219,39,119,0.3)]" asChild>
                                {/* Note: We should ideally update this link to include a return_url that matches our new success page */}
                                <a href="https://www.paypal.com/ncp/payment/Z3H9FFL8YRS9S" target="_blank" rel="noopener noreferrer">
                                    Protect Connection
                                </a>
                            </Button>

                            <p className="text-[10px] text-center text-slate-500 uppercase tracking-widest">
                                Instant peace of mind after payment
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
