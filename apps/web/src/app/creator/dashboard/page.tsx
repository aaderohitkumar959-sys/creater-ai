'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Users, DollarSign, Plus, Bell } from 'lucide-react';
import { PricingControl } from '@/components/creator/PricingControl';
import { toast } from 'react-hot-toast';
import { usePushNotifications } from '@/hooks/usePushNotifications';

export default function CreatorDashboard() {
    const { data: session } = useSession();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const { isSubscribed, subscribeToNotifications, permission } = usePushNotifications();

    useEffect(() => {
        const fetchStats = async () => {
            if (!session?.user?.id) return;
            try {
                const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/creator/dashboard`, {
                    headers: {
                        'Authorization': `Bearer ${session.user.accessToken || ''}`
                    }
                });
                if (res.ok) {
                    const data = await res.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Failed to fetch dashboard stats:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchStats();
    }, [session]);

    const handleUpdatePricing = async (personaId: string, newCost: number) => {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/personas/${personaId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${session?.user?.accessToken || ''}`
            },
            body: JSON.stringify({ defaultCoinCost: newCost })
        });

        if (!res.ok) throw new Error("Failed to update");

        // Update local state
        setStats((prev: any) => ({
            ...prev,
            personas: prev.personas.map((p: any) =>
                p.id === personaId ? { ...p, defaultCoinCost: newCost } : p
            )
        }));
    };

    if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
    if (!stats) return <div className="p-8 text-center">Become a Creator to see this dashboard!</div>;

    return (
        <div className="container mx-auto p-6 space-y-8">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold font-display">Creator Dashboard</h1>
                <div className="flex gap-2">
                    {permission === 'default' && (
                        <Button variant="outline" onClick={subscribeToNotifications}>
                            <Bell className="w-4 h-4 mr-2" /> Enable Notifications
                        </Button>
                    )}
                    <Button>
                        <Plus className="w-4 h-4 mr-2" /> New Persona
                    </Button>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.earnings} Coins</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Active Personas</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.totalPersonas}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Conversations</CardTitle>
                        <BarChart className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">
                            {stats.personas.reduce((acc: number, p: any) => acc + (p.conversationCount || 0), 0)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Tabs defaultValue="personas" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="personas">My Personas</TabsTrigger>
                    <TabsTrigger value="analytics">Analytics</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                </TabsList>

                <TabsContent value="personas" className="space-y-4">
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {stats.personas.map((persona: any) => (
                            <div key={persona.id} className="space-y-4">
                                <PricingControl
                                    personaId={persona.id}
                                    initialCost={persona.defaultCoinCost}
                                    onSave={(cost) => handleUpdatePricing(persona.id, cost)}
                                />
                                {/* Add more controls here like Edit Profile, View Chats etc */}
                            </div>
                        ))}
                    </div>
                </TabsContent>

                <TabsContent value="analytics">
                    <Card>
                        <CardHeader>
                            <CardTitle>Detailed Analytics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground">Coming soon in Sprint 3...</p>
                        </CardContent>
                    </Card>
                </TabsContent>
            </Tabs>
        </div>
    );
}
