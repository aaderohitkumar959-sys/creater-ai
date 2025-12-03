"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle, Clock } from "lucide-react";

// Mock data for development
const MOCK_REPORTS = [
    {
        id: "1",
        type: "MESSAGE",
        reason: "Hate Speech",
        content: "I hate everyone...",
        reporter: "user1",
        reported: "user2",
        status: "PENDING",
        createdAt: "2025-11-26T10:00:00Z"
    },
    {
        id: "2",
        type: "USER",
        reason: "Harassment",
        content: "Stop bothering me",
        reporter: "user3",
        reported: "user4",
        status: "RESOLVED",
        createdAt: "2025-11-25T14:30:00Z"
    }
];

export default function ModerationDashboard() {
    const [reports, setReports] = useState(MOCK_REPORTS);

    const handleAction = (id: string, action: 'approve' | 'dismiss') => {
        // TODO: Implement API call
        setReports(reports.map(r =>
            r.id === id ? { ...r, status: action === 'approve' ? 'RESOLVED' : 'DISMISSED' } : r
        ));
    };

    return (
        <div className="p-8 space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Moderation Dashboard</h1>
                <div className="flex gap-2">
                    <Badge variant="outline" className="text-yellow-600 border-yellow-600">
                        <Clock className="w-3 h-3 mr-1" />
                        {reports.filter(r => r.status === 'PENDING').length} Pending
                    </Badge>
                </div>
            </div>

            <Tabs defaultValue="reports">
                <TabsList>
                    <TabsTrigger value="reports">Reports Queue</TabsTrigger>
                    <TabsTrigger value="violations">Violations</TabsTrigger>
                    <TabsTrigger value="bans">Bans & Appeals</TabsTrigger>
                </TabsList>

                <TabsContent value="reports" className="space-y-4">
                    {reports.map((report) => (
                        <Card key={report.id}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">
                                    {report.type} Report • {report.reason}
                                </CardTitle>
                                <Badge variant={report.status === 'PENDING' ? 'secondary' : 'outline'}>
                                    {report.status}
                                </Badge>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-4">
                                    <div className="text-sm text-muted-foreground">
                                        Reported by {report.reporter} • {new Date(report.createdAt).toLocaleDateString()}
                                    </div>
                                    <div className="p-4 bg-muted rounded-md text-sm">
                                        "{report.content}"
                                    </div>
                                    {report.status === 'PENDING' && (
                                        <div className="flex gap-2 justify-end">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAction(report.id, 'dismiss')}
                                            >
                                                <XCircle className="w-4 h-4 mr-2" />
                                                Dismiss
                                            </Button>
                                            <Button
                                                variant="destructive"
                                                size="sm"
                                                onClick={() => handleAction(report.id, 'approve')}
                                            >
                                                <CheckCircle className="w-4 h-4 mr-2" />
                                                Take Action
                                            </Button>
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </TabsContent>

                <TabsContent value="violations">
                    <div className="text-center text-muted-foreground py-8">
                        Violation history will appear here
                    </div>
                </TabsContent>

                <TabsContent value="bans">
                    <div className="text-center text-muted-foreground py-8">
                        Ban management and appeals will appear here
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
}
