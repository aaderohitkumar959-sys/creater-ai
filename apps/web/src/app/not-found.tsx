'use client';

import Link from 'next/link';
import { ArrowLeft, Ghost } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function NotFound() {
    const router = useRouter();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-primary)] text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[var(--accent-blue)] opacity-10 blur-[100px] rounded-full pointer-events-none" />

            <div className="z-10 flex flex-col items-center max-w-md mx-auto">
                <div className="w-24 h-24 rounded-full bg-white/5 border border-[var(--border-medium)] flex items-center justify-center mb-6 animate-float">
                    <Ghost size={48} className="text-[var(--accent-blue)]" />
                </div>

                <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                    Page Not Found
                </h1>

                <p className="text-[var(--text-secondary)] mb-8 text-lg">
                    Spooky! We couldn't find the page you're looking for. It might have ghosted us.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-xl border border-[var(--border-medium)] hover:bg-white/5 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>

                    <Link
                        href="/"
                        className="px-6 py-3 rounded-xl bg-[var(--accent-blue)] hover:opacity-90 transition-opacity font-medium flex items-center justify-center"
                    >
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
