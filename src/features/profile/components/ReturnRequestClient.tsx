"use client";

import { useState } from "react";
import { UserOrder } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ImagePlus, Loader2, Sparkles, AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { createReturnRequestAction } from "@/features/profile/actions/createReturnRequest";
import { useRouter } from "next/navigation";

interface ReturnRequestClientProps {
    order: UserOrder;
    defaultType: string;
}

export function ReturnRequestClient({ order, defaultType }: ReturnRequestClientProps) {
    const router = useRouter();
    const [type, setType] = useState<"return" | "replace">(
        defaultType === "replace" ? "replace" : "return"
    );
    const [reason, setReason] = useState("");
    const [imageFileName, setImageFileName] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [successState, setSuccessState] = useState<{
        status: string;
        message: string;
    } | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setImageFileName(e.target.files[0].name);
        }
    };

    const processAgenticAI = (text: string, hasImage: boolean) => {
        const lower = text.toLowerCase();
        const criticalKeywords = ["broken", "damaged", "expired", "spoiled", "rotten", "wrong item", "missing", "leaking", "stale"];

        const hasCriticalIssue = criticalKeywords.some((kw) => lower.includes(kw));

        if (hasCriticalIssue && hasImage) {
            return {
                status: "approved",
                adminNotes: `AI Auto-Approved: Detected critical issue keywords in customer description and validated presence of evidence image.`,
                userMessage: "Our AI assistant analyzed your request. Because the item arrived damaged/incorrect and you provided a photo, your request has been automatically approved!",
            };
        } else if (hasCriticalIssue && !hasImage) {
            return {
                status: "manual_review",
                adminNotes: `AI Flagged: Customer mentioned a critical issue but failed to provide an evidence photo. Requires manual admin validation.`,
                userMessage: "Our AI assistant noted your issue, but since no photo was provided, it has been sent to our team for a quick manual review.",
            };
        } else {
            return {
                status: "manual_review",
                adminNotes: `AI Flagged: Reason seems related to preference/change of mind ("${text.slice(0, 50)}..."). Passed to human admin for review.`,
                userMessage: "Your request has been received! Our support team will manually review your case and get back to you shortly.",
            };
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!reason || reason.trim().length < 10) {
            toast.error("Please provide a more detailed reason for the return/replacement.");
            return;
        }

        setIsProcessing(true);

        // 1. Run local Agentic AI analysis
        await new Promise((resolve) => setTimeout(resolve, 1500)); // Simulate thinking time
        const aiDecision = processAgenticAI(reason, !!imageFileName);

        // 2. Mock image url
        const mockImageUrl = imageFileName ? `https://example.com/mock-upload/${imageFileName}` : undefined;

        // 3. Submit to server
        try {
            const formData = new FormData();
            formData.append("orderId", order.id);
            formData.append("type", type);
            formData.append("reason", reason);
            formData.append("status", aiDecision.status);
            formData.append("adminNotes", aiDecision.adminNotes);
            if (mockImageUrl) formData.append("imageUrl", mockImageUrl);

            const result = await createReturnRequestAction(formData);

            if (result.error) {
                toast.error(result.error);
                setIsProcessing(false);
            } else {
                setSuccessState({
                    status: aiDecision.status,
                    message: aiDecision.userMessage
                });
                toast.success("Request submitted successfully!");
            }
        } catch (error) {
            toast.error("Failed to process request.");
            setIsProcessing(false);
        }
    };

    if (successState) {
        return (
            <div className="bg-card border border-border rounded-2xl p-8 md:p-12 text-center shadow-lg max-w-xl mx-auto mt-10">
                <div className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center bg-green-100 text-green-600">
                    {successState.status === "approved" ? (
                        <CheckCircle2 className="w-10 h-10" />
                    ) : (
                        <AlertCircle className="w-10 h-10 text-amber-500" />
                    )}
                </div>
                <h2 className="text-2xl font-heading font-bold mb-4">
                    {successState.status === "approved" ? "Request Auto-Approved!" : "Request Under Review"}
                </h2>
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 mb-8 relative overflow-hidden text-left">
                    <div className="absolute -right-4 -top-4 opacity-10">
                        <Sparkles className="w-32 h-32" />
                    </div>
                    <div className="flex items-start gap-3">
                        <Sparkles className="w-5 h-5 text-primary mt-1 flex-shrink-0" />
                        <div>
                            <p className="font-semibold text-primary mb-1">AI Assistant Note</p>
                            <p className="text-sm text-foreground leading-relaxed">
                                {successState.message}
                            </p>
                        </div>
                    </div>
                </div>
                <Button asChild className="rounded-full px-8">
                    <Link href="/profile?tab=orders">Back to Orders</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <Button asChild variant="ghost" className="mb-6 -ml-4 hover:bg-transparent hover:text-primary">
                <Link href="/profile?tab=orders">
                    <ChevronLeft className="w-4 h-4 mr-1" /> Back to Orders
                </Link>
            </Button>

            <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-6 border-b border-border bg-secondary/30">
                    <h1 className="text-2xl font-heading font-bold">Initiate Return / Replace</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                        Order #{order.id.slice(0, 8).toUpperCase()} • {order.items.length} items
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-8">
                    {/* Action Type */}
                    <div className="space-y-4">
                        <label className="text-sm font-semibold text-foreground">Action Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${type === "return" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="return"
                                    className="sr-only"
                                    checked={type === "return"}
                                    onChange={() => setType("return")}
                                />
                                <span className={`font-bold ${type === "return" ? "text-primary" : "text-muted-foreground"}`}>Refund to Wallet</span>
                                <span className="text-xs text-muted-foreground mt-1 text-center">Get money back</span>
                            </label>
                            <label className={`cursor-pointer flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${type === "replace" ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                                <input
                                    type="radio"
                                    name="type"
                                    value="replace"
                                    className="sr-only"
                                    checked={type === "replace"}
                                    onChange={() => setType("replace")}
                                />
                                <span className={`font-bold ${type === "replace" ? "text-primary" : "text-muted-foreground"}`}>Replace Items</span>
                                <span className="text-xs text-muted-foreground mt-1 text-center">Get identical new items</span>
                            </label>
                        </div>
                    </div>

                    {/* Reason */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground flex items-center justify-between">
                            Reason for Request
                            <span className="text-xs font-normal text-muted-foreground flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Auto-analyzed by AI
                            </span>
                        </label>
                        <Textarea
                            required
                            placeholder="Please describe why you are requesting a return/replacement..."
                            className="min-h-[120px] resize-none focus-visible:ring-primary/20"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>

                    {/* Image Upload */}
                    <div className="space-y-3">
                        <label className="text-sm font-semibold text-foreground">
                            Upload Photo Evidence <span className="text-muted-foreground font-normal">(Required for Auto-Approval)</span>
                        </label>
                        <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-border rounded-xl cursor-pointer hover:bg-secondary/20 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {imageFileName ? (
                                    <>
                                        <CheckCircle2 className="w-8 h-8 text-green-500 mb-2" />
                                        <p className="text-sm font-medium text-foreground">{imageFileName}</p>
                                        <p className="text-xs text-muted-foreground mt-1">Click to replace image</p>
                                    </>
                                ) : (
                                    <>
                                        <ImagePlus className="w-8 h-8 text-muted-foreground mb-3 group-hover:text-primary transition-colors" />
                                        <p className="mb-1 text-sm text-muted-foreground">
                                            <span className="font-semibold text-primary">Click to upload</span> or drag and drop
                                        </p>
                                        <p className="text-xs text-muted-foreground">PNG, JPG or GIF (MAX. 5MB)</p>
                                    </>
                                )}
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                        </label>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full rounded-full font-bold text-base h-12"
                        disabled={isProcessing}
                    >
                        {isProcessing ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                AI is analyzing your request...
                            </>
                        ) : (
                            "Process Request"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    );
}
