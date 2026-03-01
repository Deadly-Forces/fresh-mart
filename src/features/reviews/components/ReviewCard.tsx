import { Star, CheckCircle } from "lucide-react";

interface ReviewCardProps {
    reviewerName: string;
    rating: number;
    date: string;
    comment: string;
    isVerified?: boolean;
}

export function ReviewCard({
    reviewerName,
    rating,
    date,
    comment,
    isVerified = true,
}: ReviewCardProps) {
    return (
        <div className="py-5 border-b border-border last:border-0">
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                    <span className="font-bold text-foreground font-body">{reviewerName}</span>
                    {isVerified && (
                        <span className="flex items-center gap-1 text-[10px] text-success tracking-wide uppercase font-bold bg-success/10 px-1.5 py-0.5 rounded-full">
                            <CheckCircle className="w-3 h-3" />
                            Verified Buyer
                        </span>
                    )}
                </div>
                <span className="text-xs text-muted-foreground">{date}</span>
            </div>

            <div className="flex items-center gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                        key={i}
                        className={`w-3.5 h-3.5 ${i < rating ? "fill-warning text-warning" : "fill-muted text-muted"
                            }`}
                    />
                ))}
            </div>

            <p className="text-sm text-foreground/80 leading-relaxed font-body">
                {comment}
            </p>
        </div>
    );
}
