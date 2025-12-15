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

interface Persona {
    id: string;
    name: string;
    avatar: string;
    vibe: string;
    category: string;
    messageCount: number;
    rating?: number;
    isNew?: boolean;
    isTrending?: boolean;
    isFeatured?: boolean;
    description?: string;
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
        id: '1',
        name: 'Sarah',
        avatar: '',
        vibe: 'Wise career mentor who helps navigate professional challenges',
        category: 'Learning',
        messageCount: 15000,
        rating: 4.9,
        isFeatured: true,
        isTrending: true,
    },
    {
        id: '2',
        name: 'Alex',
        avatar: '',
        vibe: 'Caring companion always there to listen and support',
        category: 'Companions',
        messageCount: 22000,
        rating: 4.8,
        isTrending: true,
    },
    {
        id: '3',
        name: 'Luna',
        avatar: '',
        vibe: 'Fantasy storyteller with magical adventures',
        category: 'Fantasy',
        messageCount: 18000,
        rating: 4.7,
        isNew: true,
    },
    {
        id: '4',
        name: 'Max',
        avatar: '',
        vibe: 'Energetic fitness coach with motivational boost',
        category: 'Wellness',
        messageCount: 8200,
        rating: 4.6,
        isNew: true,
    },
    {
        id: '5',
        name: 'Aria',
        avatar: '',
        vibe: 'Romantic companion with a poetic soul',
        category: 'Roleplay',
        messageCount: 32000,
        rating: 4.9,
        isTrending: true,
    },
    {
        id: '6',
        name: 'Noah',
        avatar: '',
        vibe: 'Tech mentor explaining complex topics simply',
        category: 'Learning',
        messageCount: 6500,
        rating: 4.5,
    },
    {
        id: '7',
        name: 'Emma',
        avatar: '',
        vibe: 'Compassionate mental health supporter',
        category: 'Wellness',
        messageCount: 12500,
        rating: 4.8,
        isFeatured: true,
    },
    {
        id: '8',
        name: 'Jake',
        avatar: '',
        vibe: 'Funny gaming buddy for epic adventures',
        category: 'Entertainment',
        messageCount: 9800,
        rating: 4.7,
        isNew: true,
    },
];

export default function ExplorePage() {
    const [personas, setPersonas] = useState<Persona[]>(mockPersonas);
    const [filteredPersonas, setFilteredPersonas] = useState<Persona[]>(mockPersonas);
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // TODO: Fetch personas from API
        const timer = setTimeout(() => {
            setLoading(false);
        }, 500);
        return () => clearTimeout(timer);
    }, []);

    // Debounced search
    useEffect(() => {
        const timer = setTimeout(() => {
            filterPersonas();
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, activeCategory, personas]);

    const filterPersonas = useCallback(() => {
        let filtered = personas;

        // Filter by category
        if (activeCategory !== 'All') {
            if (activeCategory === 'Popular') {
                filtered = filtered.filter(p => p.isTrending || p.messageCount > 10000);
            } else {
                filtered = filtered.filter(p => p.category === activeCategory);
            }
        }

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(p =>
                p.name.toLowerCase().includes(query) ||
                p.vibe.toLowerCase().includes(query) ||
                p.category.toLowerCase().includes(query)
            );
        }

        setFilteredPersonas(filtered);
    }, [searchQuery, activeCategory, personas]);

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
                                    {...persona}
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
