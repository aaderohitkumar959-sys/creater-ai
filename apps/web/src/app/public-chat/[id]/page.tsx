import { ChatUI } from '@/components/chat/ChatUI';
import { PERSONAS } from '@/lib/personas';
import { notFound } from 'next/navigation';

export default async function PublicChatPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;

    // Use our hardcoded MVP personas
    // If ID doesn't exist, default to Aria (our star) or 404
    const persona = PERSONAS[id];

    if (!persona) {
        // Option 1: Redirect to default
        // redirect('/public-chat/aria');

        // Option 2: Show default
        return <ChatUI persona={PERSONAS['aria']} />;
    }

    return <ChatUI persona={persona} />;
}
