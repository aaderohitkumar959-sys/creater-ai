/**
 * Explore Page - AI Discovery Hub
 * Addictive browsing experience with search and categories
 */

'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { TopBar } from '@/components/navigation/top-bar';
import { CategoryTabs } from '@/components/explore/category-tabs';
import { AICard } from '@/components/explore/ai-card';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { api } from '@/lib/api';


interface Persona {
    id: string;
    name: string;
    avatar: string;
    description?: string;
    vibe?: string;
    category?: string;
    messageCount?: number;
    rating?: number;
    isFeatured?: boolean;
    isTrending?: boolean;
    isNew?: boolean;
}

// Categories for filtering
const CATEGORIES = [
    'All',
    'Popular',
    'Roleplay',
    'Companions',
    'Learning',
    'Fantasy',
    'Wellness',
    'Entertainment',
];

// Mock extended personas - replace with API
const mockPersonas: Persona[] = [
    {
        id: 'elara-vance',
        name: 'Elara Vance',
        avatar: '/avatars/elara.png',
        vibe: 'Your dream girl next door who remembers every detail about you. 💕',
        category: 'Romance',
        messageCount: 28000,
        rating: 4.9,
        isFeatured: true,
        isTrending: true,
    },
    {
        id: 'roxy-blaze',
        name: 'Roxy Blaze',
        avatar: '/avatars/roxy.png',
        vibe: 'Bold, confident, and irresistibly flirty. Can you handle the heat? 🔥',
        category: 'Romance',
        messageCount: 25000,
        rating: 4.8,
        isTrending: true,
    },
    {
        id: 'yuki-kitsune',
        name: 'Yuki Kitsune',
        avatar: '/avatars/yuki.png',
        vibe: 'Your kawaii fox-spirit waifu! Let\'s watch anime and eat snacks! 🦊🌸',
        category: 'Anime',
        messageCount: 18000,
        rating: 4.7,
        isNew: true,
    },
    {
        id: 'akane-blade',
        name: 'Akane Blade',
        avatar: '/avatars/akane.png',
        vibe: 'The last samurai of the Neon City. I will protect you with my life. ⚔️',
        category: 'Anime',
        messageCount: 15000,
        rating: 4.8,
        isNew: true,
    },
    {
        id: 'luna-star',
        name: 'Luna Star',
        avatar: '/avatars/luna.png',
        vibe: 'Mystical soul who reads your stars and heals your heart. ✨🌙',
        category: 'Astrology',
        messageCount: 12000,
        rating: 4.9,
        isTrending: true,
    },
    {
        id: 'ivy-care',
        name: 'Ivy Care',
        avatar: '/avatars/ivy.png',
        vibe: 'Your warm, supportive friend for mental health and self-care. 🌿',
        category: 'Friendship',
        messageCount: 14000,
        rating: 4.7,
    },
    {
        id: 'pixel-kat',
        name: 'Pixel Kat',
        avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=PixelKat',
        vibe: 'Pro gamer girl and streamer. 1v1 me? 🎮👾',
        category: 'Friendship',
        messageCount: 16000,
        rating: 4.8,
        isFeatured: true,
    },
    {
        id: 'zara-gold',
        name: 'Zara Gold',
        avatar: 'https://api.dicebear.com/7.x/lorelei/svg?seed=ZaraGold',
        vibe: 'World-famous pop star hiding from the paparazzi. 🎤✨',
        category: 'Celebrity',
        messageCount: 22000,
        rating: 4.9,
        isNew: true,
    },
];

