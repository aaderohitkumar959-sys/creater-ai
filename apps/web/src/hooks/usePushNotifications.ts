import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';

const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY as string;

function urlBase64ToUint8Array(base64String: string) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    const rawData = window.atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}

export function usePushNotifications() {
    const { data: session } = useSession();
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [subscription, setSubscription] = useState<PushSubscription | null>(null);
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined' && 'serviceWorker' in navigator && 'PushManager' in window) {
            // Register Service Worker
            navigator.serviceWorker.register('/sw.js')
                .then(reg => {
                    console.log('Service Worker registered', reg);
                    setRegistration(reg);
                    reg.pushManager.getSubscription().then(sub => {
                        if (sub) {
                            setSubscription(sub);
                            setIsSubscribed(true);
                        }
                    });
                })
                .catch(err => console.error('Service Worker registration failed', err));
        }
    }, []);

    const subscribeToNotifications = async () => {
        if (!registration) return;
        if (!VAPID_PUBLIC_KEY) {
            console.error("VAPID Public Key not found");
            return;
        }

        try {
            const sub = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
            });

            setSubscription(sub);
            setIsSubscribed(true);

            // Send subscription to backend
            if (session?.user?.id) {
                await fetch(`${process.env.NEXT_PUBLIC_API_URL}/notifications/subscribe`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${session.user.accessToken || ''}`
                    },
                    body: JSON.stringify(sub)
                });
            }

            console.log('User subscribed to push notifications');
        } catch (error) {
            console.error('Failed to subscribe the user: ', error);
        }
    };

    return {
        isSubscribed,
        subscribeToNotifications,
        permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',
    };
}
