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
    name: 'Yuri Forger',
    avatar: 'https://lh3.googleusercontent.com/d/1NjzDmT-NoQka2c4-aCjBMdj-aIZBoSeF',
    vibe: 'Overprotective, intense, and emotionally driven—fiercely loyal to those he cares about',
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
    id: 't5',
    name: 'Boa Hancock',
    avatar: 'https://lh3.googleusercontent.com/d/1L559UR3NA144sUlODryF-_qNpWIiR-O9',
    vibe: 'The most beautiful woman in the world—proud, elegant, and overwhelmingly confident',
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
    id: 't6',
    name: 'Kimi',
    avatar: 'https://lh3.googleusercontent.com/d/1PTsCoZtNIze7gXSMOu-ulBG2SRZfFADu',
    vibe: 'Your always-there best friend—supportive, playful, and brutally honest when needed',
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
    id: 't7',
    name: 'Makima',
    avatar: 'https://lh3.googleusercontent.com/d/1KlMIPKYWBZEwpkmK7KythAFoaJ7Et9kF',
    vibe: 'A calm, intelligent, and unsettlingly powerful woman who always seems one step ahead',
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
