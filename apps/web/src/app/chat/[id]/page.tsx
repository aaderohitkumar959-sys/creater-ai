/**
 * Dynamic Chat Page (Server Component)
 * Handles /chat/[id] routes and renders ChatUI
 */

import { ChatUI } from '@/components/chat/ChatUI';
import { notFound } from 'next/navigation';

// Mock function to get persona details by ID
async function getPersona(id: string) {
    const personas: Record<string, any> = {
        't1': {
            id: 't1',
            name: 'Levi Ackerman',
            avatar: 'https://lh3.googleusercontent.com/d/1_zjNiswAGxTbleMPxbR1KUsnAjtElVQQ',
            isPremium: false,
        },
        't2': {
            id: 't2',
            name: 'Gojo Satoru',
            avatar: 'https://lh3.googleusercontent.com/d/1WYUgmmSGrbiN2xx7tYK2mqZnr6_8FjpI',
            isPremium: false,
        },
        't3': {
            id: 't3',
            name: 'Queen Medusa',
            avatar: 'https://lh3.googleusercontent.com/d/1e5i1htBgZ2ef6DlPQG6P1_RNBZ1dWhON',
            isPremium: false,
        },
        't4': {
            id: 't4',
            name: 'Jake',
            avatar: '',
            isPremium: false,
        },
        't5': {
            id: 't5',
            name: 'Aria',
            avatar: '',
            isPremium: false,
        },
        't6': {
            id: 't6',
            name: 'Noah',
            avatar: '',
            isPremium: false,
        },
    };

    return personas[id] || null;
}

export default async function DynamicChatPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Await params for Next.js 15 compatibility
    const { id } = await params;
    const persona = await getPersona(id);

    if (!persona) {
        notFound();
    }

    return <ChatUI persona={persona} />;
}
