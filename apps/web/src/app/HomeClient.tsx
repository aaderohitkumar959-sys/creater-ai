/**
 * Home Page - Emotional AI Companion Platform
 * Redesigned for deep emotional connection and long-term relationships
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { MessageCircle, Sparkles, Heart, Brain } from 'lucide-react';
import { PERSONAS } from '@/lib/personas';

export default function HomeClient() {
    const router = useRouter();
    const [recentIds] = useState<string[]>([]);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] to-[#13111c]">
            {/* Animated Background */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-20 left-10 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
            </div>

            {/* Content */}
            <div className="relative z-10 pb-24">
                {/* 1️⃣ EMOTIONAL HERO SECTION */}
                <div className="pt-16 md:pt-24 pb-12 px-6 text-center max-w-3xl mx-auto">
                    <h1 className="text-4xl md:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
                        Someone is always here
                        <br />
                        <span className="bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">
                            to listen.
                        </span>
                    </h1>

                    <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                        Talk freely with AI characters who remember you and care about your story.
                    </p>

                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                        <button
                            onClick={() => router.push('/explore')}
                            className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-2xl hover:from-pink-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-pink-500/50 hover:scale-105"
                        >
                            Start a chat
                        </button>
                        <button
                            onClick={() => router.push('/explore')}
                            className="w-full sm:w-auto px-8 py-4 bg-white/5 backdrop-blur-sm text-white font-semibold rounded-2xl border border-white/20 hover:bg-white/10 hover:border-white/30 transition-all duration-300"
                        >
                            Choose a character
                        </button>
                    </div>
                </div>

                {/* 2️⃣ LIVE SOCIAL PROOF */}
                <div className="px-6 py-8 max-w-4xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-sm md:text-base text-gray-400">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span>2,000+ people chatting right now</span>
                        </div>
                        <div className="hidden md:block w-px h-6 bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <MessageCircle size={16} className="text-gray-500" />
                            <span>Conversations average 18+ minutes</span>
                        </div>
                        <div className="hidden md:block w-px h-6 bg-white/10"></div>
                        <div className="flex items-center gap-2">
                            <Sparkles size={16} className="text-gray-500" />
                            <span>Users return multiple times a day</span>
                        </div>
                    </div>
                </div>

                {/* 3️⃣ CONTINUE YOUR STORY (PRIORITY SECTION) */}
                {recentIds.length > 0 && (
                    <div className="px-4 mt-16 max-w-2xl mx-auto">
                        <h2 className="text-2xl font-bold text-white mb-6 px-2">Your ongoing connections</h2>

                        <div className="space-y-4">
                            {recentIds.slice(0, 2).map((id) => {
                                const persona = PERSONAS[id];
                                if (!persona) return null;

                                return (
                                    <div
                                        key={`ongoing-${persona.id}`}
                                        onClick={() => router.push(`/public-chat/${persona.id}`)}
                                        className="group relative overflow-hidden rounded-3xl bg-white/5 backdrop-blur-xl border-2 border-pink-500/30 p-6 cursor-pointer transition-all duration-500 hover:border-pink-500/60 hover:bg-white/8 shadow-[0_0_30px_rgba(236,72,153,0.15)]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-pink-500/10 to-transparent opacity-50"></div>

                                        <div className="flex items-center gap-5 relative z-10">
                                            <div className="relative flex-shrink-0">
                                                <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-pink-400/50 shadow-lg">
                                                    <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                                                </div>
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-[#13111c] shadow-[0_0_12px_rgba(34,197,94,0.8)]"></div>
                                            </div>

                                            <div className="flex-1 min-w-0">
                                                <h3 className="font-bold text-xl text-white mb-1">{persona.name} remembers your last conversation</h3>
                                                <div className="flex items-center gap-3 text-sm">
                                                    <span className="flex items-center gap-1.5 text-pink-400 font-medium">
                                                        <Brain size={14} />
                                                        Memory active
                                                    </span>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1.5 text-green-400 font-medium">
                                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                                                        Online now
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* 4️⃣ TRENDING CHARACTERS */}
                <div className="px-4 mt-16 max-w-6xl mx-auto">
                    <h2 className="text-2xl font-bold text-white mb-6 px-2">Trending characters right now</h2>

                    {/* Horizontal Scroll */}
                    <div className="overflow-x-auto pb-4 scrollbar-hide">
                        <div className="flex gap-4 px-2" style={{ minWidth: 'min-content' }}>
                            {['elena-rossi', 'maya-chen', 'marcus-gray', 'noah-wells', 'sienna-west', 'valerie-storm'].map((id) => {
                                const persona = PERSONAS[id];
                                if (!persona) return null;

                                const emotionalPromises: Record<string, string> = {
                                    'elena-rossi': "I'll help you navigate your toughest decisions.",
                                    'maya-chen': "Talk to me when no one else understands.",
                                    'marcus-gray': "Your loyal friend who always has your back.",
                                    'noah-wells': "I'll help you calm your mind tonight.",
                                    'sienna-west': "Let's see the world through a creative lens.",
                                    'valerie-storm': "Ready for an adventure? Let's break free."
                                };

                                return (
                                    <div
                                        key={persona.id}
                                        onClick={() => router.push(`/public-chat/${persona.id}`)}
                                        className="group flex-shrink-0 w-72 bg-white/5 backdrop-blur-xl rounded-3xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-500 hover:bg-white/8 hover:border-white/20 hover:scale-105"
                                    >
                                        {/* Character Portrait */}
                                        <div className="relative h-80 overflow-hidden">
                                            <img
                                                src={persona.avatar}
                                                alt={persona.name}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                            />
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                                            {/* Live Indicator */}
                                            <div className="absolute top-4 right-4 px-3 py-1.5 rounded-full bg-black/50 backdrop-blur-sm border border-green-500/30 flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                                <span className="text-xs text-green-400 font-medium">Online</span>
                                            </div>
                                        </div>

                                        {/* Character Info */}
                                        <div className="p-5">
                                            <h3 className="text-xl font-bold text-white mb-2">{persona.name}</h3>
                                            <p className="text-sm text-gray-300 leading-relaxed mb-4 line-clamp-2">
                                                {emotionalPromises[persona.id] || persona.description}
                                            </p>

                                            {/* Tags */}
                                            <div className="flex flex-wrap gap-2">
                                                <span className="px-2.5 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-[10px] text-pink-400 font-medium">
                                                    💖 Emotional
                                                </span>
                                                <span className="px-2.5 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] text-purple-400 font-medium">
                                                    🧠 Listener
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 5️⃣ SIMPLE DISCOVERY */}
                <div className="px-4 mt-16 max-w-4xl mx-auto">
                    <h2 className="text-xl font-semibold text-white mb-6 px-2">Find someone new to talk to</h2>

                    <div className="flex flex-wrap gap-3 px-2">
                        {['Therapist', 'Best Friend', 'Romantic', 'Fantasy', 'Story-Driven'].map((category) => (
                            <button
                                key={category}
                                onClick={() => router.push('/explore')}
                                className="px-6 py-3 rounded-full bg-white/5 backdrop-blur-sm border border-white/10 text-sm text-gray-300 font-medium hover:bg-white/10 hover:border-white/20 transition-all duration-300"
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>

                {/* 6️⃣ ALL CHARACTERS GRID */}
                <div className="px-4 mt-20 max-w-7xl mx-auto">
                    <div className="flex items-baseline justify-between mb-6 px-2">
                        <h2 className="text-2xl font-bold text-white">All Characters</h2>
                        <span className="text-sm text-gray-400">{Object.keys(PERSONAS).length} available</span>
                    </div>

                    {/* Responsive Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 px-2">
                        {Object.values(PERSONAS).map((persona) => (
                            <div
                                key={persona.id}
                                onClick={() => router.push(`/public-chat/${persona.id}`)}
                                className="group bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 overflow-hidden cursor-pointer transition-all duration-500 hover:bg-white/8 hover:border-white/20 hover:scale-105 hover:shadow-2xl hover:shadow-pink-500/10"
                            >
                                {/* Character Portrait */}
                                <div className="relative h-56 overflow-hidden">
                                    <img
                                        src={persona.avatar}
                                        alt={persona.name}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent"></div>

                                    {/* Live Indicator - Small */}
                                    <div className="absolute top-3 right-3 px-2 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-green-500/40 flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] text-green-400 font-medium">Online</span>
                                    </div>

                                    {/* Name Overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-4">
                                        <h3 className="text-lg font-bold text-white mb-1 truncate">{persona.name}</h3>
                                        <p className="text-xs text-gray-400 font-medium">{persona.role}</p>
                                    </div>
                                </div>

                                {/* Character Info */}
                                <div className="p-4">
                                    <p className="text-sm text-gray-300 leading-relaxed line-clamp-2 mb-3">
                                        {persona.description}
                                    </p>

                                    {/* Quick Start Button */}
                                    <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-500/10 to-purple-500/10 border border-pink-500/20 text-sm text-pink-400 font-medium hover:from-pink-500/20 hover:to-purple-500/20 hover:border-pink-500/40 transition-all duration-300 flex items-center justify-center gap-2">
                                        <MessageCircle size={14} />
                                        Start chatting
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="mt-24 pb-12 px-6 text-center">
                    <p className="text-xs text-gray-600 uppercase tracking-[0.3em]">
                        Secure • Private • Always Listening
                    </p>
                    <p className="mt-4 text-xs text-gray-700">
                        © {new Date().getFullYear()} CreatorAI. Built for connection.
                    </p>
                </div>
            </div>
        </div>
    );
}
