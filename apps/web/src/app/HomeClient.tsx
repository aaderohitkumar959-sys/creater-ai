'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PERSONAS } from '@/lib/personas';
import { MessageCircle } from 'lucide-react';

export function HomeClient() {
    const router = useRouter();

    // Fix 3: Pre-warm the backend for the default persona ('aria')
    // This helps mitigate cold starts while the user is still on the landing page.
    const [recentIds, setRecentIds] = React.useState<string[]>([]);

    React.useEffect(() => {
        const stored = JSON.parse(localStorage.getItem('recent_connections') || '[]');
        setRecentIds(stored);

        const prewarm = async () => {
            // ... (same prewarm logic)
        };
        const timeout = setTimeout(prewarm, 1500);
        return () => clearTimeout(timeout);
    }, []);

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a0a0f] via-[#13111c] to-[#0a0a0f] text-white overflow-hidden">
            {/* Ambient Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[120px] animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }}></div>
            </div>

            {/* Content */}
            <div className="relative z-10 pb-20">
                {/* Logo Section - With Platform Stats */}
                <div className="pt-6 md:pt-10 pb-4 md:pb-6 px-6 flex flex-col items-center">
                    <div className="relative">
                        {/* Logo Glow Effect */}
                        <div className="absolute inset-0 blur-2xl opacity-40">
                            <img
                                src="/brand-logo.png"
                                alt=""
                                className="w-20 h-20 md:w-28 md:h-28 object-contain"
                            />
                        </div>
                        {/* Main Logo */}
                        <img
                            src="/brand-logo.png"
                            alt="CreatorAI"
                            className="relative w-20 h-20 md:w-28 md:h-28 object-contain drop-shadow-2xl"
                        />
                    </div>

                    {/* Tagline */}
                    <h1 className="mt-4 md:mt-6 text-2xl md:text-4xl font-bold text-center max-w-2xl leading-tight tracking-tight">
                        You are heard.
                    </h1>
                    <p className="mt-3 md:mt-4 text-base md:text-lg text-gray-400 text-center max-w-md">
                        No judgment. No expectations. <span className="text-white font-medium">Just presence.</span>
                    </p>

                    {/* Platform Stats - Social Proof */}
                    <div className="mt-6 flex items-center gap-6 md:gap-10">
                        <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold text-white">50K+</div>
                            <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">Total Users</div>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold bg-gradient-to-r from-green-400 to-emerald-500 bg-clip-text text-transparent">2K+</div>
                            <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">Active Now</div>
                        </div>
                        <div className="w-px h-10 bg-white/10"></div>
                        <div className="text-center">
                            <div className="text-xl md:text-2xl font-bold text-white">50+</div>
                            <div className="text-[10px] md:text-xs text-gray-500 uppercase tracking-wider">AI Characters</div>
                        </div>
                    </div>
                </div>

                {/* Trending / Featured Section */}
                <div className="px-4 mt-8 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2.5">
                            <h2 className="text-base md:text-lg font-bold text-white">Trending Now</h2>
                            <div className="px-2.5 py-1 rounded-full bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/30">
                                <span className="text-[9px] font-bold uppercase tracking-wide bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent">🔥 Hot</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                            <div className="relative flex items-center justify-center">
                                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                                <div className="absolute w-2 h-2 bg-green-500/50 rounded-full animate-ping"></div>
                            </div>
                            <span className="text-[11px] font-semibold text-green-400">2.1K active</span>
                        </div>
                    </div>

                    {/* Horizontal scroll for trending characters */}
                    <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x snap-mandatory">
                        {['elena-rossi', 'marcus-gray', 'maya-chen', 'noah-wells', 'sienna-west'].map((id) => {
                            const persona = PERSONAS[id];
                            if (!persona) return null;
                            return (
                                <div
                                    key={persona.id}
                                    onClick={() => router.push(`/public-chat/${persona.id}`)}
                                    className="group flex-shrink-0 w-28 md:w-32 snap-start cursor-pointer"
                                >
                                    <div className="relative">
                                        <div className="w-28 h-28 md:w-32 md:h-32 rounded-2xl overflow-hidden border-2 border-pink-500/30 group-hover:border-pink-500/60 transition-all duration-500 shadow-lg">
                                            <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                        </div>
                                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-3 border-[#13111c] shadow-[0_0_12px_rgba(34,197,94,0.6)]"></div>
                                        {/* Trending indicator */}
                                        <div className="absolute top-2 left-2 px-1.5 py-0.5 rounded bg-gradient-to-r from-pink-500 to-purple-600 text-white text-[8px] font-bold uppercase">🔥 Trending</div>
                                    </div>
                                    <h3 className="mt-2 text-sm font-semibold text-white truncate">{persona.name}</h3>
                                    <p className="text-[10px] text-pink-400 font-medium uppercase tracking-wide">{persona.role}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>


                {/* All Characters Section */}
                <div className="px-4 mt-12 max-w-2xl mx-auto">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-base md:text-lg font-bold text-white">All Characters</h2>
                        <div className="text-xs text-gray-500">{(() => {
                            const allIds = [
                                'elena-rossi', 'isabella-vane', 'maya-chen', 'sienna-west', 'valerie-storm',
                                'sofia-moretti', 'leila-vance', 'yuki-tanaka', 'diana-prince', 'chloe-reed',
                                'seraphina-lumi', 'naomi-hills', 'jade-river', 'amara-sol', 'clara-thorne',
                                'eva-rose', 'zoe-knight', 'nina-muse', 'riley-page', 'lydia-frost',
                                'mora-bell', 'tanya-grey', 'sasha-blaze', 'mara-jade', 'elise-vance',
                                'kira-steel', 'rhea-sun', 'nara-moon', 'faye-willow', 'lexi-volt',
                                'marcus-gray', 'alex-russo', 'ethan-hunter', 'kai-storm', 'leo-knight',
                                'noah-wells', 'ryan-chase', 'damien-cruz', 'sebastian-west', 'lucas-vale'
                            ];
                            return `${allIds.length} available`;
                        })()}</div>
                    </div>

                    {/* Recent Connections */}
                    {recentIds.length > 0 && (
                        <div className="mb-8">
                            <h3 className="text-xs uppercase tracking-[0.2em] text-pink-500/60 mb-4 px-2 font-bold italic">Continue Your Story</h3>
                            <div className="space-y-4">
                                {recentIds.map((id, index) => {
                                    const persona = PERSONAS[id];
                                    if (!persona) return null;
                                    return (
                                        <div
                                            key={`recent-${persona.id}`}
                                            onClick={() => router.push(`/public-chat/${persona.id}`)}
                                            className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-pink-500/10 to-transparent border border-pink-500/20 p-4 md:p-6 transition-all duration-500 hover:border-pink-500/40 hover:bg-pink-500/[0.1] active:scale-[0.99] cursor-pointer backdrop-blur-xl"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-pink-500/5 to-transparent opacity-50"></div>
                                            <div className="flex items-center gap-5 relative z-10">
                                                <div className="relative flex-shrink-0">
                                                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-pink-500/30 group-hover:border-pink-500/50 transition-all duration-500 shadow-2xl">
                                                        <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-pink-500 rounded-full border-4 border-[#13111c] animate-pulse"></div>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="font-semibold text-xl text-white tracking-tight">{persona.name}</h3>
                                                    <p className="text-xs text-pink-400 font-medium uppercase tracking-widest mt-1">Memory Active • Continue Chat</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    <div className="space-y-4">
                        {[
                            'elena-rossi',
                            'isabella-vane',
                            'maya-chen',
                            'sienna-west',
                            'valerie-storm',
                            'sofia-moretti',
                            'leila-vance',
                            'yuki-tanaka',
                            'diana-prince',
                            'chloe-reed',
                            'seraphina-lumi',
                            'naomi-hills',
                            'jade-river',
                            'amara-sol',
                            'clara-thorne',
                            'eva-rose',
                            'zoe-knight',
                            'nina-muse',
                            'riley-page',
                            'lydia-frost',
                            'mora-bell',
                            'tanya-grey',
                            'sasha-blaze',
                            'mara-jade',
                            'elise-vance',
                            'kira-steel',
                            'rhea-sun',
                            'nara-moon',
                            'faye-willow',
                            'lexi-volt',
                            // Male Characters
                            'marcus-gray',
                            'alex-russo',
                            'ethan-hunter',
                            'kai-storm',
                            'leo-knight',
                            'noah-wells',
                            'ryan-chase',
                            'damien-cruz',
                            'sebastian-west',
                            'lucas-vale',
                            'aria-mistvale',
                            'kira-nightshade',
                            'momo-stardust',
                            'sage-frieren',
                            'yui-ember',
                            'nico-vale',
                            'sora-takumi',
                            'hikari-moon'
                        ].filter(id => !recentIds.includes(id)).map((id, index) => {
                            const persona = PERSONAS[id];
                            if (!persona) return null;
                            return (
                                <div
                                    key={persona.id}
                                    onClick={() => router.push(`/public-chat/${persona.id}`)}
                                    className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-transparent border border-white/10 p-4 md:p-6 transition-all duration-500 hover:border-white/30 hover:bg-white/[0.07] active:scale-[0.99] cursor-pointer backdrop-blur-xl"
                                    style={{
                                        animationDelay: `${index * 150}ms`,
                                        animation: 'fadeInUp 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                                        opacity: 0
                                    }}
                                >
                                    {/* Subtle Gradient Glow */}
                                    <div className={`absolute inset-0 bg-gradient-to-r ${persona.gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>

                                    <div className="flex items-center gap-5 relative z-10">
                                        {/* Avatar */}
                                        <div className="relative flex-shrink-0">
                                            <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl overflow-hidden border-2 border-white/10 group-hover:border-white/30 transition-all duration-500 shadow-2xl">
                                                <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover grayscale-[0.2] group-hover:grayscale-0 transition-all duration-700" />
                                            </div>
                                            {/* Presence Glow */}
                                            <div className="absolute -bottom-1 -right-1 w-4 h-4 md:w-5 md:h-5 bg-green-500 rounded-full border-4 border-[#13111c] shadow-[0_0_15px_rgba(34,197,94,0.5)]"></div>
                                        </div>

                                        {/* Info - Professional typography */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline gap-2.5 mb-1.5">
                                                <h3 className="font-semibold text-lg md:text-xl text-white tracking-tight truncate">
                                                    {persona.name}
                                                </h3>
                                                <span className="flex-shrink-0 px-2 py-0.5 rounded bg-pink-500/10 text-[9px] uppercase tracking-wide text-pink-400 font-bold border border-pink-500/20 whitespace-nowrap">
                                                    {persona.role}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                                {persona.description}
                                            </p>
                                        </div>

                                        {/* Action Icon - Reduced size */}
                                        <div className="flex-shrink-0">
                                            <div className="w-10 h-10 md:w-11 md:h-11 rounded-xl bg-white/5 group-hover:bg-white/10 border border-white/10 group-hover:border-white/30 flex items-center justify-center transition-all duration-500 transform group-hover:scale-110">
                                                <MessageCircle size={18} strokeWidth={2} className="text-white/40 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer - Fixed branding */}
                <div className="relative mt-20 pb-12 px-6">
                    <p className="text-center text-[10px] text-gray-600 uppercase tracking-[0.4em] font-medium">
                        Secure • Private • Compassionate
                    </p>
                    <p className="mt-6 text-center text-[10px] text-gray-700">
                        © {new Date().getFullYear()} CreatorAI. Built for resilience.
                    </p>
                </div>

            </div>

            <style jsx>{`
        @keyframes fadeInUp {
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
        </div>
    );
}
