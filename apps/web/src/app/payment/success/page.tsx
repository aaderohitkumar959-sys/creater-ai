'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { api } from '@/lib/api';
import { CheckCircle2, Loader2, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

function SuccessContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Payment detected. Syncing... please wait.');

    useEffect(() => {
        const verifyPayment = async () => {
            const txnId = searchParams.get('paypal_txn_id');

            // Get guest ID
            const userId = localStorage.getItem('chat_guest_id');

            if (!txnId || !userId) {
                setStatus('error');
                setMessage('Missing payment information. Please contact support.');
                return;
            }

            try {
                const res = await api.verifyPayPalPayment(userId, txnId);
                if (res.success) {
                    // Update local storage for immediate UI reflected in ChatUI
                    const currentCredits = parseInt(localStorage.getItem('chat_credits') || '0');
                    const newCredits = currentCredits + res.granted;
                    localStorage.setItem('chat_credits', newCredits.toString());
                    localStorage.setItem('is_premium_user', 'true');

                    setStatus('success');
                    setMessage(`Success! ${res.granted} messages added. Redirecting...`);

                    toast.success('Payment verified! ❤️');

                    // Redirect back to chat after 3 seconds
                    setTimeout(() => {
                        router.push('/');
                    }, 3000);
                } else {
                    setStatus('error');
                    setMessage(res.message || 'Verification failed. Please try again or contact support.');
                }
            } catch (err: any) {
                console.error('Verification error:', err);
                setStatus('error');
                setMessage('Could not sync payment. Our team is looking into it.');
            }
        };

        verifyPayment();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center p-6 text-center">
            <div className="max-w-md w-full space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="flex justify-center">
                    {status === 'loading' && <Loader2 className="w-16 h-16 text-blue-500 animate-spin" />}
                    {status === 'success' && <CheckCircle2 className="w-16 h-16 text-green-500" />}
                    {status === 'error' && <XCircle className="w-16 h-16 text-red-500" />}
                </div>

                <div className="space-y-4">
                    <h1 className="text-3xl font-bold tracking-tight">
                        {status === 'loading' && 'Verifying Payment'}
                        {status === 'success' && 'Payment Successful'}
                        {status === 'error' && 'Verification Issue'}
                    </h1>
                    <p className="text-slate-400 text-lg">
                        {message}
                    </p>
                </div>

                {status === 'error' && (
                    <button
                        onClick={() => router.push('/')}
                        className="px-8 py-3 bg-white/5 hover:bg-white/10 rounded-xl transition-colors border border-white/10"
                    >
                        Back to Home
                    </button>
                )}
            </div>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
