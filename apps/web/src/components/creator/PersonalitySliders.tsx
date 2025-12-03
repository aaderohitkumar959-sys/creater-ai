"use client";

import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PersonalityTraits {
    friendliness: number;
    humor: number;
    empathy: number;
    profanity: number;
    verbosity: number;
    emoji: number;
}

interface PersonalitySlidersProps {
    personality: PersonalityTraits;
    onChange: (personality: PersonalityTraits) => void;
}

export function PersonalitySliders({ personality, onChange }: PersonalitySlidersProps) {
    const updateTrait = (trait: keyof PersonalityTraits, value: number) => {
        onChange({ ...personality, [trait]: value });
    };

    const applyPreset = (preset: 'friendly' | 'professional' | 'casual') => {
        const presets: Record<string, PersonalityTraits> = {
            friendly: {
                friendliness: 90,
                humor: 70,
                empathy: 85,
                profanity: 0,
                verbosity: 60,
                emoji: 75,
            },
            professional: {
                friendliness: 60,
                humor: 30,
                empathy: 50,
                profanity: 0,
                verbosity: 70,
                emoji: 10,
            },
            casual: {
                friendliness: 75,
                humor: 80,
                empathy: 60,
                profanity: 20,
                verbosity: 40,
                emoji: 90,
            },
        };
        onChange(presets[preset]);
    };

    const traits: Array<{
        key: keyof PersonalityTraits;
        label: string;
        description: string;
        lowLabel: string;
        highLabel: string;
    }> = [
            {
                key: 'friendliness',
                label: 'Friendliness',
                description: 'How warm and welcoming the AI is',
                lowLabel: 'Reserved',
                highLabel: 'Very Warm',
            },
            {
                key: 'humor',
                label: 'Humor',
                description: 'Use of jokes and playful language',
                lowLabel: 'Serious',
                highLabel: 'Funny',
            },
            {
                key: 'empathy',
                label: 'Empathy',
                description: 'Emotional understanding and support',
                lowLabel: 'Logical',
                highLabel: 'Compassionate',
            },
            {
                key: 'profanity',
                label: 'Profanity',
                description: 'Use of informal or mild swear words',
                lowLabel: 'Clean',
                highLabel: 'Casual',
            },
            {
                key: 'verbosity',
                label: 'Verbosity',
                description: 'Length and detail of responses',
                lowLabel: 'Brief',
                highLabel: 'Detailed',
            },
            {
                key: 'emoji',
                label: 'Emoji Usage',
                description: 'Frequency of emojis in responses',
                lowLabel: 'None',
                highLabel: 'Lots 🎉',
            },
        ];

    return (
        <Card>
            <CardHeader>
                <CardTitle>Personality Settings</CardTitle>
                <CardDescription>
                    Customize how your AI persona communicates
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Presets */}
                <div className="flex gap-2 flex-wrap">
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset('friendly')}
                    >
                        😊 Friendly
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset('professional')}
                    >
                        💼 Professional
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => applyPreset('casual')}
                    >
                        ✌️ Casual
                    </Button>
                </div>

                {/* Sliders */}
                <div className="space-y-6">
                    {traits.map((trait) => (
                        <div key={trait.key} className="space-y-2">
                            <div className="flex justify-between items-center">
                                <div>
                                    <label className="text-sm font-medium">
                                        {trait.label}
                                    </label>
                                    <p className="text-xs text-muted-foreground">
                                        {trait.description}
                                    </p>
                                </div>
                                <span className="text-sm font-semibold text-primary">
                                    {personality[trait.key]}
                                </span>
                            </div>
                            <div className="space-y-1">
                                <Slider
                                    value={[personality[trait.key]]}
                                    onValueChange={(vals) => updateTrait(trait.key, vals[0])}
                                    min={0}
                                    max={100}
                                    step={5}
                                    className="w-full"
                                />
                                <div className="flex justify-between text-xs text-muted-foreground">
                                    <span>{trait.lowLabel}</span>
                                    <span>{trait.highLabel}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
