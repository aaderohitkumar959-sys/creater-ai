"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { DollarSign, MessageSquare, Users, Coins } from "lucide-react"

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
        // Mock data - replace with actual API calls when backend proxy is configured
        async function loadMockData() {
            try {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 500))

                const mockData: DashboardData = {
                    overview: {
                        totalEarnings: 1234.56,
                        totalMessages: 5678,
                        activePersonas: 3,
                        coinBalance: 2500
                    },
                    earnings: [
                        { date: '2024-01-01', earnings: 100 },
                        { date: '2024-01-08', earnings: 150 },
                        { date: '2024-01-15', earnings: 200 },
                        { date: '2024-01-22', earnings: 180 },
                        { date: '2024-01-29', earnings: 250 },
                    ],
                    personas: [
                        { id: '1', name: 'AI Assistant Pro', messages: 1234, uniqueUsers: 567 },
                        { id: '2', name: 'Creative Helper', messages: 890, uniqueUsers: 234 },
                        { id: '3', name: 'Code Mentor', messages: 456, uniqueUsers: 123 },
                    ]
                }

                setData(mockData)
            } catch (error) {
                console.error('Failed to load data:', error)
            } finally {
                setLoading(false)
            }
        }

        loadMockData()
    }, [])

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
