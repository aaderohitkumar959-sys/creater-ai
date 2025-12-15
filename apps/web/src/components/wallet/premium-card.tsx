/**
 * Premium Card Component
 * Shimmer animation and FOMO-inducing design
 */

'use client';

import React from 'react';
import { Sparkles, Check, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PremiumCardProps {
    onUpgrade?: () => void;
    isPremium?: boolean;
}

export const PremiumCard: React.FC<PremiumCardProps> = ({
    onUpgrade,
    isPremium = false
}) => {
    return (
        <div
            className={cn(
                'relative overflow-hidden rounded-2xl p-6',
                'border-2',
                'transition-all duration-300',
                isPremium
                    ? 'border-yellow-500/50 bg-gradient-to-br from-yellow-500/10 to-purple-500/10'
                    : 'border-[var(--accent-purple)]/30 hover:-translate-y-1 hover:shadow-2xl cursor-pointer'
            )}
            onClick={!isPremium ? onUpgrade : undefined}
            style={{
                background: isPremium
                    ? 'linear-gradient(135deg, rgba(234, 179, 8, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)'
                    : 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(139, 92, 246, 0.1) 100%)',
            }}
        >
            {/* Shimmer effect */}
            {!isPremium && (
                <div
                    className="absolute inset-0 opacity-30"
                    style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 50%, transparent 100%)',
                        backgroundSize: '200% 100%',
                        animation: 'shimmer 3s linear infinite',
                    }}
                />
            )}

            {/* Crown icon for premium users */}
            {isPremium && (
                <div className="absolute top-4 right-4">
                    <Crown className="text-yellow-500" size={32} fill="currentColor" />
                </div>
            )}

            {/* Content */}
            <div className="relative z-10">
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                    <div className="p-2 rounded-lg bg-gradient-accent">
                        <Sparkles className="text-white" size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-gradient">
                            {isPremium ? 'Premium Active' : 'Upgrade to Premium'}
                        </h3>
                        <p className="text-xs text-[var(--text-muted)]">
                            {isPremium ? 'Enjoying unlimited access' : 'Unlock unlimited conversations'}
                        </p>
                    </div>
                </div>

                {/* Benefits */}
                <div className="space-y-3 mb-6">
                    {[
                        'Unlimited AI conversations',
                        'No daily message limits',
                        'Access to premium AI personalities',
                        'Priority response speed',
                        'Early access to new features',
                    ].map((benefit, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <div className={cn(
                                'flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center',
                                isPremium ? 'bg-yellow-500' : 'bg-[var(--accent-blue)]'
                            )}>
                                <Check size={12} className="text-white" strokeWidth={3} />
                            </div>
                            <span className="text-sm text-[var(--text-secondary)]">{benefit}</span>
                        </div>
                    ))}
                </div>

                {/* CTA / Status */}
                {isPremium ? (
                    <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/30">
                        <p className="text-sm text-center text-yellow-500 font-medium">
                            ✨ You're a Premium Member
                        </p>
                    </div>
                ) : (
                    <button
                        onClick={onUpgrade}
                        className={cn(
                            'w-full py-3 px-6 rounded-xl font-semibold',
                            'bg-gradient-accent text-white',
                            'shadow-glow hover:shadow-glow-purple',
                            'transition-all duration-250',
                            'hover:scale-105 active:scale-95'
                        )}
                    >
                        Continue Chatting Without Interruption
                    </button>
                )}

                {/* Pricing */}
                {!isPremium && (
                    <p className="text-center text-xs text-[var(--text-muted)] mt-3">
                        From $9.99/month • Cancel anytime
                    </p>
                )}
            </div>

            {/* Floating coins animation */}
            {!isPremium && (
                <>
                    <div
                        className="absolute top-10 right-10 w-8 h-8 rounded-full bg-yellow-500/20"
                        style={{
                            animation: 'float 3s ease-in-out infinite',
                        }}
                    />
                    <div
                        className="absolute bottom-20 left-10 w-6 h-6 rounded-full bg-purple-500/20"
                        style={{
                            animation: 'float 4s ease-in-out infinite',
                            animationDelay: '1s',
                        }}
                    />
                </>
            )}

            <style jsx>{`
        @keyframes shimmer {
          0% {
            background-position: -200% 0;
          }
          100% {
            background-position: 200% 0;
          }
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-20px);
          }
        }
      `}</style>
        </div>
    );
};
