import { useState } from 'react';
import { useSession } from 'next-auth/react';

interface ChatResponse {
    userMessage: any;
    aiMessage: any;
    tokensUsed: number;
    model: string;
    remainingMessages?: number;
}

export function useChat() {
    const { data: session } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const sendMessage = async (personaId: string, message: string): Promise<any> => {
        if (!session?.user?.id) throw new Error('User not authenticated');

        setIsLoading(true);
        setError(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.user.accessToken || ''}` // Assuming token is needed
                },
                body: JSON.stringify({
                    userId: session.user.id,
                    personaId,
                    message,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                const error = new Error(errorData.message || 'Failed to send message');
                (error as any).response = res; // Attach response for status check
                throw error;
            }

            const data: ChatResponse = await res.json();
            return data.aiMessage;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setIsLoading(false);
        }
    };

    return {
        sendMessage,
        isLoading,
        error,
    };
}
