"use client"

import { useEffect, useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { StreamingMessage } from "./StreamingMessage"
import { TypingIndicator } from "./TypingIndicator"
import { MessageActions } from "./MessageActions"
import { Send, Coins } from "lucide-react"
import { toast } from "react-hot-toast"

interface Message {
    id?: string
    sender: "USER" | "CREATOR"
    content: string
    timestamp: Date
    isStreaming?: boolean
}

interface ChatInterfaceProps {
    conversationId: string
    personaId: string
    personaName: string
    userId: string
}

export default function ChatInterface({ conversationId, personaId, personaName, userId }: ChatInterfaceProps) {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [streamingMessage, setStreamingMessage] = useState<string>("")
    const [coinBalance, setCoinBalance] = useState<number | null>(null)
    const messagesEndRef = useRef<HTMLDivElement>(null)
    const eventSourceRef = useRef<EventSource | null>(null)
    const messageProcessedRef = useRef<boolean>(false)

    useEffect(() => {
        // Load existing messages
        loadMessages()
        // Load coin balance
        loadBalance()

        return () => {
            // Cleanup event source on unmount
            if (eventSourceRef.current) {
                eventSourceRef.current.close()
            }
        }
    }, [conversationId])

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, streamingMessage])

    const loadMessages = async () => {
        try {
            // TODO: Replace with actual API call
            const res = await fetch(`/api/chat/${conversationId}/messages`)
            if (res.ok) {
                const data = await res.json()
                setMessages(data)
            }
        } catch (error) {
            console.error("Failed to load messages:", error)
        }
    }

    const loadBalance = async () => {
        try {
            // TODO: Replace with actual API call
            const res = await fetch('/api/wallet/balance')
            if (res.ok) {
                const data = await res.json()
                setCoinBalance(data.balance)
            }
        } catch (error) {
            console.error("Failed to load balance:", error)
        }
    }


    const sendMessage = async () => {
        if (!input.trim()) return

        // Check coin balance
        if (coinBalance !== null && coinBalance < 2) {
            toast.error("Insufficient coins! Please purchase more.")
            return
        }

        const userMessage: Message = {
            sender: "USER",
            content: input,
            timestamp: new Date(),
        }

        const messageToSend = input
        setMessages(prev => [...prev, userMessage])
        setInput("")
        setIsLoading(true)
        setStreamingMessage("")
        messageProcessedRef.current = false

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const url = `${apiUrl}/chat/stream?personaId=${personaId}&message=${encodeURIComponent(messageToSend)}&userId=${userId}`

            console.log('Fetching SSE stream from:', url)

            const response = await fetch(url)

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`)
            }

            if (!response.body) {
                throw new Error('Response body is null')
            }

            const reader = response.body.getReader()
            const decoder = new TextDecoder()
            let buffer = ''
            let accumulatedContent = ''

            while (true) {
                const { done, value } = await reader.read()

                if (done) {
                    console.log('Stream ended')
                    break
                }

                buffer += decoder.decode(value, { stream: true })
                const lines = buffer.split('\n')
                buffer = lines.pop() || ''

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        try {
                            const parsed = JSON.parse(data)
                            console.log('Parsed SSE data:', parsed)

                            if (parsed.type === 'chunk') {
                                accumulatedContent += (parsed.content || '')
                                setStreamingMessage(accumulatedContent)
                            } else if (parsed.type === 'complete') {
                                if (messageProcessedRef.current) {
                                    console.log('Already processed, skipping')
                                    continue
                                }
                                messageProcessedRef.current = true

                                const finalMessage: Message = {
                                    id: parsed.messageId,
                                    sender: "CREATOR",
                                    content: accumulatedContent,
                                    timestamp: new Date(),
                                }

                                setMessages(msgs => [...msgs, finalMessage])
                                setStreamingMessage("")
                                setIsLoading(false)

                                if (coinBalance !== null) {
                                    setCoinBalance(coinBalance - 2)
                                }

                                reader.releaseLock()
                                return
                            } else if (parsed.type === 'error') {
                                console.error('Backend error:', parsed.message)
                                toast.error(parsed.message || 'An error occurred')
                                setIsLoading(false)
                                setStreamingMessage("")
                                reader.releaseLock()
                                return
                            }
                        } catch (e) {
                            console.error('Error parsing SSE data:', e, 'Raw:', data)
                        }
                    }
                }
            }

        } catch (error: any) {
            console.error("Error sending message:", error)
            toast.error(`Failed to get response: ${error.message}`)
            setIsLoading(false)
            setStreamingMessage("")
        }
    }

    const handleRegenerate = () => {
        // Remove last AI message and regenerate
        const lastUserMsg = messages.filter(m => m.sender === 'USER').pop()
        if (lastUserMsg) {
            setMessages(prev => prev.filter(m => m !== messages[messages.length - 1]))
            setInput(lastUserMsg.content)
            // User can click send to regenerate
        }
    }

    return (
        <div className="flex flex-col h-screen bg-background">
            {/* Header */}
            <div className="border-b bg-card px-4 py-3 flex items-center justify-between">
                <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white font-semibold">
                        {personaName[0]}
                    </div>
                    <div className="ml-3">
                        <h2 className="font-semibold text-lg">{personaName}</h2>
                        <p className="text-xs text-muted-foreground">AI Persona</p>
                    </div>
                </div>

                {coinBalance !== null && (
                    <div className="flex items-center gap-1 px-3 py-1 bg-yellow-50 dark:bg-yellow-950 rounded-full border border-yellow-200 dark:border-yellow-800">
                        <Coins className="w-4 h-4 text-yellow-600" />
                        <span className="text-sm font-semibold">{coinBalance}</span>
                    </div>
                )}
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div
                        key={idx}
                        className={`flex ${msg.sender === "USER" ? "justify-end" : "justify-start"}`}
                    >
                        <div
                            className={`group max-w-[70%] ${msg.sender === "USER" ? "" : "w-full max-w-2xl"}`}
                        >
                            <div
                                className={`px-4 py-3 rounded-2xl ${msg.sender === "USER"
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted"
                                    }`}
                            >
                                {msg.isStreaming ? (
                                    <StreamingMessage content={msg.content} isComplete={false} />
                                ) : (
                                    <p className="whitespace-pre-wrap">{msg.content}</p>
                                )}
                            </div>

                            {msg.sender === "CREATOR" && !msg.isStreaming && (
                                <div className="mt-1 px-2">
                                    <MessageActions
                                        messageId={msg.id || ''}
                                        content={msg.content}
                                        onRegenerate={idx === messages.length - 1 ? handleRegenerate : undefined}
                                    />
                                </div>
                            )}

                            <div className={`text-xs text-muted-foreground mt-1 px-2 ${msg.sender === "USER" ? "text-right" : ""}`}>
                                {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                        </div>
                    </div>
                ))}

                {/* Streaming message */}
                {streamingMessage && (
                    <div className="flex justify-start">
                        <div className="group max-w-[70%]">
                            <div className="px-4 py-3 rounded-2xl bg-muted">
                                <StreamingMessage content={streamingMessage} isComplete={false} speed={10} />
                            </div>
                        </div>
                    </div>
                )}

                {/* Typing indicator */}
                {isLoading && !streamingMessage && (
                    <div className="flex justify-start">
                        <TypingIndicator />
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="border-t bg-card px-4 py-3">
                <form onSubmit={(e) => {
                    e.preventDefault()
                    sendMessage()
                }} className="flex items-end gap-2 max-w-4xl mx-auto">
                    <div className="flex-1 relative">
                        <textarea
                            value={input}
                            onChange={(e) => setInput(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === "Enter" && !e.shiftKey) {
                                    e.preventDefault()
                                    // Don't call sendMessage here - let form submit handle it
                                    const form = e.currentTarget.form
                                    if (form) {
                                        form.requestSubmit()
                                    }
                                }
                            }}
                            placeholder="Type a message... (2 coins per message)"
                            className="w-full px-4 py-3 pr-12 border rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary resize-none bg-background"
                            rows={1}
                            style={{ minHeight: '48px', maxHeight: '120px' }}
                            disabled={isLoading}
                        />
                    </div>
                    <Button
                        type="submit"
                        disabled={!input.trim() || isLoading}
                        size="lg"
                        className="rounded-full h-12 w-12 p-0"
                    >
                        <Send className="h-5 w-5" />
                    </Button>
                </form>

                <p className="text-xs text-center text-muted-foreground mt-2">
                    Press Enter to send • Shift + Enter for new line • 2 coins per message
                </p>
            </div>
        </div>
    )
}
