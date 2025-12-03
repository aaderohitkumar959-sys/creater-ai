"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "react-hot-toast";

interface ReportModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetType: "MESSAGE" | "USER" | "PERSONA";
    targetId: string;
}

export function ReportModal({ isOpen, onClose, targetType, targetId }: ReportModalProps) {
    const [category, setCategory] = useState<string>("");
    const [reason, setReason] = useState<string>("");
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async () => {
        if (!category) {
            toast.error("Please select a category");
            return;
        }

        setIsSubmitting(true);
        try {
            // TODO: Replace with actual API call
            // await api.reportContent({ targetType, targetId, category, reason });

            // Mock API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            toast.success("Report submitted successfully");
            onClose();
            setCategory("");
            setReason("");
        } catch (error) {
            toast.error("Failed to submit report");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Report {targetType.toLowerCase()}</DialogTitle>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Reason</label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a reason" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="HATE_SPEECH">Hate Speech</SelectItem>
                                <SelectItem value="HARASSMENT">Harassment</SelectItem>
                                <SelectItem value="SEXUAL_CONTENT">Sexual Content</SelectItem>
                                <SelectItem value="VIOLENCE">Violence</SelectItem>
                                <SelectItem value="SPAM">Spam</SelectItem>
                                <SelectItem value="OTHER">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Details (Optional)</label>
                        <Textarea
                            placeholder="Please provide more details..."
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            rows={3}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
                        Cancel
                    </Button>
                    <Button onClick={handleSubmit} disabled={isSubmitting}>
                        {isSubmitting ? "Submitting..." : "Submit Report"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
