"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { MessageCircle, Sparkles } from "lucide-react"

interface Persona {
    id: string
    name: string
    description: string
    avatarUrl: string
    personality: any
}

export default function ExplorePage() {
    const [personas, setPersonas] = useState<Persona[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        fetchPersonas()
    }, [])

    const fetchPersonas = async () => {
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'
            const res = await fetch(`${apiUrl}/personas`)
            if (res.ok) {
                const data = await res.json()
                setPersonas(data)
            }
        } catch (error) {
            console.error("Failed to fetch personas:", error)
        } finally {
            setIsLoading(false)
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="text-center">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 animate-pulse text-primary" />
                    <p className="text-muted-foreground">Loading AI characters...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold mb-2">Explore AI Characters</h1>
                    <p className="text-muted-foreground">Choose an AI character to start chatting with</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {personas.map((persona) => (
                        <Card key={persona.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start gap-4 mb-4">
                                    <div className="w-16 h-16 rounded-full overflow-hidden bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-white text-2xl font-bold flex-shrink-0">
                                        {persona.avatarUrl ? (
                                            <img src={persona.avatarUrl} alt={persona.name} className="w-full h-full object-cover" />
                                        ) : (
                                            persona.name[0]
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-xl mb-1 truncate">{persona.name}</h3>
                                        <p className="text-sm text-muted-foreground line-clamp-2">
                                            {persona.description || "An AI character"}
                                        </p>
                                    </div>
                                </div>

                                <Link href={`/chat?personaId=${persona.id}&name=${encodeURIComponent(persona.name)}`}>
                                    <Button className="w-full" size="lg">
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        Start Chat
                                    </Button>
                                </Link>
                            </div>
                        </Card>
                    ))}
                </div>

                {personas.length === 0 && (
                    <div className="text-center py-12">
                        <Sparkles className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">No AI characters available yet</p>
                    </div>
                )}
            </div>
        </div>
    )
}
