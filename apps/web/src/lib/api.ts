import { getSession } from "next-auth/react";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
    const session = await getSession();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const token = (session as any)?.accessToken; // Assuming accessToken is available in session
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const userId = (session as any)?.user?.id;

    const headers = {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers,
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'An error occurred' }));
        throw new Error(error.message || response.statusText);
    }

    return response.json();
}

export const api = {
    getCoinPacks: async () => {
        return fetchWithAuth('/payment/coin-packs');
    },

    createStripePaymentIntent: async (coinPackId: string) => {
        const session = await getSession();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userId = (session as any)?.user?.id || 'user-placeholder';

        return fetchWithAuth('/payment/stripe/create-intent', {
            method: 'POST',
            body: JSON.stringify({ userId, coinPackId }),
        });
    },

    createRazorpayOrder: async (coinPackId: string) => {
        const session = await getSession();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userId = (session as any)?.user?.id || 'user-placeholder';

        return fetchWithAuth('/payment/razorpay/create-order', {
            method: 'POST',
            body: JSON.stringify({ userId, coinPackId }),
        });
    },

    getWalletBalance: async () => {
        const session = await getSession();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userId = (session as any)?.user?.id || 'user-placeholder';

        const result = await fetchWithAuth(`/coin/balance/${userId}`);
        return result.balance;
    },

    getTransactionHistory: async () => {
        const session = await getSession();
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userId = (session as any)?.user?.id || 'user-placeholder';

        return fetchWithAuth(`/coin/transactions/${userId}`);
    },

    checkAdAvailability: async () => {
        return fetchWithAuth('/coin/ad-reward/check-availability', {
            method: 'POST',
        });
    },

    validateAdReward: async (data: { adToken: string; adProvider: string }) => {
        return fetchWithAuth('/coin/ad-reward/validate', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    // Admin Endpoints
    getAdminStats: async () => {
        return fetchWithAuth('/admin/stats');
    },

    getAdminUsers: async (page = 1, search = '') => {
        return fetchWithAuth(`/admin/users?page=${page}&search=${search}`);
    },

    updateUserRole: async (userId: string, role: string) => {
        return fetchWithAuth(`/admin/users/${userId}/role`, {
            method: 'PATCH',
            body: JSON.stringify({ role }),
        });
    },

    getAdminCreatorStats: async () => {
        return fetchWithAuth('/admin/creators/stats');
    },

    getPersonas: async (search?: string, category?: string) => {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (category && category !== 'All') params.append('category', category);
        return fetchWithAuth(`/personas?${params.toString()}`);
    },

    getCreatorDashboard: async () => {
        return fetchWithAuth('/creator/dashboard');
    },

    getConversations: async () => {
        return fetchWithAuth('/chat/conversations');
    },

    redeemCode: async (userId: string, code: string) => {
        return fetchWithAuth('/payment/redeem', {
            method: 'POST',
            body: JSON.stringify({ userId, code }),
        });
    },

    verifyPayPalPayment: async (userId: string, paypalTxnId: string) => {
        return fetchWithAuth('/payment/verify-paypal', {
            method: 'POST',
            body: JSON.stringify({ userId, paypalTxnId }),
        });
    },
    // Admin Chat Viewer
    getAdminUserConversations: async (userId: string) => {
        return fetchWithAuth(`/admin/users/${userId}/conversations`);
    },

    getAdminConversationMessages: async (conversationId: string) => {
        return fetchWithAuth(`/admin/conversations/${conversationId}/messages`);
    },
};

