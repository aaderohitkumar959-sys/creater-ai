"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useRouter } from "next/navigation"
import { PersonalitySliders } from "./PersonalitySliders"
import { SampleChatUpload } from "./SampleChatUpload"
import { SocialLinkInput } from "./SocialLinkInput"
import { ArrowLeft, ArrowRight, Check } from "lucide-react"
import { toast } from "react-hot-toast"

interface PersonalityTraits {
    friendliness: number;
    humor: number;
    empathy: number;
    profanity: number;
    verbosity: number;
    emoji: number;
}

export default function CreatorOnboardingWizard() {
    const [step, setStep] = useState(1)
    const [formData, setFormData] = useState({
        bio: "",
        personaName: "",
        personaDescription: "",
        avatarUrl: "",
        personality: {
            friendliness: 70,
            humor: 60,
            empathy: 70,
            profanity: 0,
            verbosity: 50,
            emoji: 50,
        } as PersonalityTraits,
        trainingSamples: [] as string[],
        socialContent: null as any,
    })
    const router = useRouter()

    const totalSteps = 5
    const progress = (step / totalSteps) * 100

    const handleNext = () => {
        // Validation
        if (step === 1 && !formData.bio.trim()) {
            toast.error("Please enter your bio");
            return;
        }
        if (step === 2 && (!formData.personaName.trim() || !formData.personaDescription.trim())) {
            toast.error("Please fill in persona details");
            return;
        }
        if (step === 4 && formData.trainingSamples.length < 3) {
            toast.error("Please add at least 3 training samples");
            return;
        }

        setStep(step + 1)
    }

    const handleBack = () => setStep(step - 1)

    const handleSubmit = async () => {
        try {
            // Step 1: Create creator profile
            toast.loading("Creating your creator profile...");

            const profileRes = await fetch('/api/creator/profile', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ bio: formData.bio }),
            });

            if (!profileRes.ok) throw new Error('Failed to create profile');

            // Step 2: Create persona
            const personaRes = await fetch('/api/creator/persona', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: formData.personaName,
                    description: formData.personaDescription,
                    avatarUrl: formData.avatarUrl || undefined,
                    personality: formData.personality,
                }),
            });

            if (!personaRes.ok) throw new Error('Failed to create persona');
            const persona = await personaRes.json();

            // Step 3: Add training data
            for (const sample of formData.trainingSamples) {
                await fetch('/api/creator/training-data', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        personaId: persona.id,
                        content: sample,
                    }),
                });
            }

            toast.dismiss();
            toast.success('🎉 Creator profile created successfully!');
            router.push("/dashboard");
        } catch (error: any) {
            toast.dismiss();
            toast.error(error.message || "Failed to create creator profile");
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-6">
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold mb-2">Become a Creator</h1>
                <p className="text-muted-foreground">
                    Create your AI persona in 5 simple steps
                </p>
                <div className="mt-4">
                    <Progress value={progress} className="h-2" />
                    <p className="text-sm text-muted-foreground mt-2">
                        Step {step} of {totalSteps}
                    </p>
                </div>
            </div>

            {/* Step 1: Basic Info */}
            {step === 1 && (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Your Profile</h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Tell us about yourself as a creator
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bio</label>
                            <Textarea
                                placeholder="I'm a content creator who specializes in..."
                                rows={4}
                                value={formData.bio}
                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                            />
                            <p className="text-xs text-muted-foreground">
                                A brief introduction about yourself (100-500 characters)
                            </p>
                        </div>
                        <div className="flex justify-end">
                            <Button onClick={handleNext}>
                                Next <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 2: Persona Details */}
            {step === 2 && (
                <Card>
                    <CardContent className="pt-6 space-y-4">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">AI Persona Details</h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Give your AI persona a name and description
                            </p>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Persona Name</label>
                            <Input
                                placeholder="e.g., Tech Guru, Fitness Coach"
                                value={formData.personaName}
                                onChange={(e) => setFormData({ ...formData, personaName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Description</label>
                            <Textarea
                                placeholder="What makes this AI persona unique?"
                                rows={3}
                                value={formData.personaDescription}
                                onChange={(e) => setFormData({ ...formData, personaDescription: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Avatar URL (Optional)</label>
                            <Input
                                placeholder="https://example.com/avatar.jpg"
                                value={formData.avatarUrl}
                                onChange={(e) => setFormData({ ...formData, avatarUrl: e.target.value })}
                            />
                        </div>
                        <div className="flex justify-between">
                            <Button variant="outline" onClick={handleBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <Button onClick={handleNext}>
                                Next <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Step 3: Personality */}
            {step === 3 && (
                <div className="space-y-4">
                    <PersonalitySliders
                        personality={formData.personality}
                        onChange={(personality) => setFormData({ ...formData, personality })}
                    />
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <Button onClick={handleNext}>
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 4: Training Data */}
            {step === 4 && (
                <div className="space-y-4">
                    <SampleChatUpload
                        samples={formData.trainingSamples}
                        onChange={(samples) => setFormData({ ...formData, trainingSamples: samples })}
                    />
                    <SocialLinkInput
                        onFetchComplete={(metadata) => {
                            // Add suggested samples from YouTube
                            if (metadata.suggestedSamples) {
                                setFormData({
                                    ...formData,
                                    trainingSamples: [...formData.trainingSamples, ...metadata.suggestedSamples],
                                    socialContent: metadata,
                                });
                                toast.success("Content imported successfully!");
                            }
                        }}
                    />
                    <div className="flex justify-between">
                        <Button variant="outline" onClick={handleBack}>
                            <ArrowLeft className="w-4 h-4 mr-2" /> Back
                        </Button>
                        <Button onClick={handleNext}>
                            Next <ArrowRight className="w-4 h-4 ml-2" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Step 5: Review & Publish */}
            {step === 5 && (
                <Card>
                    <CardContent className="pt-6 space-y-6">
                        <div>
                            <h2 className="text-2xl font-semibold mb-4">Review Your Persona</h2>
                            <p className="text-sm text-muted-foreground mb-4">
                                Make sure everything looks good before publishing
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-lg">
                                <h3 className="font-semibold mb-2">Persona: {formData.personaName}</h3>
                                <p className="text-sm text-muted-foreground">{formData.personaDescription}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-3 bg-muted/50 rounded">
                                    <div className="text-sm font-medium">Training Samples</div>
                                    <div className="text-2xl font-bold">{formData.trainingSamples.length}</div>
                                </div>
                                <div className="p-3 bg-muted/50 rounded">
                                    <div className="text-sm font-medium">Friendliness</div>
                                    <div className="text-2xl font-bold">{formData.personality.friendliness}%</div>
                                </div>
                            </div>
                        </div>

                        <div className="flex justify-between">
                            <Button variant="outline" onClick={handleBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" /> Back
                            </Button>
                            <Button onClick={handleSubmit} size="lg" className="bg-green-600 hover:bg-green-700">
                                <Check className="w-4 h-4 mr-2" /> Publish Persona
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
