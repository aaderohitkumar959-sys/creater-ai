/**
 * Dynamic Chat Page (Server Component)
 * Handles /chat/[id] routes and renders ChatUI
 */

import { ChatUI } from '@/components/chat/ChatUI';
import { notFound } from 'next/navigation';

// Function to get persona details by ID from API
async function getPersona(id: string) {
    try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://creator-ai-api.onrender.com';
        const response = await fetch(`${baseUrl}/personas/${id}`, {
            next: { revalidate: 3600 } // Cache for 1 hour
        });

        if (!response.ok) return null;

        const data = await response.json();
        return {
            id: data.id,
            name: data.name,
            avatar: data.avatarUrl || '',
            isPremium: false,
        };
    } catch (error) {
        console.error('Failed to fetch persona:', error);
        return null;
    }
}

export default async function DynamicChatPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    // Await params for Next.js 15 compatibility
    const { id } = await params;
    const persona = await getPersona(id);

    // Fallback dictionary for common personas if API fails
    const fallbacks: Record<string, any> = {
        'elara-vance': { id: 'elara-vance', name: 'Elara Vance', avatar: '/avatars/elara.png', isPremium: false },
        'roxy-blaze': { id: 'roxy-blaze', name: 'Roxy Blaze', avatar: '/avatars/roxy.png', isPremium: false },
        'yuki-kitsune': { id: 'yuki-kitsune', name: 'Yuki Kitsune', avatar: '/avatars/yuki.png', isPremium: false },
        'akane-blade': { id: 'akane-blade', name: 'Akane Blade', avatar: '/avatars/akane.png', isPremium: false },
        'luna-star': { id: 'luna-star', name: 'Luna Star', avatar: '/avatars/luna.png', isPremium: false },
        'ivy-care': { id: 'ivy-care', name: 'Ivy Care', avatar: '/avatars/ivy.png', isPremium: false },
        'ara-ara': { id: 'ara-ara', name: 'Ara Ara', avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=AraAra', isPremium: false },
        'pixel-kat': { id: 'pixel-kat', name: 'Pixel Kat', avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=PixelKat', isPremium: false },
        'zara-gold': { id: 'zara-gold', name: 'Zara Gold', avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ZaraGold', isPremium: false },
        'elenora': { id: 'elenora', name: 'Elenora', avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=Elenora', isPremium: false },
        'mia-shy': { id: 'mia-shy', name: 'Mia Shy', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MiaShy', isPremium: false },
        'dr-sophia': { id: 'dr-sophia', name: 'Dr. Sophia', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DrSophia', isPremium: false },
        'zen-master': { id: 'zen-master', name: 'Zen Master', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=ZenMaster', isPremium: false },
        'dev-dave': { id: 'dev-dave', name: 'Dev Dave', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=DevDave', isPremium: false },
        'rin-tsun': { id: 'rin-tsun', name: 'Rin Tsun', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RinTsun', isPremium: false },
        'morgana': { id: 'morgana', name: 'Morgana', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Morgana', isPremium: false },
        'melody-pop': { id: 'melody-pop', name: 'Melody Pop', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MelodyPop', isPremium: false },
        'madame-fate': { id: 'madame-fate', name: 'Madame Fate', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=MadameFate', isPremium: false },
        'liam-heart': { id: 'liam-heart', name: 'Liam Heart', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=LiamHeart', isPremium: false },
        'rex-alpha': { id: 'rex-alpha', name: 'Rex Alpha', avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=RexAlpha', isPremium: false },
    };

    if (!persona && !fallbacks[id]) {
        notFound();
    }

    return <ChatUI persona={persona || fallbacks[id]} />;
}
