'use client';

import { useState, useEffect } from 'react';
import { Shield, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Report {
    id: string;
    reason: string;
    details: string;
    status: string;
    createdAt: string;
    reporter: {
        name: string;
        email: string;
    };
    reportedUser?: {
        name: string;
        email: string;
    };
    message?: {
        content: string;
        sender: string;
    };
}

interface Stats {
    total: number;
    pending: number;
    underReview: number;
    approved: number;
    rejected: number;
}

export default function ModerationQueuePage() {
    const [reports, setReports] = useState<Report[]>([]);
    const [stats, setStats] = useState<Stats | null>(null);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('PENDING');

    useEffect(() => {
        fetchReports();
        fetchStats();
    }, []);

    const fetchReports = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/reports/pending`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                },
            );
            const data = await response.json();
            setReports(data);
        } catch (error) {
            console.error('Failed to fetch reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/reports/stats`,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                },
            );
            const data = await response.json();
            setStats(data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleApprove = async (reportId: string, action: string) => {
        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/approve`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                    body: JSON.stringify({ action }),
                },
            );

            // Refresh reports
            fetchReports();
            fetchStats();
        } catch (error) {
            console.error('Failed to approve report:', error);
            alert('Failed to approve report');
        }
    };

    const handleReject = async (reportId: string) => {
        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/reports/${reportId}/reject`,
                {
                    method: 'PATCH',
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                    },
                },
            );

            // Refresh reports
            fetchReports();
            fetchStats();
        } catch (error) {
            console.error('Failed to reject report:', error);
            alert('Failed to reject report');
        }
    };

    const getReasonIcon = (reason: string) => {
        switch (reason) {
            case 'HARASSMENT':
                return '⚠️';
            case 'SPAM':
                return '📧';
            case 'INAPPROPRIATE':
                return '🔞';
            case 'ILLEGAL':
                return '🚨';
            default:
                return '❓';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-violet-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading reports...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                        <Shield className="w-10 h-10 text-violet-600" />
                        Moderation Queue
                    </h1>
                    <p className="text-gray-600">Review and moderate reported content</p>
                </div>

                {/* Stats */}
                {stats && (
                    <div className="grid grid-cols-5 gap-4 mb-8">
                        <div className="bg-white rounded-xl p-6 shadow-sm">
                            <p className="text-gray-600 text-sm mb-1">Total Reports</p>
                            <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
                        </div>

                        <div className="bg-yellow-50 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <Clock className="w-4 h-4 text-yellow-600" />
                                <p className="text-yellow-700 text-sm">Pending</p>
                            </div>
                            <p className="text-3xl font-bold text-yellow-900">
                                {stats.pending}
                            </p>
                        </div>

                        <div className="bg-blue-50 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <AlertCircle className="w-4 h-4 text-blue-600" />
                                <p className="text-blue-700 text-sm">Under Review</p>
                            </div>
                            <p className="text-3xl font-bold text-blue-900">
                                {stats.underReview}
                            </p>
                        </div>

                        <div className="bg-green-50 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <p className="text-green-700 text-sm">Approved</p>
                            </div>
                            <p className="text-3xl font-bold text-green-900">
                                {stats.approved}
                            </p>
                        </div>

                        <div className="bg-red-50 rounded-xl p-6 shadow-sm">
                            <div className="flex items-center gap-2 mb-1">
                                <XCircle className="w-4 h-4 text-red-600" />
                                <p className="text-red-700 text-sm">Rejected</p>
                            </div>
                            <p className="text-3xl font-bold text-red-900">
                                {stats.rejected}
                            </p>
                        </div>
                    </div>
                )}

                {/* Reports List */}
                {reports.length === 0 ? (
                    <div className="bg-white rounded-xl p-12 text-center shadow-sm">
                        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            All Clear!
                        </h3>
                        <p className="text-gray-600">No pending reports to review</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reports.map((report) => (
                            <div
                                key={report.id}
                                className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
                            >
                                <div className="flex items-start justify-between gap-6">
                                    {/* Report Info */}
                                    <div className="flex-1">
                                        {/* Header */}
                                        <div className="flex items-center gap-3 mb-4">
                                            <span className="text-3xl">{getReasonIcon(report.reason)}</span>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {report.reason.replace('_', ' ')}
                                                </h3>
                                                <p className="text-sm text-gray-500">
                                                    Reported by {report.reporter.name} •{' '}
                                                    {new Date(report.createdAt).toLocaleString()}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Message */}
                                        {report.message && (
                                            <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                                <p className="text-sm text-gray-600 mb-2">
                                                    Reported Message:
                                                </p>
                                                <p className="text-gray-900">{report.message.content}</p>
                                                <p className="text-sm text-gray-500 mt-2">
                                                    From: {report.message.sender}
                                                </p>
                                            </div>
                                        )}

                                        {/* Details */}
                                        {report.details && (
                                            <div className="mb-4">
                                                <p className="text-sm text-gray-600 mb-1">
                                                    Reporter Details:
                                                </p>
                                                <p className="text-gray-700">{report.details}</p>
                                            </div>
                                        )}

                                        {/* Reported User */}
                                        {report.reportedUser && (
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <span>Reported User:</span>
                                                <span className="font-medium text-gray-900">
                                                    {report.reportedUser.name} ({report.reportedUser.email})
                                                </span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-2 min-w-[200px]">
                                        <button
                                            onClick={() => handleApprove(report.id, 'BAN_USER')}
                                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                                        >
                                            Ban User
                                        </button>

                                        <button
                                            onClick={() => handleApprove(report.id, 'DELETE_MESSAGE')}
                                            className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                                        >
                                            Delete Message
                                        </button>

                                        <button
                                            onClick={() => handleApprove(report.id, 'WARNING')}
                                            className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700 transition-colors text-sm font-medium"
                                        >
                                            Issue Warning
                                        </button>

                                        <button
                                            onClick={() => handleReject(report.id)}
                                            className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors text-sm font-medium"
                                        >
                                            Reject Report
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
