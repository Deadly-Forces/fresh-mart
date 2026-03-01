"use client";

import { useState, useRef } from "react";
import { Camera, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createClient } from "@/lib/supabase/client";
import type { OnboardingState } from "@/types";

interface ProfileStepProps {
    state: OnboardingState;
    onUpdate: (updates: Partial<OnboardingState>) => void;
}

export function ProfileStep({ state, onUpdate }: ProfileStepProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);

    const handleAvatarClick = () => {
        fileInputRef.current?.click();
    };

    const readFileAsDataUrl = (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result as string);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        if (!file.type.startsWith("image/")) {
            setUploadError("Please select an image file.");
            return;
        }
        if (file.size > 2 * 1024 * 1024) {
            setUploadError("Image must be under 2MB.");
            return;
        }

        setUploadError(null);
        setUploading(true);

        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Not authenticated");

            const fileExt = file.name.split(".").pop();
            const filePath = `${user.id}/avatar.${fileExt}`;

            // Try Supabase Storage upload
            const { error: uploadErr } = await supabase.storage
                .from("avatars")
                .upload(filePath, file, { upsert: true });

            if (uploadErr) {
                console.warn("Storage upload failed, using local preview:", uploadErr.message);
                // Fallback: use local data URL
                const dataUrl = await readFileAsDataUrl(file);
                onUpdate({ avatarUrl: dataUrl });
                return;
            }

            // Get public URL
            const { data: { publicUrl } } = supabase.storage
                .from("avatars")
                .getPublicUrl(filePath);

            onUpdate({ avatarUrl: publicUrl });
        } catch (err: unknown) {
            const message = err instanceof Error ? err.message : "Unknown error";
            console.warn("Upload failed, using local preview:", message);
            // Fallback: use local data URL
            try {
                const dataUrl = await readFileAsDataUrl(file);
                onUpdate({ avatarUrl: dataUrl });
            } catch {
                setUploadError("Failed to load image. Please try again.");
            }
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="text-center">
                <h2 className="font-heading text-3xl mb-2">Let&apos;s get to know you</h2>
                <p className="text-muted-foreground font-body">Set up your profile to start exploring.</p>
            </div>

            <div className="flex justify-center mb-6">
                <div
                    className="relative w-24 h-24 rounded-full bg-secondary flex items-center justify-center group cursor-pointer border-2 border-dashed border-border hover:border-primary transition-colors"
                    onClick={handleAvatarClick}
                    role="button"
                    tabIndex={0}
                    aria-label="Upload avatar"
                    onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") handleAvatarClick(); }}
                >
                    {state.avatarUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={state.avatarUrl} alt="Avatar" className="w-full h-full rounded-full object-cover" />
                    ) : (
                        <Camera className="w-8 h-8 text-muted-foreground group-hover:text-primary transition-colors" />
                    )}
                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                        {uploading ? (
                            <Loader2 className="w-5 h-5 text-white animate-spin" />
                        ) : (
                            <span className="text-white text-xs font-semibold">Upload</span>
                        )}
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                        disabled={uploading}
                        title="Upload avatar"
                    />
                </div>
            </div>

            {uploadError && (
                <p className="text-center text-sm text-destructive">{uploadError}</p>
            )}

            <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                    id="name"
                    value={state.name}
                    onChange={(e) => onUpdate({ name: e.target.value })}
                    placeholder="e.g. John Doe"
                    className="h-12"
                />
            </div>
        </div>
    );
}
