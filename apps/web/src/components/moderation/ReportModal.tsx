'use client';

import { useState } from 'react';
import { AlertTriangle, X } from 'lucide-react';

interface ReportModalProps {
    messageId: string;
    messageContent: string;
    onClose: () => void;
}

const REPORT_REASONS = [
    { value: 'HARASSMENT', label: 'Harassment or Bullying', icon: '⚠️' },
    { value: 'SPAM', label: 'Spam or Advertising', icon: '📧' },
    { value: 'INAPPROPRIATE', label: 'Inappropriate Content', icon: '🔞' },
    { value: 'ILLEGAL', label: 'Illegal Activity', icon: '🚨' },
    { value: 'OTHER', label: 'Other', icon: '❓' },
];

export function ReportModal({ messageId, messageContent, onClose }: ReportModalProps) {
    const [selectedReason, setSelectedReason] = useState('');
    const [details, setDetails] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!selectedReason) {
            alert('Please select a reason');
            return;
        }

        setSubmitting(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/reports`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('accessToken')}`,
                },
                body: JSON.stringify({
                    messageId,
                    reason: selectedReason,
                    details,
                }),
            });

            if (response.ok) {
                setSubmitted(true);
                setTimeout(() => {
                    onClose();
                }, 2000);
            } else {
                alert('Failed to submit report. Please try again.');
            }
        } catch (error) {
            console.error('Failed to submit report:', error);
            alert('Failed to submit report. Please try again.');
        } finally {
            setSubmitting(false);
        }
    };

    if (submitted) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                <div className="bg-gray-900 rounded-2xl p-8 max-w-md w-full text-center">
                    <div className="mb-4 text-6xl">✅</div>
                    <h2 className="text-2xl font-bold text-white mb-2">Report Submitted</h2>
                    <p className="text-gray-300">
                        Thank you for reporting. Our moderation team will review this content.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-gray-900 rounded-2xl max-w-lg w-full overflow-hidden">
                {/* Header */}
                <div className="bg-red-600 p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="w-6 h-6 text-white" />
                            <h2 className="text-xl font-bold text-white">Report Content</h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-white/80 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Message Preview */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Reported Message:
                        </label>
                        <div className="bg-gray-800 rounded-lg p-4">
                            <p className="text-gray-300 text-sm line-clamp-3">
                                {messageContent}
                            </p>
                        </div>
                    </div>

                    {/* Reason Selection */}
                    <div>
                        <label className="text-sm text-gray-400 mb-3 block">
                            Why are you reporting this?
                        </label>
                        <div className="space-y-2">
                            {REPORT_REASONS.map((reason) => (
                                <button
                                    key={reason.value}
                                    type="button"
                                    onClick={() => setSelectedReason(reason.value)}
                                    className={`w-full flex items-center gap-3 p-4 rounded-lg border-2 transition-colors ${selectedReason === reason.value
                                            ? 'border-red-500 bg-red-500/10'
                                            : 'border-gray-700 bg-gray-800 hover:border-gray-600'
                                        }`}
                                >
                                    <span className="text-2xl">{reason.icon}</span>
                                    <span className="text-white font-medium">{reason.label}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Details */}
                    <div>
                        <label className="text-sm text-gray-400 mb-2 block">
                            Additional Details (Optional)
                        </label>
                        <textarea
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Provide any additional context..."
                            rows={3}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:border-red-500 focus:outline-none"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 bg-gray-800 text-white py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={!selectedReason || submitting}
                            className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${!selectedReason || submitting
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-red-600 text-white hover:bg-red-700'
                                }`}
                        >
                            {submitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
