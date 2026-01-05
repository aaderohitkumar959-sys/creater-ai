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
                {/* Logo Section */}
                <div className="pt-10 md:pt-16 pb-6 md:pb-8 px-6 flex flex-col items-center">
                    <div className="relative">
                        {/* Logo Glow Effect */}
                        <div className="absolute inset-0 blur-2xl opacity-50">
                            <img
                                src="/syelope-logo.jpg"
                                alt=""
                                className="w-28 h-28 md:w-40 md:h-40 object-contain"
                            />
                        </div>
                        {/* Main Logo */}
                        <img
                            src="/syelope-logo.jpg"
                            alt="Syelope"
                            className="relative w-28 h-28 md:w-40 md:h-40 object-contain drop-shadow-2xl"
                        />
                    </div>

                    {/* Tagline */}
                    <h1 className="mt-8 text-3xl md:text-5xl font-bold text-center max-w-2xl leading-tight tracking-tight">
                        You are heard.
                    </h1>
                    <p className="mt-6 text-xl text-gray-400 text-center max-w-md leading-relaxed">
                        A quiet space for when the world is too loud.
                        <br />
                        <span className="text-white font-medium">
                            No judgment. No expectations. Just presence.
                        </span>
                    </p>

                    {/* Emotional Onboarding Message */}
                    <div className="mt-8 px-6 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm shadow-sm">
                        <p className="text-sm text-gray-400">
                            You don't need to know what to say. <span className="text-white font-medium">Just start.</span>
                        </p>
                    </div>
                </div>

                {/* Personas Grid */}
                <div className="px-4 mt-8 max-w-2xl mx-auto">
                    <h2 className="text-xs uppercase tracking-[0.2em] text-gray-500 mb-6 px-2 text-center">Who do you need right now?</h2>

                    <div className="space-y-4">
                        {[
                            'aria-mistvale',
                            'kira-nightshade',
                            'momo-stardust',
                            'sage-frieren',
                            'yui-ember',
                            'nico-vale',
                            'sora-takumi',
                            'hikari-moon'
                        ].map((id, index) => {
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

                                        {/* Info */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-xl text-white tracking-tight">
                                                    {persona.name}
                                                </h3>
                                                <span className="px-2.5 py-0.5 rounded-md bg-pink-500/10 text-[10px] uppercase tracking-wider text-pink-500/80 font-bold border border-pink-500/20">
                                                    {persona.role}
                                                </span>
                                            </div>
                                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed font-light">
                                                {persona.description}
                                            </p>
                                        </div>

                                        {/* Action Icon */}
                                        <div className="flex-shrink-0">
                                            <div className="w-12 h-12 rounded-2xl bg-white/5 group-hover:bg-white/10 border border-white/10 group-hover:border-white/30 flex items-center justify-center transition-all duration-500 transform group-hover:rotate-12">
                                                <MessageCircle size={22} className="text-white/40 group-hover:text-white transition-colors" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative mt-24 pb-12 px-6">
                    <p className="text-center text-[10px] text-gray-600 uppercase tracking-[0.4em] font-medium">
                        Secure • Private • Compassionate
                    </p>
                    <p className="mt-6 text-center text-[10px] text-gray-700">
                        © {new Date().getFullYear()} Syelope. Built for resilience.
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
