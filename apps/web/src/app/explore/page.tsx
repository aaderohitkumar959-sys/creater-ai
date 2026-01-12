/**
 * Explore Page - AI Discovery Hub
 * Addictive browsing experience with search and categories
 */

'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { TopBar } from '@/components/navigation/top-bar';
import { CategoryTabs } from '@/components/explore/category-tabs';
import { AICard } from '@/components/explore/ai-card';
import { Search, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';
import { PERSONAS } from '@/lib/personas';


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

export default function ExplorePage() {
    const [activeCategory, setActiveCategory] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const [pinnedIds, setPinnedIds] = useState<Set<string>>(new Set());

    // Convert PERSONAS object to array and map to Persona interface
    const allPersonas = useMemo(() => {
        return Object.values(PERSONAS).map((p) => ({
            id: p.id,
            name: p.name,
            avatar: p.avatar,
            vibe: p.description || '',
            category: p.role || 'General',
            messageCount: 0,
            rating: 5.0,
            isFeatured: false,
            isTrending: false,
            isNew: false,
        }));
    }, []);

    // Filter personas based on search and category
    const filteredPersonas = useMemo(() => {
        let filtered = allPersonas;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((p) =>
                p.name.toLowerCase().includes(query) ||
                (p.vibe && p.vibe.toLowerCase().includes(query)) ||
                (p.category && p.category.toLowerCase().includes(query))
            );
        }

        // Filter by category (optional - can be customized based on your categories)
        if (activeCategory !== 'All') {
            // You can map categories to specific character types here
            // For now, show all when not "All"
        }

        return filtered;
    }, [allPersonas, searchQuery, activeCategory]);

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

            {/* Search Bar - Dark theme optimized */}
            <div className="container-mobile pt-4 pb-2">
                <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={20} />
                    <input
                        type="text"
                        placeholder="Search AI personalities..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className={cn(
                            'w-full pl-12 pr-12 py-3.5 rounded-xl',
                            'bg-white/[0.08] border border-white/10',
                            'text-white placeholder:text-white/40',
                            'focus:bg-white/[0.12] focus:border-violet-500/50 focus:outline-none',
                            'transition-all duration-250'
                        )}
                    />
                    <button
                        className={cn(
                            'absolute right-3 top-1/2 -translate-y-1/2',
                            'p-2 rounded-lg bg-white/5 hover:bg-white/10',
                            'text-white/40 hover:text-white',
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
                {filteredPersonas.length === 0 ? (
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
