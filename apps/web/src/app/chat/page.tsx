"use client"

import { Suspense, useEffect, useState } from "react"
import ChatInterface from "@/components/chat/chat-interface"
import { useSearchParams } from "next/navigation"
import { useSession } from "next-auth/react"

function ChatContent() {
    const searchParams = useSearchParams()
    const { data: session } = useSession()
    const [userId, setUserId] = useState<string>("")

    const conversationId = searchParams.get("id") || ""
    const personaId = searchParams.get("personaId") || ""
    const personaName = searchParams.get("name") || "AI Persona"

    useEffect(() => {
        // Use logged-in user ID or create guest session
        if (session?.user?.id) {
            setUserId(session.user.id)
        } else {
            // Generate or retrieve guest user ID from localStorage
            let guestId = localStorage.getItem("guestUserId")
            if (!guestId) {
                guestId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
                localStorage.setItem("guestUserId", guestId)
            }
            setUserId(guestId)
        }
    }, [session])

    if (!userId) {
        return <div className="flex items-center justify-center h-screen">Loading chat...</div>
    }

    return (
        <ChatInterface
            conversationId={conversationId}
            personaId={personaId}
            personaName={personaName}
            userId={userId}
        />
    )
}

export default function ChatPage() {
    return (
        <Suspense fallback={<div>Loading chat...</div>}>
            <ChatContent />
        </Suspense>
    )
}
