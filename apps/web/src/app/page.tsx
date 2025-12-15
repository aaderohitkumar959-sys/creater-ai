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
    id: 't1',
    name: 'Levi Ackerman',
    avatar: 'https://lh3.googleusercontent.com/d/1_zjNiswAGxTbleMPxbR1KUsnAjtElVQQ',
    vibe: 'Humanity\'s strongest soldier—cold, disciplined, and brutally honest',
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
    id: 't2',
    name: 'Gojo Satoru',
    avatar: 'https://lh3.googleusercontent.com/d/1WYUgmmSGrbiN2xx7tYK2mqZnr6_8FjpI',
    vibe: 'The strongest sorcerer alive—confident, playful, and overwhelmingly powerful',
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
    id: 't3',
    name: 'Queen Medusa',
    avatar: 'https://lh3.googleusercontent.com/d/1e5i1htBgZ2ef6DlPQG6P1_RNBZ1dWhON',
    vibe: 'The cold and ruthless queen of the Snake-People—proud, dominant, and dangerously beautiful',
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
    id: 't4',
    name: 'Jake',
    avatar: '',
    vibe: 'Funny gaming buddy who loves epic adventures',
    category: 'Entertainment',
    messageCount: 9800,
    isNew: true,
    isTrending: false,
  },
  {
    id: 't5',
    name: 'Aria',
    avatar: '',
    vibe: 'Romantic companion with a poetic soul',
    category: 'Romance',
    messageCount: 22000,
    isNew: false,
    isTrending: true,
  },
  {
    id: 't6',
    name: 'Noah',
    avatar: '',
    vibe: 'Tech mentor who explains complex topics simply',
    category: 'Learning',
    messageCount: 6500,
    isNew: false,
    isTrending: false,
  },
  {
    id: 't7',
    name: 'Zara',
    avatar: '',
    vibe: 'Mindfulness guide for daily meditation practice',
    category: 'Wellness',
    messageCount: 11000,
    isNew: true,
    isTrending: true,
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
      <main className="pt-4">
        {loading ? (
          <div className="container-mobile space-y-6">
            <div className="h-32 glass-medium rounded-xl animate-pulse" />
            <div className="h-48 glass-medium rounded-xl animate-pulse" />
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-64 glass-medium rounded-xl animate-pulse" />
              ))}
            </div>
          </div>
        ) : (
          <>
            {/* Continue Chatting - Emotional Continuity */}
            <ContinueChatting recentChats={recentChats} />

            {/* Pinned AIs */}
            <PinnedAIs
              pinnedAIs={pinnedAIs}
              onUnpin={handleUnpin}
              maxPins={3}
            />

            {/* Popular/Trending Grid */}
            <TrendingGrid
              ais={trendingAIs}
              title="Popular AI Characters"
            />
          </>
        )}
      </main>
    </div>
  );
}
