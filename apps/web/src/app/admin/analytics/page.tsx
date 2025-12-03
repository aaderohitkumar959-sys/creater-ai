"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Mock data for development - will be replaced with real API data
const ACTIVITY_DATA = [
    { name: 'Mon', signups: 40, messages: 240 },
    { name: 'Tue', signups: 30, messages: 139 },
    { name: 'Wed', signups: 20, messages: 980 },
    { name: 'Thu', signups: 27, messages: 390 },
    { name: 'Fri', signups: 18, messages: 480 },
    { name: 'Sat', signups: 23, messages: 380 },
    { name: 'Sun', signups: 34, messages: 430 },
];

export default function AnalyticsPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-bold">Platform Analytics</h1>

            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>User Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={ACTIVITY_DATA}>
                                    <CartesianGrid strokeDasharray="3 3" />
                                    <XAxis dataKey="name" />
                                    <YAxis />
                                    <Tooltip />
                                    <Bar dataKey="messages" fill="#8884d8" name="Messages" />
                                    <Bar dataKey="signups" fill="#82ca9d" name="Signups" />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Popular Personas</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="h-10 w-10 rounded-full bg-slate-200 dark:bg-slate-800" />
                                        <div>
                                            <div className="font-medium">Persona {i}</div>
                                            <div className="text-sm text-muted-foreground">Creator {i}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold">1.2k</div>
                                        <div className="text-xs text-muted-foreground">msgs</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
