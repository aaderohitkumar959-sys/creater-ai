"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, FileText, Sparkles } from "lucide-react";

interface SampleChatUploadProps {
    samples: string[];
    onChange: (samples: string[]) => void;
}

export function SampleChatUpload({ samples, onChange }: SampleChatUploadProps) {
    const [textInput, setTextInput] = useState("");

    const handleAddSample = () => {
        if (textInput.trim()) {
            onChange([...samples, textInput.trim()]);
            setTextInput("");
        }
    };

    const handleGenerateQuick = () => {
        const quickSamples = [
            "Hey! How can I help you today? 😊",
            "That's a great question! Let me break it down for you...",
            "I totally get what you mean. Here's my take on it:",
            "Awesome! I'm excited to help with that.",
            "Thanks for asking! Here's what I think..."
        ];
        onChange([...samples, ...quickSamples]);
    };

    const handleRemoveSample = (index: number) => {
        onChange(samples.filter((_, i) => i !== index));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Sample Conversations</CardTitle>
                <CardDescription>
                    Add examples of how you want your AI to communicate
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Quick Generate */}
                <Button
                    type="button"
                    variant="outline"
                    onClick={handleGenerateQuick}
                    className="w-full"
                >
                    <Sparkles className="w-4 h-4 mr-2" />
                    Quick Generate (5 Sample Lines)
                </Button>

                {/* Text Input */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">
                        Add Custom Sample
                    </label>
                    <Textarea
                        placeholder="Type or paste a sample message that represents how your AI should communicate..."
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        rows={3}
                    />
                    <Button
                        type="button"
                        onClick={handleAddSample}
                        disabled={!textInput.trim()}
                        size="sm"
                    >
                        <FileText className="w-4 h-4 mr-2" />
                        Add Sample
                    </Button>
                </div>

                {/* Sample Preview */}
                {samples.length > 0 && (
                    <div className="space-y-2">
                        <label className="text-sm font-medium">
                            Current Samples ({samples.length})
                        </label>
                        <div className="space-y-2 max-h-60 overflow-y-auto">
                            {samples.map((sample, index) => (
                                <div
                                    key={index}
                                    className="flex items-start gap-2 p-3 bg-muted rounded-lg group"
                                >
                                    <div className="flex-1 text-sm">{sample}</div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => handleRemoveSample(index)}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        ×
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {samples.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground text-sm">
                        <Upload className="w-12 h-12 mx-auto mb-2 opacity-50" />
                        <p>No samples added yet</p>
                        <p className="text-xs">Add at least 3-5 samples for best results</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
