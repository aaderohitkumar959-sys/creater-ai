import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { LayoutContent } from "@/components/layout/LayoutContent";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: "Syelope - AI Character Platform",
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
  console.log("ROOT LAYOUT LOADED", Date.now());
  return (
    <html lang="en" suppressHydrationWarning style={{ backgroundColor: '#0B0F14' }}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0" />
      </head>
      <body
        className="antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]"
        style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}
        suppressHydrationWarning
      >
        <Providers>
          <LayoutContent>
            {children}
          </LayoutContent>

          {/* Vercel Analytics - Privacy-friendly page tracking */}
          <Analytics />

          {/* Speed Insights - Core Web Vitals monitoring */}
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
