import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export interface Step {
    id: string;
    label: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStepIndex: number;
    className?: string;
}

export function StepIndicator({ steps, currentStepIndex, className }: StepIndicatorProps) {
    return (
        <div className={cn("flex items-center justify-between w-full relative", className)}>
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-[2px] bg-border z-0" />

            {steps.map((step, index) => {
                const isCompleted = index < currentStepIndex;
                const isCurrent = index === currentStepIndex;
                const isUpcoming = index > currentStepIndex;

                return (
                    <div key={step.id} className="relative z-10 flex flex-col items-center gap-2">
                        <div
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm transition-colors border-2 bg-background",
                                {
                                    "bg-success border-success text-primary-foreground": isCompleted,
                                    "border-primary text-primary": isCurrent,
                                    "border-border text-muted-foreground": isUpcoming,
                                }
                            )}
                        >
                            {isCompleted ? <Check className="w-5 h-5 text-primary-foreground" /> : index + 1}
                        </div>
                        <span
                            className={cn("text-xs font-medium bg-background px-1", {
                                "text-success": isCompleted,
                                "text-primary": isCurrent,
                                "text-muted-foreground": isUpcoming,
                            })}
                        >
                            {step.label}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}
