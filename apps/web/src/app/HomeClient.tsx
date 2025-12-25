'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { PERSONAS } from '@/lib/personas';
import { MessageCircle } from 'lucide-react';

export function HomeClient() {
    const router = useRouter();

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
                <div className="pt-16 pb-8 px-6 flex flex-col items-center">
                    <div className="relative">
                        {/* Logo Glow Effect */}
                        <div className="absolute inset-0 blur-2xl opacity-50">
                            <img
                                src="/syelope-logo.jpg"
                                alt=""
                                className="w-40 h-40 object-contain"
                            />
                        </div>
                        {/* Main Logo */}
                        <img
                            src="/syelope-logo.jpg"
                            alt="Syelope"
                            className="relative w-40 h-40 object-contain drop-shadow-2xl"
                        />
                    </div>

                    {/* Tagline */}
                    <h1 className="mt-6 text-2xl md:text-3xl font-bold text-center max-w-2xl leading-tight">
                        Syelope – AI Characters That Listen & Care
                    </h1>
                    <p className="mt-4 text-lg text-gray-400 text-center max-w-md leading-relaxed">
                        Your private AI companion.
                        <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 via-purple-400 to-blue-400">
                            Always understanding. Never judging.
                        </span>
                    </p>
                </div>

                {/* Personas Grid */}
                <div className="px-4 mt-8 max-w-2xl mx-auto">
                    <h2 className="text-sm uppercase tracking-widest text-gray-500 mb-4 px-2">Choose Your Companion</h2>

                    <div className="space-y-3">
                        {Object.values(PERSONAS).map((persona, index) => (
                            <div
                                key={persona.id}
                                onClick={() => router.push(`/public-chat/${persona.id}`)}
                                className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 p-5 transition-all duration-300 hover:border-white/20 hover:shadow-2xl hover:shadow-purple-500/20 active:scale-[0.98] cursor-pointer backdrop-blur-xl"
                                style={{
                                    animationDelay: `${index * 100}ms`,
                                    animation: 'fadeInUp 0.6s ease-out forwards',
                                    opacity: 0
                                }}
                            >
                                {/* Gradient Overlay on Hover */}
                                <div className={`absolute inset-0 bg-gradient-to-r ${persona.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                                <div className="flex items-center gap-4 relative z-10">
                                    {/* Avatar */}
                                    <div className="relative">
                                        <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-white/40 transition-all duration-300 group-hover:scale-110">
                                            <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
                                        </div>
                                        {/* Active Indicator */}
                                        <div className="absolute bottom-0 right-0 w-4 h-4 bg-green-400 rounded-full border-2 border-[#13111c] shadow-lg shadow-green-400/50"></div>
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className="font-bold text-lg text-white group-hover:text-transparent group-hover:bg-clip-text group-hover:bg-gradient-to-r group-hover:from-pink-400 group-hover:to-purple-400 transition-all duration-300">
                                                {persona.name}
                                            </h3>
                                            <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase tracking-wider text-gray-400 font-medium">
                                                {persona.role}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                                            {persona.description}
                                        </p>
                                    </div>

                                    {/* Action Icon */}
                                    <div className="flex-shrink-0">
                                        <div className="w-10 h-10 rounded-full bg-white/5 group-hover:bg-white/10 border border-white/10 group-hover:border-white/20 flex items-center justify-center transition-all duration-300">
                                            <MessageCircle size={18} className="text-gray-400 group-hover:text-white transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Footer */}
                <div className="relative mt-20 pb-10 px-6">
                    <p className="text-center text-xs text-gray-600 uppercase tracking-widest">
                        Private • Secure • Always Online
                    </p>
                    <p className="mt-4 text-center text-[10px] text-gray-700">
                        © {new Date().getFullYear()} Syelope. All rights reserved.
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
