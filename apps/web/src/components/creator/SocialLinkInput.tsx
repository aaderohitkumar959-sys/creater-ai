"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Youtube, Loader2, CheckCircle, AlertCircle } from "lucide-react";

interface YouTubeMetadata {
    platform: 'youtube';
    url: string;
    title: string;
    description: string;
    channelName: string;
    videoId: string;
    thumbnail: string;
    suggestedSamples?: string[];
}

interface SocialLinkInputProps {
    onFetchComplete: (metadata: YouTubeMetadata) => void;
}

export function SocialLinkInput({ onFetchComplete }: SocialLinkInputProps) {
    const [url, setUrl] = useState("");
    const [loading, setLoading] = useState(false);
    const [metadata, setMetadata] = useState<YouTubeMetadata | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [consent, setConsent] = useState(false);

    const handleFetch = async () => {
        if (!url.trim()) return;

        setLoading(true);
        setError(null);

        try {
            const response = await fetch('/api/creator/social/fetch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ url, platform: 'youtube' }),
            });

            if (!response.ok) {
                throw new Error('Failed to fetch metadata');
            }

            const data = await response.json();
            setMetadata(data);
        } catch (err: any) {
            setError(err.message || 'Failed to fetch video metadata');
        } finally {
            setLoading(false);
        }
    };

    const handleUseContent = () => {
        if (metadata && consent) {
            onFetchComplete(metadata);
            // Reset form
            setUrl("");
            setMetadata(null);
            setConsent(false);
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Youtube className="w-5 h-5 text-red-500" />
                    YouTube Content Import
                </CardTitle>
                <CardDescription>
                    Import content from your YouTube videos to train your AI
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* URL Input */}
                <div className="flex gap-2">
                    <Input
                        placeholder="https://youtube.com/watch?v=..."
                        value={url}
                        onChange={(e) => setUrl(e.target.value)}
                        disabled={loading}
                    />
                    <Button
                        onClick={handleFetch}
                        disabled={loading || !url.trim()}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Fetching...
                            </>
                        ) : (
                            'Fetch'
                        )}
                    </Button>
                </div>

                {/* Error */}
                {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-800 dark:text-red-200">
                        <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Metadata Preview */}
                {metadata && (
                    <div className="space-y-4">
                        <div className="flex gap-4 p-4 bg-muted rounded-lg">
                            <img
                                src={metadata.thumbnail}
                                alt={metadata.title}
                                className="w-32 h-20 object-cover rounded"
                            />
                            <div className="flex-1 min-w-0">
                                <h4 className="font-semibold truncate">{metadata.title}</h4>
                                <p className="text-sm text-muted-foreground">{metadata.channelName}</p>
                                <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                                    {metadata.description}
                                </p>
                            </div>
                        </div>

                        {/* Suggested Samples */}
                        {metadata.suggestedSamples && metadata.suggestedSamples.length > 0 && (
                            <div>
                                <label className="text-sm font-medium mb-2 block">
                                    Suggested Training Samples
                                </label>
                                <div className="space-y-2">
                                    {metadata.suggestedSamples.map((sample, idx) => (
                                        <div key={idx} className="text-sm p-2 bg-background border rounded">
                                            {sample}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Consent */}
                        <div className="flex items-start gap-2 p-4 bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                            <Checkbox
                                id="consent"
                                checked={consent}
                                onCheckedChange={(checked) => setConsent(checked as boolean)}
                            />
                            <label htmlFor="consent" className="text-sm cursor-pointer">
                                I confirm that I own this content or have permission to use it for training my AI persona.
                            </label>
                        </div>

                        <Button
                            onClick={handleUseContent}
                            disabled={!consent}
                            className="w-full"
                        >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Use This Content
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
