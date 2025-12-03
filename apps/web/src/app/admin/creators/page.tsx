"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DollarSign, Users } from "lucide-react";

export default function AdminCreatorsPage() {
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const data = await api.getAdminCreatorStats();
                setStats(data);
            } catch (error) {
                console.error("Failed to load creator stats");
            } finally {
                setLoading(false);
            }
        };
        loadStats();
    }, []);

    if (loading) return <div>Loading creators...</div>;

    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Creator Management</h1>

            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Creators</CardTitle>
                        <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats?.totalCreators}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payouts</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${stats?.pendingPayouts}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <h2 className="text-xl font-semibold">Top Performing Creators</h2>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {stats?.topCreators.map((creator: any) => (
                        <Card key={creator.id}>
                            <CardContent className="pt-6">
                                <div className="flex items-center gap-4 mb-4">
                                    <Avatar className="h-12 w-12">
                                        <AvatarImage src={creator.user.image} />
                                        <AvatarFallback>{creator.user.name?.[0]}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <div className="font-semibold">{creator.user.name}</div>
                                        <div className="text-sm text-muted-foreground">{creator.user.email}</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <div className="text-muted-foreground">Earnings</div>
                                        <div className="font-medium text-green-600">
                                            ${creator.earnings}
                                        </div>
                                    </div>
                                    <div>
                                        <div className="text-muted-foreground">Personas</div>
                                        <div className="font-medium">
                                            {creator._count.personas}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    );
}
