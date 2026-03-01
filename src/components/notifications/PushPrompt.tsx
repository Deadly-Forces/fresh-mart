"use client";

import { useState, useEffect } from "react";
import { BellRing, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function PushPrompt() {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // In reality, check if Notification API is supported and permission is 'default'
        // For demonstration, we show it after a short delay
        const timer = setTimeout(() => {
            setIsVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, []);

    const handleEnable = async () => {
        // [TODO] Implement standard Web Push API / Service Worker registration
        // const permission = await Notification.requestPermission();
        // if (permission === 'granted') { ... save token to user profile ... }

        console.log("[Push Service] User granted permission. Saving token...");
        setIsVisible(false);
    };

    if (!isVisible) return null;

    return (
        <div className="fixed bottom-20 left-4 right-4 md:bottom-6 md:left-auto md:right-6 md:w-96 bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl z-50 flex items-start gap-4 animate-in slide-in-from-bottom-5">
            <div className="bg-white/20 p-2 rounded-full mt-1 shrink-0">
                <BellRing className="w-5 h-5" />
            </div>
            <div className="flex-1">
                <h3 className="font-bold text-sm mb-1">Enable Order Updates</h3>
                <p className="text-xs text-primary-foreground/80 mb-3 leading-relaxed">
                    Get real-time push notifications when your order is out for delivery.
                </p>
                <div className="flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="text-xs h-8 px-4"
                        onClick={handleEnable}
                    >
                        Enable
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="text-xs h-8 px-3 hover:bg-black/10"
                        onClick={() => setIsVisible(false)}
                    >
                        Not Now
                    </Button>
                </div>
            </div>
            <button
                onClick={() => setIsVisible(false)}
                className="text-primary-foreground/60 hover:text-white transition-colors"
                aria-label="Dismiss"
            >
                <X className="w-4 h-4" />
            </button>
        </div>
    );
}
