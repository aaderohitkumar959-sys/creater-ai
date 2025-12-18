/**
 * Dynamic Chat Page (Server Component)
 * Handles /chat/[id] routes and renders ChatUI
 */

import { ChatUI } from '@/components/chat/ChatUI';
import { notFound } from 'next/navigation';

// Mock function to get persona details by ID
async function getPersona(id: string) {
    const personas: Record<string, any> = {
        'captain-blackheart': {
            id: 'captain-blackheart',
            name: 'Captain Blackheart',
            avatar: 'https://lh3.googleusercontent.com/d/1_zjNiswAGxTbleMPxbR1KUsnAjtElVQQ',
            isPremium: false,
        },
        'luna-starweaver': {
            id: 'luna-starweaver',
            name: 'Luna Starweaver',
            avatar: 'https://lh3.googleusercontent.com/d/1WYUgmmSGrbiN2xx7tYK2mqZnr6_8FjpI',
            isPremium: false,
        },
        'ryuko-firestorm': {
            id: 'ryuko-firestorm',
            name: 'Ryuko Firestorm',
            avatar: 'https://lh3.googleusercontent.com/d/1e5i1htBgZ2ef6DlPQG6P1_RNBZ1dWhON',
            isPremium: false,
        },
        'kenji-shadowblade': {
            id: 'kenji-shadowblade',
            name: 'Kenji Shadowblade',
            avatar: 'https://lh3.googleusercontent.com/d/1NjzDmT-NoQka2c4-aCjBMdj-aIZBoSeF',
            isPremium: false,
        },
        'aiko-moonlight': {
            id: 'aiko-moonlight',
            name: 'Aiko Moonlight',
            avatar: 'https://lh3.googleusercontent.com/d/1L559UR3NA144sUlODryF-_qNpWIiR-O9',
            isPremium: false,
        },
        'sakura-dreamwalker': {
            id: 'sakura-dreamwalker',
            name: 'Sakura Dreamwalker',
            avatar: 'https://lh3.googleusercontent.com/d/1PTsCoZtNIze7gXSMOu-ulBG2SRZfFADu',
            isPremium: false,
        },
        'dr-maya-chen': {
            id: 'dr-maya-chen',
            name: 'Dr. Maya Chen',
            avatar: 'https://lh3.googleusercontent.com/d/1KlMIPKYWBZEwpkmK7KythAFoaJ7Et9kF',
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
