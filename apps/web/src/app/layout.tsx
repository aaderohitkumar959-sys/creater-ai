import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CreatorAI - AI Character Platform",
  description: "Build and monetize Instagram-style AI characters",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icon-192x192.png",
  },
  themeColor: "#3b82f6",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          <div className="flex flex-col min-h-screen">
            <div className="flex-grow">
              {children}
            </div>
            <footer className="py-6 text-center text-sm text-muted-foreground border-t mt-auto">
              <div className="container mx-auto flex justify-center gap-6">
                <a href="/terms" className="hover:underline">Terms of Service</a>
                <a href="/privacy" className="hover:underline">Privacy Policy</a>
                <span>© {new Date().getFullYear()} CreatorAI</span>
              </div>
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}


