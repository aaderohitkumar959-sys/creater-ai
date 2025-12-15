"use client";

import { useEffect, useState } from "react";
import { X, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const tutorialSteps = [
    {
        title: "Welcome to CreatorAI! ✨",
        description: "Chat with AI personalities that understand you. Each character has a unique personality!",
        highlight: "chat-area",
    },
    {
        title: "Explore Characters 🎭",
        description: "Browse different personalities in the Explore page. Find your favorite!",
        highlight: "explore-button",
    },
    {
        title: "Your Coins 💰",
        description: "You have free messages daily. Need more? Get coins here!",
        highlight: "coin-balance",
    },
];

export function WelcomeTutorial() {
    const [currentStep, setCurrentStep] = useState(0);
    const [show, setShow] = useState(false);

    useEffect(() => {
        // Only show if user hasn't seen tutorial before
        const hasSeenTutorial = localStorage.getItem("hasSeenTutorial");
        if (!hasSeenTutorial) {
            setTimeout(() => setShow(true), 1000); // Show after 1 second
        }
    }, []);

    const handleNext = () => {
        if (currentStep < tutorialSteps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            handleClose();
        }
    };

    const handleClose = () => {
        setShow(false);
        localStorage.setItem("hasSeenTutorial", "true");
    };

    if (!show) return null;

    const step = tutorialSteps[currentStep];

    return (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="bg-background border rounded-lg shadow-xl max-w-md w-full p-6 relative animate-in fade-in slide-in-from-bottom-4 duration-300">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2 mb-4">
                    <Sparkles className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-semibold">{step.title}</h3>
                </div>

                <p className="text-muted-foreground mb-6">{step.description}</p>

                <div className="flex items-center justify-between">
                    <div className="flex gap-1.5">
                        {tutorialSteps.map((_, index) => (
                            <div
                                key={index}
                                className={`h-1.5 rounded-full transition-all ${index === currentStep
                                        ? "w-8 bg-primary"
                                        : "w-1.5 bg-muted"
                                    }`}
                            />
                        ))}
                    </div>

                    <div className="flex gap-2">
                        {currentStep < tutorialSteps.length - 1 ? (
                            <>
                                <Button variant="ghost" size="sm" onClick={handleClose}>
                                    Skip
                                </Button>
                                <Button size="sm" onClick={handleNext}>
                                    Next
                                </Button>
                            </>
                        ) : (
                            <Button size="sm" onClick={handleClose}>
                                Got it!
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
