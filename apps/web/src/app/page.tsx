'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { PERSONAS } from '@/lib/personas';
import { Sparkles, MessageCircle, Star } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Home() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-white pb-20">
      {/* Header */}
      <div className="p-6 pt-12 space-y-2 flex flex-col items-center">
        <img
          src="/syelope-logo.jpg"
          alt="Syelope"
          className="w-32 h-32 object-contain mb-2"
        />
        <p className="text-gray-400 text-center">Choose your private companion.</p>
      </div>

      {/* Persona Grid */}
      <div className="px-4 grid gap-4">
        {Object.values(PERSONAS).map((persona) => (
          <div
            key={persona.id}
            onClick={() => router.push(`/public-chat/${persona.id}`)}
            className="group relative overflow-hidden rounded-2xl bg-gray-900 border border-white/10 p-4 transition-all hover:border-white/20 active:scale-95 cursor-pointer"
          >
            <div className={`absolute inset-0 bg-gradient-to-r ${persona.gradient} opacity-0 group-hover:opacity-10 transition-opacity`} />

            <div className="flex items-center gap-4 relative z-10">
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/10 shrink-0">
                <img src={persona.avatar} alt={persona.name} className="w-full h-full object-cover" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-lg truncate">{persona.name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-white/10 text-[10px] uppercase tracking-wider text-gray-300">
                    {persona.role}
                  </span>
                </div>
                <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed">
                  {persona.description}
                </p>
              </div>

              <div className="flex flex-col gap-2 text-gray-500">
                <MessageCircle size={20} />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating CTA or Footer */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black via-black/90 to-transparent">
        <p className="text-center text-xs text-gray-600">
          Private • Secure • Always Online
        </p>
      </div>
    </div>
  );
}
