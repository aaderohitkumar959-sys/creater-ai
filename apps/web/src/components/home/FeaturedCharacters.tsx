'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

interface FeaturedPersona {
    id: string;
    name: string;
    avatarUrl: string;
    description: string;
    category: string;
}

const categoryColors: Record<string, { gradient: string; badge: string; glow: string }> = {
    Romance: {
        gradient: 'from-pink-500 via-rose-500 to-red-500',
        badge: 'bg-pink-500/20 text-pink-300 border-pink-500/30',
        glow: 'hover:shadow-pink-500/50',
    },
    Friendship: {
        gradient: 'from-blue-500 via-cyan-500 to-teal-500',
        badge: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30',
        glow: 'hover:shadow-cyan-500/50',
    },
    Mentor: {
        gradient: 'from-purple-500 via-violet-500 to-indigo-500',
        badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
        glow: 'hover:shadow-purple-500/50',
    },
    Fitness: {
        gradient: 'from-orange-500 via-red-500 to-rose-500',
        badge: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
        glow: 'hover:shadow-orange-500/50',
    },
    Astrology: {
        gradient: 'from-purple-900 via-violet-800 to-fuchsia-800',
        badge: 'bg-fuchsia-500/20 text-fuchsia-300 border-fuchsia-500/30',
        glow: 'hover:shadow-fuchsia-500/50',
    },
    Anime: {
        gradient: 'from-pink-400 via-rose-400 to-pink-500',
        badge: 'bg-pink-400/20 text-pink-200 border-pink-400/30',
        glow: 'hover:shadow-pink-400/50',
    },
    Roleplay: {
        gradient: 'from-violet-900 via-purple-900 to-indigo-900',
        badge: 'bg-violet-500/20 text-violet-300 border-violet-500/30',
        glow: 'hover:shadow-violet-500/50',
    },
};

export default function FeaturedCharacters() {
    const [personas, setPersonas] = useState<FeaturedPersona[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/personas/featured`)
            .then((res) => res.json())
            .then((data) => {
                setPersonas(data);
                setLoading(false);
            })
            .catch((error) => {
                console.error('Failed to fetch featured personas:', error);
                setLoading(false);
            });
    }, []);

    if (loading) {
        return (
            <div className="py-20 text-center">
                <div className="inline-flex items-center gap-2 text-lg text-gray-400">
                    <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
                    Loading amazing AI characters...
                </div>
            </div>
        );
    }

    return (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-black via-gray-900 to-black">
            <div className="max-w-7xl mx-auto">
                {/* Section Header */}
                <div className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/20">
                        <Sparkles className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-medium text-purple-300">Featured AI Characters</span>
                    </div>
                    <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent">
                        Popular AI Characters
                    </h2>
                    <p className="text-lg text-gray-400 max-w-2xl mx-auto">
                        Chat with amazing AI personalities - from romantic companions to expert mentors
                    </p>
                </div>

                {/* Character Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {personas.map((persona, index) => {
                        const colors = categoryColors[persona.category] || categoryColors.Romance;

                        return (
                            <div
                                key={persona.id}
                                className={`group relative rounded-2xl overflow-hidden bg-gradient-to-br ${colors.gradient} p-[1px] 
                  transition-all duration-500 hover:scale-105 ${colors.glow} hover:shadow-2xl
                  opacity-0 animate-[fadeIn_0.6s_ease-out_forwards]`}
                                style={{ animationDelay: `${index * 0.1}s` }}
                            >
                                {/* Glassmorphism Card */}
                                <div className="relative h-full rounded-2xl bg-gray-900/90 backdrop-blur-xl overflow-hidden">
                                    {/* Avatar */}
                                    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-800 to-gray-900">
                                        <img
                                            src={persona.avatarUrl}
                                            alt={persona.name}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                        {/* Gradient Overlay */}
                                        <div className={`absolute inset-0 bg-gradient-to-t ${colors.gradient} opacity-0 group-hover:opacity-20 transition-opacity duration-500`} />
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-3">
                                        {/* Category Badge */}
                                        <div className="flex items-center gap-2">
                                            <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium border ${colors.badge}`}>
                                                {persona.category}
                                            </span>
                                        </div>

                                        {/* Name */}
                                        <h3 className="text-xl font-bold text-white group-hover:text-transparent group-hover:bg-gradient-to-r group-hover:from-white group-hover:to-gray-300 group-hover:bg-clip-text transition-all">
                                            {persona.name}
                                        </h3>

                                        {/* Description */}
                                        <p className="text-sm text-gray-400 line-clamp-2 min-h-[40px]">
                                            {persona.description}
                                        </p>

                                        {/* Chat Button */}
                                        <Link
                                            href={`/chat/${persona.id}`}
                                            className={`block w-full py-3 px-4 rounded-xl text-center font-semibold text-white
                        bg-gradient-to-r ${colors.gradient} 
                        hover:shadow-lg ${colors.glow} 
                        transform transition-all duration-300 hover:scale-105
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900`}
                                        >
                                            Chat Now
                                        </Link>
                                    </div>

                                    {/* Sparkle Effect */}
                                    <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                                        <Sparkles className="w-6 h-6 text-white/50" />
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* CTA Footer */}
                <div className="mt-16 text-center">
                    <Link
                        href="/explore"
                        className="inline-flex items-center gap-2 px-8 py-4 rounded-full text-lg font-semibold text-white
              bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500
              shadow-lg hover:shadow-2xl hover:shadow-purple-500/50
              transform transition-all duration-300 hover:scale-105"
                    >
                        Explore All Characters
                        <Sparkles className="w-5 h-5" />
                    </Link>
                </div>
            </div>

            <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
        </section>
    );
}
