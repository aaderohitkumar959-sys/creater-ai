import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/components/providers";
import { LayoutContent } from "@/components/layout/LayoutContent";
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: {
    default: "CreaterAI - You are heard.",
    template: "%s | CreaterAI"
  },
  description: "CreaterAI is a private AI character chat platform where users can talk freely, feel understood, and connect emotionally with AI characters.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
  verification: {
    google: "o1x9_gl5NqiQCYzRxaUFVgOpN4tPs2IB8S9UkqP8N8M",
  },
  openGraph: {
    type: "website",
    siteName: "CreaterAI",
    title: "CreaterAI – You are heard.",
    description: "A private space for when you're overwhelmed. No judgment. No expectations. Just presence.",
    images: ["/brand-logo.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "CreaterAI – You are heard.",
    description: "A private space with high-fidelity presence. No judgment. No expectations.",
    images: ["/brand-logo.png"],
  },
};

import { AuthProvider } from "@/contexts/AuthContext";

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
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover, interactive-widget=resizes-content" />
      </head>
      <body
        className="antialiased bg-[var(--bg-primary)] text-[var(--text-primary)]"
        style={{ minHeight: '100vh', fontFamily: 'Inter, sans-serif' }}
        suppressHydrationWarning
      >
        <Providers>
          <AuthProvider>
            <LayoutContent>
              {children}
            </LayoutContent>
          </AuthProvider>

          {/* Vercel Analytics - Privacy-friendly page tracking */}
          <Analytics />

          {/* Speed Insights - Core Web Vitals monitoring */}
          <SpeedInsights />
        </Providers>
      </body>
    </html>
  );
}
