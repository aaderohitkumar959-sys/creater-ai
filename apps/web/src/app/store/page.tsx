'use client';

import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Filter } from 'lucide-react';
import { PersonaCard } from '@/components/store/PersonaCard';
import { useDebounce } from '@/hooks/useDebounce';

const CATEGORIES = ['All', 'Romance', 'Anime', 'Mentor', 'Game Character', 'Assistant'];

export default function StorePage() {
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const [personas, setPersonas] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const debouncedSearch = useDebounce(search, 500);

    useEffect(() => {
        const fetchPersonas = async () => {
            setLoading(true);
            try {
                const query = new URLSearchParams();
                if (debouncedSearch) query.append('search', debouncedSearch);
                if (category !== 'All') query.append('category', category);

                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personas?${query.toString()}`);
                const data = await res.json();
                setPersonas(data);
            } catch (error) {
                console.error('Failed to fetch personas:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchPersonas();
    }, [debouncedSearch, category]);

    return (
        <div className="min-h-screen bg-background pb-20">
            {/* Header */}
            <div className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur-md">
                <div className="container mx-auto px-4 py-4">
                    <h1 className="mb-4 text-2xl font-bold font-display">Discover Personas</h1>

                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <Input
                                placeholder="Search characters..."
                                className="pl-9 bg-muted/50 border-none"
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="icon">
                            <Filter className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Categories */}
                    <div className="mt-4 flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setCategory(cat)}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${category === cat
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-muted text-muted-foreground hover:bg-muted/80'
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Grid */}
            <div className="container mx-auto px-4 py-6">
                {loading ? (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {[...Array(10)].map((_, i) => (
                            <div key={i} className="aspect-[3/4] animate-pulse rounded-2xl bg-muted" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {personas.map((persona, index) => (
                            <PersonaCard
                                key={persona.id}
                                id={persona.id}
                                name={persona.name}
                                description={persona.description || ''}
                                avatarUrl={persona.avatarUrl || '/placeholder.png'}
                                creatorName={persona.creator?.user?.name || 'Unknown'}
                                isPremium={persona.isPremium}
                                index={index}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
