import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

interface ChatResponse {
    userMessage: any;
    aiMessage: any;
    tokensUsed: number;
    model: string;
    remainingMessages?: number;
}

export function useChat() {
    const { user } = useAuth();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<any>(null);

    const sendMessage = async (personaId: string, message: string): Promise<any> => {
        if (!user) throw new Error('User not authenticated');

        setIsLoading(true);
        setError(null);

        try {
            const token = await user.getIdToken();
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    personaId,
                    message,
                }),
            });

            if (!res.ok) {
                const errorData = await res.json();
                const error = new Error(errorData.message || 'Failed to send message');
                (error as any).response = res;
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
