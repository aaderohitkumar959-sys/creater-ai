'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { RotateCcw, Home } from 'lucide-react';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary caught:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[var(--bg-primary)] text-center relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-red-500 opacity-5 blur-[100px] rounded-full pointer-events-none" />

            <div className="z-10 flex flex-col items-center max-w-md mx-auto">
                <h2 className="text-3xl font-bold mb-3 text-red-500">
                    Something went wrong
                </h2>

                <p className="text-[var(--text-secondary)] mb-8">
                    Don't worry, it's not you - it's us. We encountered an unexpected connection signal.
                </p>

                <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
                    <button
                        onClick={
                            // Attempt to recover by trying to re-render the segment
                            () => reset()
                        }
                        className="px-6 py-3 rounded-xl border border-[var(--border-medium)] hover:bg-white/5 transition-colors flex items-center justify-center gap-2 font-medium"
                    >
                        <RotateCcw size={18} />
                        Try Again
                    </button>

                    <Link
                        href="/"
                        className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors font-medium flex items-center justify-center gap-2"
                    >
                        <Home size={18} />
                        Return Home
                    </Link>
                </div>
            </div>
        </div>
    );
}
