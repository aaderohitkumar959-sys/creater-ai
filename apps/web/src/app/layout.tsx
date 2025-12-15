import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from 'react-hot-toast';
import { DailyRewardCheck } from '@/components/gamification/DailyRewardCheck';
import { BottomNav } from '@/components/navigation/bottom-nav';

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

const outfit = Outfit({
  variable: "--font-display",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CreatorAI - AI Character Platform",
  description: "Chat with unique AI personalities. Your AI companion awaits.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: '#0B0F14' }}>
      <body
        className={`${inter.variable} ${outfit.variable} antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]`}
        style={{ minHeight: '100vh' }}
        suppressHydrationWarning
      >
        <Providers>
          {/* Main content with bottom padding for nav */}
          <div className="pb-nav">
            {children}
          </div>

          {/* Bottom Navigation - Global */}
          <BottomNav />

          {/* Toast Notifications */}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: 'rgba(14, 22, 35, 0.9)',
                color: '#fff',
                border: '1px solid rgba(255, 255, 255, 0.1)',
                backdropFilter: 'blur(15px)',
              },
            }}
          />

          {/* Daily Reward Check */}
          <DailyRewardCheck />
        </Providers>
      </body>
    </html>
  );
}

