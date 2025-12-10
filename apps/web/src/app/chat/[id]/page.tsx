
import { ChatInterface } from "@/components/chat/ChatInterface";
import { notFound } from "next/navigation";
import { Metadata } from "next";

// Force dynamic rendering since we're fetching individual persona data
export const dynamic = 'force-dynamic';

async function getPersona(id: string) {
    try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personas/${id}`, {
            cache: 'no-store'
        });
        if (!res.ok) return null;
        return res.json();
    } catch (e) {
        console.error("Error fetching persona:", e);
        return null;
    }
}

export async function generateMetadata({ params }: { params: { id: string } }): Promise<Metadata> {
    const persona = await getPersona(params.id);
    if (!persona) return { title: 'Chat Not Found' };
    return {
        title: `Chat with ${persona.name} | CreatorAI`,
        description: `Start a conversation with ${persona.name}.`,
    };
}

export default async function DynamicChatPage({ params }: { params: { id: string } }) {
    const persona = await getPersona(params.id);

    if (!persona) {
        notFound();
    }

    return (
        <ChatInterface
            persona={{
                id: persona.id,
                name: persona.name,
                avatarUrl: persona.avatarUrl || "/placeholder.png",
                isPremium: false // TODO: Fetch premium status if available in API response
            }}
        />
    );
}
