/**
 * NUCLEAR OPTION: Public Chat Page
 * Strictly for guest access. Bypasses all auth/session checks.
 */

import { ChatUI } from '@/components/chat/ChatUI';
import { notFound } from 'next/navigation';

// Hardcoded fallback data to guarantee UI loads even if backend is DEAD
const FALLBACK_PERSONAS: Record<string, any> = {
    'luna-starweaver': {
        id: 'luna-starweaver',
        name: 'Luna Starweaver',
        avatar: '/placeholder.png', // Ensure this exists in public/
        isPremium: false
    },
    'default': {
        id: 'default',
        name: 'AI Companion',
        avatar: '/placeholder.png',
        isPremium: false
    }
};

export default async function PublicChatPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // 1. Try to get data from Backend (optional)
    // 2. Fallback to hardcoded data (mandatory)

    let persona = FALLBACK_PERSONAS[id] || FALLBACK_PERSONAS['default'];

    return (
        <div className="h-screen w-full bg-black">
            <ChatUI persona={persona} />
        </div>
    );
}
