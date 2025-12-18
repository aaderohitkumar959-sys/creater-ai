import { NextAuthOptions } from "next-auth"
import GoogleProvider from "next-auth/providers/google"

export const authOptions: NextAuthOptions = {
    providers: [
        GoogleProvider({
            clientId: process.env.GOOGLE_CLIENT_ID || "",
            clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
        }),
    ],
    session: {
        strategy: "jwt",
    },
    pages: {
        signIn: '/login',
        error: '/login', // Redirect errors to login page
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = user.id;
                token.email = user.email;

                // Call backend to sync user and get JWT
                try {
                    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://creator-ai-api.onrender.com';
                    const response = await fetch(`${baseUrl}/auth/login`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            id: user.id,
                            email: user.email,
                            name: user.name,
                            image: user.image,
                        }),
                    });

                    if (response.ok) {
                        const data = await response.json();
                        token.accessToken = data.accessToken;
                    }
                } catch (error) {
                    console.error('Backend sync error in NextAuth:', error);
                }
            }
            return token;
        },
        async session({ session, token }: any) {
            if (session.user) {
                session.user.id = token.id as string;
                session.user.email = token.email as string;
                session.accessToken = token.accessToken as string;
            }
            return session;
        },
    },
}
