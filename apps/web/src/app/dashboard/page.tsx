"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { DollarSign, MessageSquare, Users, Coins } from "lucide-react"
import { api } from "@/lib/api"


interface DashboardData {
    overview: {
        totalEarnings: number
        totalMessages: number
        activePersonas: number
        coinBalance: number
    }
    earnings: Array<{ date: string; earnings: number }>
    personas: Array<{
        id: string
        name: string
        messages: number
        uniqueUsers: number
    }>
}

export default function DashboardPage() {
    const [data, setData] = useState<DashboardData | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function loadData() {
            try {
                const dashboardData = await api.getCreatorDashboard();
                setData(dashboardData);
            } catch (error) {
                console.error('Failed to load dashboard data:', error);
            } finally {
                setLoading(false);
            }
        }

        loadData();
    }, []);

    if (loading) {
        return <div className="p-8">Loading...</div>
    }

    if (!data) {
        return <div className="p-8">Failed to load dashboard</div>
    }

    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold">Creator Dashboard</h1>

            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Total Earnings</CardTitle>
                        <DollarSign className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.totalEarnings} coins</div>
                        <p className="text-xs text-gray-500">≈ ${(data.overview.totalEarnings * 0.01).toFixed(2)}</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.totalMessages}</div>
                        <p className="text-xs text-gray-500">Total received</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Active Personas</CardTitle>
                        <Users className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.activePersonas}</div>
                        <p className="text-xs text-gray-500">AI characters</p>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-gray-500">Coin Balance</CardTitle>
                        <Coins className="h-4 w-4 text-gray-400" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{data.overview.coinBalance}</div>
                        <p className="text-xs text-gray-500">Available for withdrawal</p>
                    </CardContent>
                </Card>
            </div>

            {/* Earnings Chart */}
            <Card>
                <CardHeader>
                    <CardTitle>Earnings (Last 30 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={data.earnings}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="date" tickFormatter={(date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} />
                            <YAxis />
                            <Tooltip />
                            <Line type="monotone" dataKey="earnings" stroke="#8b5cf6" strokeWidth={2} />
                        </LineChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>

            {/* Persona Performance */}
            <Card>
                <CardHeader>
                    <CardTitle>Persona Performance</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {data.personas.map((persona) => (
                            <div key={persona.id} className="flex items-center justify-between p-4 border rounded-lg">
                                <div>
                                    <h3 className="font-semibold">{persona.name}</h3>
                                    <p className="text-sm text-gray-500">{persona.uniqueUsers} unique users</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-2xl font-bold">{persona.messages}</div>
                                    <p className="text-xs text-gray-500">messages</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
