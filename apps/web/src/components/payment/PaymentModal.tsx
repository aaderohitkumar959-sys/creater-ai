"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CoinPack } from "@/types/payment";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "@/lib/api";
import { Loader2 } from "lucide-react";

// Initialize Stripe outside of component to avoid recreating it
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedPack: CoinPack | null;
    onSuccess: () => void;
}

function StripePaymentForm({ onSuccess, onError }: { onSuccess: () => void; onError: (msg: string) => void }) {
    const stripe = useStripe();
    const elements = useElements();
    const [isProcessing, setIsProcessing] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!stripe || !elements) return;

        setIsProcessing(true);

        const { error } = await stripe.confirmPayment({
            elements,
            confirmParams: {
                return_url: `${window.location.origin}/wallet/payment-success`,
            },
            redirect: "if_required",
        });

        if (error) {
            onError(error.message || "Payment failed");
            setIsProcessing(false);
        } else {
            onSuccess();
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <PaymentElement />
            <Button type="submit" disabled={!stripe || isProcessing} className="w-full">
                {isProcessing ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Pay with Stripe"}
            </Button>
        </form>
    );
}

export function PaymentModal({ isOpen, onClose, selectedPack, onSuccess }: PaymentModalProps) {
    const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'razorpay' | null>(null);
    const [clientSecret, setClientSecret] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleStripeSelect = async () => {
        if (!selectedPack) return;
        setLoading(true);
        setError(null);
        try {
            const { clientSecret } = await api.createStripePaymentIntent(selectedPack.id);
            setClientSecret(clientSecret);
            setPaymentMethod('stripe');
        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRazorpaySelect = async () => {
        if (!selectedPack) return;
        setLoading(true);
        setError(null);
        try {
            const order = await api.createRazorpayOrder(selectedPack.id);

            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || 'rzp_test_placeholder',
                amount: order.amount,
                currency: order.currency,
                name: "CreatorAI",
                description: `Purchase ${selectedPack.coins} Coins`,
                order_id: order.orderId,
                handler: async function (response: any) {
                    // In a real app, you might verify signature here or just rely on webhook
                    onSuccess();
                    onClose();
                },
                prefill: {
                    name: "User Name", // You could fetch this from auth context
                    email: "user@example.com",
                },
                theme: {
                    color: "#3399cc"
                }
            };

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const rzp = new (window as any).Razorpay(options);
            rzp.open();

        } catch (err: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const reset = () => {
        setPaymentMethod(null);
        setClientSecret(null);
        setError(null);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) { onClose(); reset(); } }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Complete Purchase</DialogTitle>
                    <DialogDescription>
                        Buying {selectedPack?.coins} coins for ${selectedPack?.priceUSD}
                    </DialogDescription>
                </DialogHeader>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                        <span className="block sm:inline">{error}</span>
                    </div>
                )}

                {!paymentMethod && (
                    <div className="grid gap-4 py-4">
                        <Button onClick={handleStripeSelect} disabled={loading} variant="outline" className="h-16 text-lg">
                            Pay with Stripe
                        </Button>
                        <Button onClick={handleRazorpaySelect} disabled={loading} variant="outline" className="h-16 text-lg">
                            Pay with Razorpay
                        </Button>
                    </div>
                )}

                {paymentMethod === 'stripe' && clientSecret && (
                    <Elements stripe={stripePromise} options={{ clientSecret }}>
                        <StripePaymentForm
                            onSuccess={() => { onSuccess(); onClose(); reset(); }}
                            onError={setError}
                        />
                    </Elements>
                )}
            </DialogContent>
        </Dialog>
    );
}
