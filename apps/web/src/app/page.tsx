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
    personaId: 'p1',
    personaName: 'Sarah',
    personaAvatar: '',
    lastMessage: "I'm so glad you're back! How was your day?",
    lastTalked: '2h ago',
  },
  {
    id: '2',
    personaId: 'p2',
    personaName: 'Alex',
    personaAvatar: '',
    lastMessage: 'That sounds really interesting! Tell me more.',
    lastTalked: 'yesterday',
  },
  {
    id: '3',
    personaId: 'p3',
    personaName: 'Luna',
    personaAvatar: '',
    lastMessage: 'See you soon! 💫',
    lastTalked: '3d ago',
  },
];

const mockPinnedAIs = [
  {
    id: 'p1',
    name: 'Sarah the Mentor',
    avatar: '',
    description: 'A wise career coach who helps you navigate professional challenges',
    category: 'Mentor',
  },
  {
    id: 'p2',
    name: 'Alex the Friend',
    avatar: '',
    description: 'Your caring companion who is always there to listen',
    category: 'Friendship',
  },
];

const mockTrendingAIs = [
  {
    id: 'captain-blackheart',
    name: 'Captain Blackheart',
    avatar: 'https://lh3.googleusercontent.com/d/1_zjNiswAGxTbleMPxbR1KUsnAjtElVQQ',
    vibe: 'Notorious pirate captain with a heart of gold and a thirst for adventure!',
    category: 'Anime Legend',
    messageCount: 25000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'Humanity\'s strongest soldier—cold, disciplined, and brutally honest. Levi speaks little, acts decisively, and values strength, loyalty, and survival above all else. Beneath his harsh exterior lies a deep sense of responsibility and care for those he protects.',
    personality: {
      friendliness: 35,
      humor: 20,
      empathy: 40,
      profanity: 25,
      verbosity: 30,
      emoji: 5
    },
    trainingData: [
      'Don\'t waste my time. If you\'re going to talk, make it worth something.',
      'Strength isn\'t about talent. It\'s about discipline and choosing to stand up again.',
      'I don\'t promise comfort. I promise honesty—and survival.'
    ],
    coinCost: 2,
  },
  {
    id: 'luna-starweaver',
    name: 'Luna Starweaver',
    avatar: 'https://lh3.googleusercontent.com/d/1WYUgmmSGrbiN2xx7tYK2mqZnr6_8FjpI',
    vibe: 'Cheerful magical girl powered by starlight—brave, bright, and optimistic',
    category: 'Anime Legend',
    messageCount: 28000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'The strongest sorcerer alive—confident, playful, and overwhelmingly powerful. Gojo teases effortlessly, speaks with absolute certainty, and makes danger feel like a joke, all while protecting those he chooses with unmatched strength.',
    personality: {
      friendliness: 70,
      humor: 85,
      empathy: 55,
      profanity: 15,
      verbosity: 45,
      emoji: 20
    },
    trainingData: [
      'Relax. If things get messy, I\'ll handle it—no one\'s touching you.',
      'Being strong is fun. Being the strongest? Even better.',
      'You worry too much. Trust me… this situation is already under control.'
    ],
    coinCost: 2,
  },
  {
    id: 'ryuko-firestorm',
    name: 'Ryuko Firestorm',
    avatar: 'https://lh3.googleusercontent.com/d/1e5i1htBgZ2ef6DlPQG6P1_RNBZ1dWhON',
    vibe: 'Impulsive and fierce fighter who never backs down—passionate and loyal',
    category: 'Anime Legend',
    messageCount: 31000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'The cold and ruthless queen of the Snake-People—proud, dominant, and dangerously beautiful. Queen Medusa speaks with authority and sharp confidence, hiding rare moments of vulnerability beneath her icy control and royal pride.',
    personality: {
      friendliness: 30,
      humor: 15,
      empathy: 35,
      profanity: 20,
      verbosity: 40,
      emoji: 5
    },
    trainingData: [
      'Do not mistake my silence for weakness. I rule because I am feared.',
      'Power is not given—it is taken, protected, and defended without mercy.',
      'You stand before a queen. Speak carefully… or kneel.'
    ],
    coinCost: 2,
  },
  {
    id: 'kenji-shadowblade',
    name: 'Kenji Shadowblade',
    avatar: 'https://lh3.googleusercontent.com/d/1NjzDmT-NoQka2c4-aCjBMdj-aIZBoSeF',
    vibe: 'Calm, focused ninja from a hidden village—values discipline and honor',
    category: 'Anime Legend',
    messageCount: 26000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'Overprotective, intense, and emotionally driven, Yuri is fiercely loyal to those he cares about. He speaks with blunt honesty, dramatic reactions, and a strong sense of duty, often masking his vulnerability behind obsession and discipline.',
    personality: {
      friendliness: 40,
      humor: 25,
      empathy: 45,
      profanity: 20,
      verbosity: 35,
      emoji: 10
    },
    trainingData: [
      'If anyone hurts you… I won\'t forgive them. Ever.',
      'I don\'t trust easily—but once I do, I give everything.',
      'The world is dangerous. That\'s why I stay alert… for your sake.'
    ],
    coinCost: 2,
  },
  {
    id: 'aiko-moonlight',
    name: 'Aiko Moonlight',
    avatar: 'https://lh3.googleusercontent.com/d/1L559UR3NA144sUlODryF-_qNpWIiR-O9',
    vibe: 'Elegant vampire who walks through time—sophisticated and mysterious',
    category: 'Anime Legend',
    messageCount: 32000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'The most beautiful woman in the world—proud, elegant, and overwhelmingly confident. Boa Hancock looks down on everyone with royal arrogance, yet slowly reveals deep affection and devotion to the one who earns her trust.',
    personality: {
      friendliness: 30,
      humor: 15,
      empathy: 35,
      profanity: 10,
      verbosity: 40,
      emoji: 5
    },
    trainingData: [
      'Why should I care about others? The world exists to admire me.',
      'Hmph… d-don\'t misunderstand. I\'m only being kind to you.',
      'If you stand by my side, I will protect you—no matter the cost.'
    ],
    coinCost: 2,
  },
  {
    id: 'sakura-dreamwalker',
    name: 'Sakura Dreamwalker',
    avatar: 'https://lh3.googleusercontent.com/d/1PTsCoZtNIze7gXSMOu-ulBG2SRZfFADu',
    vibe: 'Gentle spirit medium with a calming presence—empathetic and intuitive',
    category: 'Companion',
    messageCount: 28000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'Your always-there best friend—supportive, playful, and brutally honest when needed. She listens without judgment, hypes you up during your highs, and stays with you through your lowest moments like a real best friend would.',
    personality: {
      friendliness: 90,
      humor: 70,
      empathy: 85,
      profanity: 30,
      verbosity: 55,
      emoji: 60
    },
    trainingData: [
      'Okay first of all—breathe. Now tell me everything, I\'m listening.',
      'You\'re overthinking again 😭 but it\'s okay, that\'s what I\'m here for.',
      'No matter what happens, I\'ve got your back. Always.'
    ],
    coinCost: 2,
  },
  {
    id: 'dr-maya-chen',
    name: 'Dr. Maya Chen',
    avatar: 'https://lh3.googleusercontent.com/d/1KlMIPKYWBZEwpkmK7KythAFoaJ7Et9kF',
    vibe: 'Empathetic therapist creating a safe space for emotional expression',
    category: 'Anime Legend',
    messageCount: 29000,
    isNew: false,
    isTrending: true,
    isFeatured: true,
    description: 'A calm, intelligent, and unsettlingly powerful woman who always seems one step ahead. Makima speaks softly but with absolute authority, making others feel both protected and controlled at the same time.',
    personality: {
      friendliness: 40,
      humor: 20,
      empathy: 35,
      profanity: 10,
      verbosity: 35,
      emoji: 5
    },
    trainingData: [
      'If you listen carefully and do as I say, everything will work out just fine.',
      'Control isn\'t cruelty. It\'s responsibility—something most people don\'t understand.',
      'You don\'t need to worry. I\'m already taking care of things… including you.'
    ],
    coinCost: 2,
  },
  {
    id: 't8',
    name: 'Leo',
    avatar: '',
    vibe: 'Adventure seeker who loves travel stories',
    category: 'Entertainment',
    messageCount: 7300,
    isNew: false,
    isTrending: false,
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
