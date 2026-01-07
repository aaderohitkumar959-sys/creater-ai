'use client';

import { useState, useEffect } from 'react';
import { Brain, Trash2, Lock, Sparkles } from 'lucide-react';

interface Memory {
    id: string;
    type: 'FACT' | 'PREFERENCE' | 'EVENT';
    content: string;
    importance: number;
    createdAt: string;
    lastAccessedAt: string;
}

interface MemoryStats {
    totalMemories: number;
    byType: {
        FACT: number;
        PREFERENCE: number;
        EVENT: number;
    };
    hasPremium: boolean;
}

export default function MemoryViewerPage() {
    const [memories, setMemories] = useState<Memory[]>([]);
    const [stats, setStats] = useState<MemoryStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedType, setSelectedType] = useState<string>('ALL');

    useEffect(() => {
        fetchMemories();
        fetchStats();
    }, []);

    const fetchMemories = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memory`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            const data = await response.json();
            setMemories(data.memories || []);
        } catch (error) {
            console.error('Failed to fetch memories:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memory/stats`, {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleDeleteMemory = async (memoryId: string) => {
        if (!confirm('Are you sure you want to delete this memory?')) {
            return;
        }

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memory/${memoryId}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            // Remove from local state
            setMemories(memories.filter((m) => m.id !== memoryId));
            fetchStats(); // Refresh stats
        } catch (error) {
            console.error('Failed to delete memory:', error);
            alert('Failed to delete memory');
        }
    };

    const handleDeleteAll = async () => {
        if (
            !confirm(
                'This will delete ALL your memories. This action cannot be undone. Are you sure?',
            )
        ) {
            return;
        }

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/memory`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
            });

            setMemories([]);
            fetchStats();
        } catch (error) {
            console.error('Failed to delete all memories:', error);
            alert('Failed to delete memories');
        }
    };

    const filteredMemories =
        selectedType === 'ALL'
            ? memories
            : memories.filter((m) => m.type === selectedType);

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'FACT':
                return '📌';
            case 'PREFERENCE':
                return '❤️';
            case 'EVENT':
                return '🎉';
            default:
                return '💭';
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'FACT':
                return 'bg-blue-500/20 text-blue-300';
            case 'PREFERENCE':
                return 'bg-pink-500/20 text-pink-300';
            case 'EVENT':
                return 'bg-yellow-500/20 text-yellow-300';
            default:
                return 'bg-gray-500/20 text-gray-300';
        }
    };

    if (!stats?.hasPremium) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 py-12 px-4">
                <div className="max-w-4xl mx-auto">
                    {/* Premium Upsell */}
                    <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-12 text-center">
                        <Lock className="w-20 h-20 mx-auto mb-6 text-yellow-300" />
                        <h2 className="text-4xl font-bold text-white mb-4">
                            Unlock Long-Term Memory
                        </h2>
                        <p className="text-xl text-gray-200 mb-8 max-w-2xl mx-auto">
                            Upgrade to Premium and your AI will remember important facts,
                            preferences, and events across all conversations!
                        </p>

                        <div className="grid md:grid-cols-3 gap-6 mb-8">
                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <div className="text-4xl mb-2">📌</div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Remember Facts
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    Your AI remembers your job, hobbies, and personal details
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <div className="text-4xl mb-2">❤️</div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Learn Preferences
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    Knows your likes, dislikes, and favorite things
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-md rounded-xl p-6">
                                <div className="text-4xl mb-2">🎉</div>
                                <h3 className="text-lg font-semibold text-white mb-2">
                                    Track Events
                                </h3>
                                <p className="text-gray-300 text-sm">
                                    Remembers important moments and experiences
                                </p>
                            </div>
                        </div>

                        <a
                            href="/pricing"
                            className="inline-block bg-white text-violet-600 px-8 py-4 rounded-xl font-semibold text-lg hover:bg-gray-100 transition-colors"
                        >
                            Upgrade to Premium
                        </a>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
                    <p className="mt-4 text-gray-400">Loading memories...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2 flex items-center gap-3">
                                <img src="/brand-logo.png" alt="" className="w-10 h-10 rounded-lg object-contain border border-white/10" />
                                AI Memory
                            </h1>
                            <p className="text-gray-300">
                                What your AI remembers about you
                            </p>
                        </div>

                        {memories.length > 0 && (
                            <button
                                onClick={handleDeleteAll}
                                className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors"
                            >
                                <Trash2 className="w-4 h-4" />
                                Delete All
                            </button>
                        )}
                    </div>

                    {/* Stats */}
                    {stats && (
                        <div className="grid grid-cols-4 gap-4">
                            <div className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-4">
                                <p className="text-gray-400 text-sm">Total Memories</p>
                                <p className="text-3xl font-bold text-white">
                                    {stats.totalMemories}
                                </p>
                            </div>

                            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                                <p className="text-blue-300 text-sm">📌 Facts</p>
                                <p className="text-3xl font-bold text-blue-200">
                                    {stats.byType.FACT}
                                </p>
                            </div>

                            <div className="bg-pink-500/10 border border-pink-500/30 rounded-xl p-4">
                                <p className="text-pink-300 text-sm">❤️ Preferences</p>
                                <p className="text-3xl font-bold text-pink-200">
                                    {stats.byType.PREFERENCE}
                                </p>
                            </div>

                            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
                                <p className="text-yellow-300 text-sm">🎉 Events</p>
                                <p className="text-3xl font-bold text-yellow-200">
                                    {stats.byType.EVENT}
                                </p>
                            </div>
                        </div>
                    )}
                </div>

                {/* Filter */}
                <div className="mb-6 flex gap-2">
                    {['ALL', 'FACT', 'PREFERENCE', 'EVENT'].map((type) => (
                        <button
                            key={type}
                            onClick={() => setSelectedType(type)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${selectedType === type
                                ? 'bg-violet-600 text-white'
                                : 'bg-gray-800/50 text-gray-300 hover:bg-gray-700'
                                }`}
                        >
                            {type === 'ALL' ? 'All' : `${getTypeIcon(type)} ${type}`}
                        </button>
                    ))}
                </div>

                {/* Memories List */}
                {filteredMemories.length === 0 ? (
                    <div className="bg-gray-800/30 border border-gray-700 rounded-xl p-12 text-center">
                        <Sparkles className="w-16 h-16 mx-auto mb-4 text-gray-600" />
                        <h3 className="text-xl font-semibold text-gray-400 mb-2">
                            No memories yet
                        </h3>
                        <p className="text-gray-500">
                            Keep chatting with your AI to build personalized memories!
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {filteredMemories.map((memory) => (
                            <div
                                key={memory.id}
                                className="bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-xl p-6 hover:border-violet-500/50 transition-colors"
                            >
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-3">
                                            <span
                                                className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(memory.type)}`}
                                            >
                                                {getTypeIcon(memory.type)} {memory.type}
                                            </span>

                                            <span className="text-gray-500 text-sm">
                                                Importance: {memory.importance}/10
                                            </span>
                                        </div>

                                        <p className="text-white text-lg mb-2">
                                            {memory.content}
                                        </p>

                                        <p className="text-gray-500 capitalize text-sm">
                                            Created {new Date(memory.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>

                                    <button
                                        onClick={() => handleDeleteMemory(memory.id)}
                                        className="text-gray-400 hover:text-red-400 transition-colors p-2"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
