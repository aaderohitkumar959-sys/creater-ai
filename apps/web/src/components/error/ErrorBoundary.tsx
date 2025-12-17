'use client';

import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ErrorBoundaryState {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends React.Component<
    { children: React.ReactNode },
    ErrorBoundaryState
> {
    constructor(props: { children: React.ReactNode }) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): ErrorBoundaryState {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
        // Log to error monitoring service (Sentry)
        console.error('Error Boundary caught:', error, errorInfo);

        // TODO: Send to Sentry
        // Sentry.captureException(error, { extra: errorInfo });
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-gradient-to-br from-gray-900 via-violet-950 to-gray-900 flex items-center justify-center p-4">
                    <div className="max-w-md w-full bg-gray-800/50 backdrop-blur-md border border-gray-700 rounded-2xl p-8 text-center">
                        <div className="mb-6">
                            <AlertTriangle className="w-16 h-16 text-red-500 mx-auto" />
                        </div>

                        <h1 className="text-2xl font-bold text-white mb-2">
                            Something went wrong
                        </h1>

                        <p className="text-gray-300 mb-6">
                            We're sorry, but something unexpected happened. Please try
                            refreshing the page.
                        </p>

                        {process.env.NODE_ENV === 'development' && this.state.error && (
                            <div className="bg-gray-900 rounded-lg p-4 mb-6 text-left">
                                <p className="text-red-400 text-sm font-mono">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-3">
                            <button
                                onClick={() => window.location.reload()}
                                className="flex-1 bg-violet-600 text-white py-3 rounded-lg font-semibold hover:bg-violet-700 transition-colors"
                            >
                                Refresh Page
                            </button>

                            <button
                                onClick={() => (window.location.href = '/')}
                                className="flex-1 bg-gray-700 text-white py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
                            >
                                Go Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
