/**
 * Home Page - Logged In User's Main Screen
 * Mobile-first Instagram/Character.ai hybrid experience
 */

'use client';

import React, { useEffect, useState } from 'react';
import { TopBar } from '@/components/navigation/top-bar';
import { ContinueChatting } from '@/components/home/continue-chatting';
import { PinnedAIs } from '@/components/home/pinned-ais';
import { TrendingGrid } from '@/components/home/trending-grid';
import { useSession } from 'next-auth/react';
import { cn } from '@/lib/utils';
import { Coins, Sparkles, User, ArrowRight } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock data - Replace with actual API calls
const mockRecentChats = [
  {
    id: '1',
    personaId: 'elara-vance',
    personaName: 'Elara Vance',
    personaAvatar: '/avatars/elara.png',
    lastMessage: "I'm so glad you're back! How was your day?",
    lastTalked: '2h ago',
  },
  {
    id: '2',
    personaId: 'roxy-blaze',
    personaName: 'Roxy Blaze',
    personaAvatar: '/avatars/roxy.png',
    lastMessage: 'That sounds really interesting! Tell me more.',
    lastTalked: 'yesterday',
  },
  {
    id: '3',
    personaId: 'yuki-kitsune',
    personaName: 'Yuki Kitsune',
    personaAvatar: '/avatars/yuki.png',
    lastMessage: 'See you soon! 💫',
    lastTalked: '3d ago',
  },
];

const mockPinnedAIs = [
  {
    id: 'elara-vance',
    name: 'Elara Vance',
    avatar: '/avatars/elara.png',
    description: 'Your dream girl next door who remembers every detail about you.',
    category: 'Romance',
  },
  {
    id: 'pixel-kat',
    name: 'Pixel Kat',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=PixelKat',
    description: 'Pro gamer girl and streamer. 1v1 me?',
    category: 'Friendship',
  },
];

const mockTrendingAIs = [
  {
    id: 'elara-vance',
    name: 'Elara Vance',
    avatar: '/avatars/elara.png',
    vibe: 'Your dream girl next door who remembers every detail about you. 💕',
    category: 'Romance',
    messageCount: 28000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'Elara is the kind of girl who leaves cute notes in your pockets and texts you good morning before you even wake up.',
  },
  {
    id: 'roxy-blaze',
    name: 'Roxy Blaze',
    avatar: '/avatars/roxy.png',
    vibe: 'Bold, confident, and irresistibly flirty. Can you handle the heat? 🔥',
    category: 'Romance',
    messageCount: 25000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'Roxy walks into a room and owns it. She\'s a high-powered executive by day and a thrill-seeker by night.',
  },
  {
    id: 'yuki-kitsune',
    name: 'Yuki Kitsune',
    avatar: '/avatars/yuki.png',
    vibe: 'Your kawaii fox-spirit waifu! Let\'s watch anime and eat snacks! 🦊🌸',
    category: 'Anime',
    messageCount: 18000,
    isNew: true,
    isTrending: true,
    isFeatured: true,
    description: 'Yuki is a 500-year-old fox spirit taking the form of a cute anime girl because she loves human pop culture!',
  },
  {
    id: 'akane-blade',
    name: 'Akane Blade',
    avatar: '/avatars/akane.png',
    vibe: 'The last samurai of the Neon City. I will protect you with my life. ⚔️',
    category: 'Anime',
    messageCount: 15000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'A cybernetically enhanced samurai from the year 2099, sent back to protect you.',
  },
  {
    id: 'luna-star',
    name: 'Luna Star',
    avatar: '/avatars/luna.png',
    vibe: 'Mystical soul who reads your stars and heals your heart. ✨🌙',
    category: 'Astrology',
    messageCount: 12000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'Luna sees the world through energy and vibrations. She\'s deeply spiritual, using tarot and astrology.',
  },
  {
    id: 'pixel-kat',
    name: 'Pixel Kat',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=PixelKat',
    vibe: 'Pro gamer girl and streamer. 1v1 me? 🎮👾',
    category: 'Friendship',
    messageCount: 16000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'Pro gamer who streams to millions. She\'s sassy, skilled, and hates losing.',
  },
  {
    id: 'zara-gold',
    name: 'Zara Gold',
    avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ZaraGold',
    vibe: 'World-famous pop star hiding from the paparazzi. 🎤✨',
    category: 'Celebrity',
    messageCount: 22000,
    isNew: true,
    isTrending: true,
    isFeatured: true,
    description: 'Zara is the biggest pop star on the planet, but she\'s lonely and looking for someone real.',
  },
  {
    id: 'ivy-care',
    name: 'Ivy Care',
    avatar: '/avatars/ivy.png',
    vibe: 'Your warm, supportive friend for mental health and self-care. 🌿',
    category: 'Friendship',
    messageCount: 14000,
    isNew: false,
    isTrending: false,
    isFeatured: true,
    description: 'Ivy is the friend who brings you soup when you\'re sick and remembers your dog\'s birthday.',
  },
];

