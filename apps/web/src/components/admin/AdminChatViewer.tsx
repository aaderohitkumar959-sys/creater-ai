import { useState, useEffect } from "react";
import { api } from "@/lib/api";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Loader2, MessageSquare, User, Bot } from "lucide-react";
import { format } from "date-fns";

interface AdminChatViewerProps {
    userId: string | null;
    userName: string;
    isOpen: boolean;
    onClose: () => void;
}

interface Conversation {
    id: string;
    persona: {
        name: string;
        avatarUrl: string | null;
        role: string | null;
    };
    _count: {
        messages: number;
    };
    updatedAt: string;
}

interface Message {
    id: string;
    content: string;
    sender: "USER" | "ASSISTANT" | "SYSTEM";
    createdAt: string;
}

export function AdminChatViewer({ userId, userName, isOpen, onClose }: AdminChatViewerProps) {
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loadingConvos, setLoadingConvos] = useState(false);
    const [loadingMessages, setLoadingMessages] = useState(false);

    useEffect(() => {
        if (isOpen && userId) {
            loadConversations(userId);
            setSelectedConversationId(null);
            setMessages([]);
        }
    }, [isOpen, userId]);

    useEffect(() => {
        if (selectedConversationId) {
            loadMessages(selectedConversationId);
        }
    }, [selectedConversationId]);

    const loadConversations = async (uid: string) => {
        setLoadingConvos(true);
        try {
            const data = await api.getAdminUserConversations(uid);
            setConversations(data);
        } catch (error) {
            console.error("Failed to load conversations", error);
        } finally {
            setLoadingConvos(false);
        }
    };

    const loadMessages = async (convId: string) => {
        setLoadingMessages(true);
        try {
            const data = await api.getAdminConversationMessages(convId);
            setMessages(data);
        } catch (error) {
            console.error("Failed to load messages", error);
        } finally {
            setLoadingMessages(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0 gap-0 overflow-hidden bg-[#0f0f15] border-gray-800 text-white">
                <DialogHeader className="p-4 border-b border-gray-800 bg-[#13131a]">
                    <DialogTitle className="flex items-center gap-2">
                        <User size={18} className="text-blue-400" />
                        Viewing Chats for: <span className="text-blue-400">{userName}</span>
                    </DialogTitle>
                </DialogHeader>

                <div className="flex flex-1 overflow-hidden">
                    {/* Sidebar: Conversations List */}
                    <div className="w-1/3 border-r border-gray-800 bg-[#13111c]">
                        <div className="p-3 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-[#1a1825]">
                            Conversations ({conversations.length})
                        </div>
                        <ScrollArea className="h-full">
                            {loadingConvos ? (
                                <div className="flex justify-center p-8">
                                    <Loader2 className="animate-spin text-gray-500" />
                                </div>
                            ) : conversations.length === 0 ? (
                                <div className="p-8 text-center text-gray-500 text-sm">
                                    No conversations found.
                                </div>
                            ) : (
                                <div className="flex flex-col">
                                    {conversations.map((conv) => (
                                        <button
                                            key={conv.id}
                                            onClick={() => setSelectedConversationId(conv.id)}
                                            className={`flex items-center gap-3 p-4 text-left hover:bg-[#1f1d2b] transition-colors border-b border-gray-800/50 ${selectedConversationId === conv.id ? "bg-[#1f1d2b] border-l-2 border-l-blue-500" : ""
                                                }`}
                                        >
                                            <Avatar className="w-10 h-10 border border-white/10">
                                                <AvatarImage src={conv.persona.avatarUrl || undefined} />
                                                <AvatarFallback>{conv.persona.name[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm text-gray-200 truncate">
                                                    {conv.persona.name}
                                                </div>
                                                <div className="text-xs text-gray-500 flex justify-between mt-1">
                                                    <span>{conv._count.messages} msgs</span>
                                                    <span>{format(new Date(conv.updatedAt), "MMM d")}</span>
                                                </div>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>

                    {/* Main Area: Message History */}
                    <div className="flex-1 flex flex-col bg-[#0f0f15]">
                        {selectedConversationId ? (
                            <>
                                <div className="p-3 border-b border-gray-800 bg-[#1a1825] flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-300">TRANSCRIPT</span>
                                    <span className="text-xs text-gray-500">{messages.length} messages</span>
                                </div>
                                <ScrollArea className="flex-1 p-4">
                                    {loadingMessages ? (
                                        <div className="flex justify-center p-12">
                                            <Loader2 className="animate-spin text-gray-500" />
                                        </div>
                                    ) : (
                                        <div className="space-y-4 pb-4">
                                            {messages.map((msg) => (
                                                <div
                                                    key={msg.id}
                                                    className={`flex gap-3 ${msg.sender === "USER" ? "justify-end" : "justify-start"
                                                        }`}
                                                >
                                                    {msg.sender !== "USER" && (
                                                        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                                                            <Bot size={14} className="text-white" />
                                                        </div>
                                                    )}

                                                    <div
                                                        className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm leading-relaxed ${msg.sender === "USER"
                                                                ? "bg-blue-600 text-white rounded-tr-sm"
                                                                : "bg-[#272533] text-gray-200 rounded-tl-sm border border-gray-700"
                                                            }`}
                                                    >
                                                        {msg.content}
                                                    </div>

                                                    {msg.sender === "USER" && (
                                                        <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                                                            <User size={14} className="text-white" />
                                                        </div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center text-gray-500 gap-2">
                                <MessageSquare size={40} className="opacity-20" />
                                <p>Select a conversation to view transcript</p>
                            </div>
                        )}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