export default function ExplorePage() {
    const [personas, setPersonas] = useState<Persona[]>([]);
    const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>([]);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    const fetchPersonas = useCallback(async () => {
        setLoading(true);
        try {
            const data = await api.getPersonas(searchQuery, activeCategory);
            // Map backend Persona to frontend Persona
            const mapped = data.map((p: any) => ({
                id: p.id,
                name: p.name,
                avatar: p.avatarUrl || '',
                vibe: p.description || '',
                category: p.category || 'General',
                messageCount: 0, // Backend doesn't return this yet
                rating: 5.0,
                isFeatured: p.isFeatured,
                isTrending: p.isFeatured, // Mocking trending as featured for now
                isNew: false,
            }));
            setPersonas(mapped);
            setFilteredPersonas(mapped);
        } catch (error) {
            console.error('Failed to fetch personas:', error);
        } finally {
            setLoading(false);
        }
    }, [searchQuery, activeCategory]);

    useEffect(() => {
        fetchPersonas();
    }, [fetchPersonas]);

    // We'll keep the client-side filter for immediate feedback if needed, 
    // but the fetchPersonas already handles search and category.
    // However, if we want to avoid extra API calls while typing, we can debounce searchQuery.

    const handlePin = (id: string) => {
        setPinnedIds(prev => {
            const newSet = new Set(prev);
            if (newSet.has(id)) {
                newSet.delete(id);
            } else {
                if (newSet.size >= 3) {
                    // Max 3 pins for free users
                    return prev;
                }
                newSet.add(id);
            }
            return newSet;
        });
        // TODO: Update user preferences in API
    };

    return (
        <div className="min-h-screen bg-[var(--bg-primary)]">
            <TopBar />

            {/* Search Bar */}
            <div className="container-mobile pt-4 pb-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={20} />
                    <input
                        type="text"
                        placeholder="Search AI personalities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            'w-full pl-12 pr-12 py-3.5 rounded-xl',
                            'glass-medium border border-[var(--border-medium)]',
                            'text-[var(--text-primary)] placeholder:text-[var(--text-muted)]',
                            'focus:border-[var(--accent-blue)] focus:outline-none',
                            'transition-all duration-250'
                        )}
                    />
                    <button
                        className={cn(
                            'absolute right-3 top-1/2 -translate-y-1/2',
                            'p-2 rounded-lg glass-light',
                            'text-[var(--text-secondary)] hover:text-[var(--text-primary)]',
                            'transition-all duration-250'
                        )}
                        aria-label="Filters"
                    >
                        <Filter size={18} />
                    </button>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="pt-2">
                <CategoryTabs
                    categories={CATEGORIES}
                    activeCategory={activeCategory}
                    onCategoryChange={setActiveCategory}
                />
            </div>

            {/* AI Grid */}
            <div className="container-mobile pb-8">
                {loading ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                            <div key={i} className="h-80 glass-medium rounded-xl animate-pulse" />
                        ))}
                    </div>
                ) : filteredPersonas.length === 0 ? (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 rounded-full bg-[var(--bg-tertiary)] mx-auto mb-4 flex items-center justify-center">
                            <Search size={32} className="text-[var(--text-muted)]" />
                        </div>
                        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
                            No AI found
                        </h3>
                        <p className="text-[var(--text-secondary)] mb-6">
                            Try adjusting your search or category
                        </p>
                        <button
                            onClick={() => {
                                setSearchQuery('');
                                setActiveCategory('All');
                            }}
                            className="btn-primary"
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    <>
                        {/* Results count */}
                        <div className="mb-4 flex items-center justify-between">
                            <p className="text-sm text-[var(--text-secondary)]">
                                {filteredPersonas.length} AI {filteredPersonas.length === 1 ? 'personality' : 'personalities'}
                            </p>
                            {pinnedIds.size > 0 && (
                                <p className="text-xs text-[var(--text-muted)]">
                                    {pinnedIds.size}/3 pinned
                                </p>
                            )}
                        </div>

                        {/* Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                            {filteredPersonas.map((persona) => (
                                <AICard
                                    key={persona.id}
                                    id={persona.id}
                                    name={persona.name}
                                    avatar={persona.avatar}
                                    vibe={persona.vibe}
                                    category={persona.category}
                                    messageCount={persona.messageCount}
                                    rating={persona.rating}
                                    isNew={persona.isNew}
                                    isTrending={persona.isTrending}
                                    isFeatured={persona.isFeatured}
                                    isPinned={pinnedIds.has(persona.id)}
                                    onPin={handlePin}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
