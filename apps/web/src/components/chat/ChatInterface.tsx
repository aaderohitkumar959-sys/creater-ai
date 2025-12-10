"use client";

import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Image as ImageIcon, Mic, MoreVertical, Lock, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DayPass } from '@/components/monetization/DayPass';
import { toast } from 'react-hot-toast';
import { useChat } from '@/hooks/useChat';
import { Progress } from '@/components/ui/progress';
import { GiftSelector } from '@/components/chat/GiftSelector';
import { useSession } from 'next-auth/react';

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
        isPremium?: boolean;
    };
    initialMessages?: Message[];
}

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ persona, initialMessages = [] }) => {
    const { data: session } = useSession();
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [inputValue, setInputValue] = useState('');
    const [isDayPassOpen, setIsDayPassOpen] = useState(false);
    const [dailyCount, setDailyCount] = useState(0);
    const [isPremium, setIsPremium] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { sendMessage, isLoading } = useChat();

    const DAILY_LIMIT = 40;

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const handleSend = async () => {
        if (!inputValue.trim()) return;

        if (!isPremium && dailyCount >= DAILY_LIMIT) {
            setIsDayPassOpen(true);
            return;
        }

        const newMessage: Message = {
            id: Date.now().toString(),
            content: inputValue,
            sender: 'USER',
            createdAt: new Date(),
        };

        setMessages((prev) => [...prev, newMessage]);
        setInputValue('');
        setDailyCount((prev) => prev + 1);

        try {
            const response = await sendMessage(persona.id, inputValue);
            const aiMessage: Message = {
                id: Date.now().toString(),
                content: response.content,
                sender: 'CREATOR',
                createdAt: new Date(),
            };
            setMessages((prev) => [...prev, aiMessage]);
        } catch (error: any) {
            if (error?.response?.status === 403) {
                setIsDayPassOpen(true);
                toast.error("Daily limit reached.");
            } else {
                toast.error("Failed to send message.");
            }
        }
    };

    const handleSendGift = async (giftId: string, cost: number) => {
        if (!session?.user?.id) return;

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/gift`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken || ''}`
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    personaId: persona.id,
                    giftId,
                    amount: cost
                })
            });

            if (!res.ok) throw new Error('Failed to send gift');

            const systemMessage: Message = {
                id: Date.now().toString(),
                content: `🎁 Sent a gift! (${cost} coins)`,
                sender: 'SYSTEM',
                createdAt: new Date(),
            };
            setMessages(prev => [...prev, systemMessage]);

        } catch (error) {
            console.error(error);
            throw error;
        }
    };

    const handleSaveChat = () => {
        if (!isPremium) {
            toast.error("Saving chats is a Premium feature.");
            return;
        }
        const chatContent = messages.map(m => `${m.sender}: ${m.content}`).join('\n');
        const blob = new Blob([chatContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${persona.name}-chat.txt`;
        a.click();
        toast.success("Chat saved!");
    };

    return (
        <div className="flex flex-col h-full bg-background relative">
            {/* Meter Bar */}
            {!isPremium && (
                <div className="absolute top-0 left-0 w-full z-10">
                    <Progress value={(dailyCount / DAILY_LIMIT) * 100} className="h-1 rounded-none bg-muted" indicatorClassName={cn(dailyCount > 35 ? "bg-red-500" : "bg-primary")} />
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b bg-card/50 backdrop-blur-md sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <Avatar className="w-10 h-10 border-2 border-primary/20">
                        <AvatarImage src={persona.avatarUrl} />
                        <AvatarFallback>{persona.name[0]}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h2 className="font-bold text-sm">{persona.name}</h2>
                        <div className="flex items-center gap-1">
                            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                            <span className="text-xs text-muted-foreground">Online</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" onClick={handleSaveChat}>
                        <Download className="w-5 h-5 text-muted-foreground" />
                    </Button>
                    <Button variant="ghost" size="icon">
                        <MoreVertical className="w-5 h-5 text-muted-foreground" />
                    </Button>
                </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4" ref={scrollRef}>
                <div className="space-y-4 pb-4">
                    {messages.map((msg) => (
                        <div
                            key={msg.id}
                            className={cn(
                                "flex w-full",
                                msg.sender === 'USER' ? "justify-end" : msg.sender === 'SYSTEM' ? "justify-center" : "justify-start"
                            )}
                        >
                            <div
                                className={cn(
                                    "max-w-[80%] px-4 py-3 text-sm shadow-sm",
                                    msg.sender === 'USER'
                                        ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-sm"
                                        : msg.sender === 'SYSTEM'
                                            ? "bg-muted/50 text-muted-foreground text-xs rounded-full px-6 py-1 shadow-none italic"
                                            : "bg-muted text-foreground rounded-2xl rounded-tl-sm"
                                )}
                            >
                                {msg.content}
                            </div>
                        </div>
                    ))}
                    {isLoading && (
                        <div className="flex w-full justify-start">
                            <div className="bg-muted px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                <span className="w-2 h-2 bg-foreground/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                            </div>
                        </div>
                    )}
                </div>
            </ScrollArea>

            {/* Composer */}
            <div className="p-4 bg-background border-t">
                <div className="flex items-center gap-2 bg-muted/50 p-2 rounded-full border border-input focus-within:border-primary/50 transition-colors">
                    <GiftSelector onSendGift={handleSendGift} />
                    <Input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Type a message..."
                        className="border-none bg-transparent focus-visible:ring-0 shadow-none px-2"
                    />
                    <Button variant="ghost" size="icon" className="rounded-full text-muted-foreground hover:text-primary">
                        <Mic className="w-5 h-5" />
                    </Button>
                    <Button
                        onClick={handleSend}
                        size="icon"
                        className="rounded-full bg-gradient-to-r from-primary to-secondary hover:opacity-90 transition-opacity"
                        disabled={!inputValue.trim() || isLoading}
                    >
                        <Send className="w-4 h-4 text-white" />
                    </Button>
                </div>
                {!isPremium && (
                    <div className="text-center mt-2 text-xs text-muted-foreground">
                        {DAILY_LIMIT - dailyCount} messages left today
                    </div>
                )}
            </div>

            <DayPass
                isOpen={isDayPassOpen}
                onClose={() => setIsDayPassOpen(false)}
                onSuccess={() => {
                    setDailyCount(0);
                    toast.success("You're back in action!");
                }}
            />
        </div>
    );
};
