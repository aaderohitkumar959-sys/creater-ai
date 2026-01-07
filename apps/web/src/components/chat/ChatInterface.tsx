"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Image as ImageIcon, Sparkles, Lock, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import { useChat } from '@/hooks/useChat';
import { useAuth } from '@/contexts/AuthContext';

interface Message {
    id: string;
    content: string;
    sender: 'USER' | 'CREATOR' | 'SYSTEM';
    createdAt: Date;
}

interface ChatInterfaceProps {
    persona: {
        id: string;
        name: string;
        avatarUrl: string;
        description?: string;
        personality?: string;
        isPremium?: boolean;
        defaultCoinCost?: number;
    };
    initialMessages?: Message[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona, initialMessages = [] }) => {
    const { user } = useAuth();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { sendMessage, isLoading } = useChat();

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isTyping]);

    const handleSend = async () => {
        if (!inputValue.trim() || isLoading) return;

        const newMessage: Message = {
            id: Date.now().toString(),
            content: inputValue,
            sender: 'USER',
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');
        setIsTyping(true);

        try {
            const response = await sendMessage(persona.id, inputValue);
            setIsTyping(false);

            const aiMessage: Message = {
                id: (Date.now() + 1).toString(),
                content: response.content,
                sender: 'CREATOR',
                createdAt: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error: any) {
            setIsTyping(false);
            toast.error(error.message || 'Failed to send message');
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <div className="flex h-screen bg-background">
            {/* Persona Sidebar */}
            <div className="hidden lg:block w-80 border-r border-border glass-card">
                <div className="p-6 space-y-6">
                    {/* Persona Avatar & Info */}
                    <div className="text-center">
                        <div className="relative inline-block mb-4">
                            <Avatar className="w-32 h-32 border-4 border-primary/20 shadow-glow-md">
                                <AvatarImage src={persona.avatarUrl} alt={persona.name} />
                                <AvatarFallback>{persona.name[0]}</AvatarFallback>
                            </Avatar>
                            {persona.isPremium && (
                                <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex items-center gap-1 bg-accent-yellow/20 px-3 py-1 rounded-full border border-accent-yellow/40 backdrop-blur-sm">
                                    <Sparkles className="w-3 h-3 text-accent-yellow" />
                                    <span className="text-xs font-semibold text-accent-yellow">Premium</span>
                                </div>
                            )}
                        </div>
                        <h2 className="text-2xl font-bold text-gradient mb-2">{persona.name}</h2>
                        {persona.description && (
                            <p className="text-sm text-text-secondary">{persona.description}</p>
                        )}
                    </div>

                    {/* Personality Traits */}
                    {persona.personality && (
                        <div className="glass-card p-4 rounded-xl">
                            <h3 className="text-sm font-semibold text-text-primary mb-3">Personality</h3>
                            <div className="flex flex-wrap gap-2">
                                {persona.personality.split(',').map((trait, idx) => (
                                    <span
                                        key={idx}
                                        className="px-3 py-1 bg-surface-elevated rounded-full text-xs text-text-secondary border border-border-light"
                                    >
                                        {trait.trim()}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Actions */}
                    <div className="glass-card p-4 rounded-xl space-y-2">
                        <Button variant="outline" className="w-full justify-start border-border-light hover:border-primary">
                            <ImageIcon className="w-4 h-4 mr-2" />
                            Send Image
                        </Button>
                        <Button variant="outline" className="w-full justify-start border-border-light hover:border-primary">
                            <Sparkles className="w-4 h-4 mr-2" />
                            View Memories
                        </Button>
                    </div>
                </div>
            </div>

            {/* Chat Area */}
            <div className="flex-1 flex flex-col">
                {/* Header */}
                <div className="border-b border-border glass-card p-4 flex items-center justify-between backdrop-blur-xl sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                            <AvatarImage src={persona.avatarUrl} alt={persona.name} />
                            <AvatarFallback>{persona.name[0]}</AvatarFallback>
                        </Avatar>
                        <div>
                            <h3 className="font-semibold text-text-primary">{persona.name}</h3>
                            <p className="text-xs text-text-muted">
                                {isTyping ? 'Typing...' : 'Online'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                <ScrollArea className="flex-1 p-6" ref={scrollRef}>
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {messages.map((message, idx) => (
                            <div
                                key={message.id}
                                className={cn(
                                    "flex gap-3 animate-fade-in",
                                    message.sender === 'USER' ? 'justify-end' : 'justify-start'
                                )}
                                style={{ animationDelay: `${idx * 50}ms` }}
                            >
                                {message.sender === 'CREATOR' && (
                                    <Avatar className="w-10 h-10 border-2 border-primary/20 flex-shrink-0">
                                        <AvatarImage src={persona.avatarUrl} alt={persona.name} />
                                        <AvatarFallback>{persona.name[0]}</AvatarFallback>
                                    </Avatar>
                                )}

                                <div
                                    className={cn(
                                        "chat-bubble max-w-[75%]",
                                        message.sender === 'USER'
                                            ? 'chat-bubble-user'
                                            : 'bg-surface-elevated border border-border-light'
                                    )}
                                >
                                    <p className={cn(
                                        "text-sm leading-relaxed",
                                        message.sender === 'USER' ? 'text-white' : 'text-text-primary'
                                    )}>
                                        {message.content}
                                    </p>
                                    <span className={cn(
                                        "text-[10px] mt-1 block",
                                        message.sender === 'USER' ? 'text-white/60' : 'text-text-muted'
                                    )}>
                                        {new Date(message.createdAt).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </span>
                                </div>

                                {message.sender === 'USER' && (
                                    <Avatar className="w-10 h-10 border-2 border-primary/20 flex-shrink-0">
                                        <AvatarImage src={user?.photoURL || ''} alt="You" />
                                        <AvatarFallback>U</AvatarFallback>
                                    </Avatar>
                                )}
                            </div>
                        ))}

                        {/* Typing Indicator */}
                        {isTyping && (
                            <div className="flex gap-3 animate-fade-in">
                                <Avatar className="w-10 h-10 border-2 border-primary/20">
                                    <AvatarImage src={persona.avatarUrl} alt={persona.name} />
                                    <AvatarFallback>{persona.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="chat-bubble bg-surface-elevated border border-border-light">
                                    <div className="flex gap-1 items-center">
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce" />
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-100" />
                                        <div className="w-2 h-2 bg-primary rounded-full animate-bounce animation-delay-200" />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="border-t border-border glass-card p-4 backdrop-blur-xl">
                    <div className="max-w-4xl mx-auto flex gap-3 items-end">
                        <div className="flex-1 relative">
                            <Input
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder="Type your message..."
                                className="input-field pr-12 min-h-[52px] resize-none"
                                disabled={isLoading}
                            />
                        </div>
                        <Button
                            onClick={handleSend}
                            disabled={!inputValue.trim() || isLoading}
                            className="btn-primary h-[52px] px-6"
                        >
                            {isLoading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                <Send className="w-5 h-5" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};