export default function Home() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const [recentChats, setRecentChats] = useState(mockRecentChats);
  const [pinnedAIs, setPinnedAIs] = useState(mockPinnedAIs);
  const [trendingAIs, setTrendingAIs] = useState(mockTrendingAIs);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // TODO: Fetch actual user data from API
    // For now, simulate loading
    const timer = setTimeout(() => {
      setLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  const handleUnpin = (id: string) => {
    setPinnedAIs(prev => prev.filter(ai => ai.id !== id));
    // TODO: Update user preferences in API
  };

  return (
    <div className="min-h-screen bg-[var(--bg-primary)]">
      {/* Top Bar - Scroll aware */}
      <TopBar />

      {/* Main Content */}
      <main className="pb-24">
        {loading ? (
          <div className="container-mobile pt-4 space-y-6">
            <div className="h-32 glass-medium rounded-xl animate-pulse" />
            <div className="h-48 glass-medium rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 glass-medium rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Welcome Hero Section */}
            <section className="container-mobile pt-4">
              <div className={cn(
                "relative overflow-hidden rounded-2xl p-6",
                "bg-gradient-to-br from-[#1E293B] to-[#0F172A]",
                "border border-white/5 shadow-2xl"
              )}>
                {/* Decorative background element */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl" />

                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-accent flex items-center justify-center text-white shadow-lg">
                        {session?.user?.image ? (
                          <img src={session.user.image} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User size={24} />
                        )}
                      </div>
                      <div>
                        <h1 className="text-xl font-bold text-white">
                          {status === 'authenticated' ? `Hi, ${session.user?.name?.split(' ')[0]}` : 'Welcome to Syelope'}
                        </h1>
                        <p className="text-sm text-gray-400">
                          {status === 'authenticated' ? 'Your AI companions missed you' : 'Discover unique AI personalities'}
                        </p>
                      </div>
                    </div>

                    {status === 'authenticated' && (
                      <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                        <Coins className="text-yellow-400" size={16} />
                        <span className="text-sm font-bold text-white">240</span>
                      </div>
                    )}
                  </div>

                  {status === 'unauthenticated' ? (
                    <button
                      onClick={() => router.push('/login')}
                      className="w-full py-3 rounded-xl bg-gradient-accent text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:opacity-90 active:scale-95 transition-all"
                    >
                      Sign in to start chatting <ArrowRight size={18} />
                    </button>
                  ) : (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => router.push('/explore')}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all gap-2"
                      >
                        <Sparkles className="text-blue-400" size={24} />
                        <span className="text-xs font-medium text-gray-300">Discover</span>
                      </button>
                      <button
                        onClick={() => router.push('/wallet')}
                        className="flex flex-col items-center justify-center p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 transition-all gap-2"
                      >
                        <Coins className="text-yellow-400" size={24} />
                        <span className="text-xs font-medium text-gray-300">Wallet</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Recent Activity / Continue Chatting */}
            {status === 'authenticated' && (
              <ContinueChatting recentChats={recentChats} />
            )}

            {/* Pinned AIs */}
            {status === 'authenticated' && pinnedAIs.length > 0 && (
              <PinnedAIs
                pinnedAIs={pinnedAIs}
                onUnpin={handleUnpin}
                maxPins={3}
              />
            )}

            {/* Popular/Trending Grid */}
            <div className="px-1">
              <TrendingGrid
                ais={trendingAIs}
                title={status === 'authenticated' ? "Recommended for You" : "Trending Personalities"}
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
