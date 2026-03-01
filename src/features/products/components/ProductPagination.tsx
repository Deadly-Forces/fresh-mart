"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";

interface ProductPaginationProps {
    totalPages: number;
    currentPage: number;
}

export function ProductPagination({ totalPages, currentPage }: ProductPaginationProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();

    if (totalPages <= 1) return null;

    const createPageURL = (pageNumber: number | string) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", pageNumber.toString());
        return `${pathname}?${params.toString()}`;
    };

    // Calculate which page numbers to show
    const generatePagination = () => {
        if (totalPages <= 7) {
            return Array.from({ length: totalPages }, (_, i) => i + 1);
        }

        if (currentPage <= 3) {
            return [1, 2, 3, 4, '...', totalPages - 1, totalPages];
        }

        if (currentPage >= totalPages - 2) {
            return [1, 2, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
        }

        return [1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages];
    };

    const pages = generatePagination();

    return (
        <div className="flex items-center justify-center gap-1.5 mt-10">
            {currentPage > 1 && (
                <Link
                    href={createPageURL(currentPage - 1)}
                    className="w-10 h-10 rounded-button text-sm font-medium transition-colors flex items-center justify-center bg-card border border-border text-foreground hover:border-primary hover:text-primary"
                    aria-label="Previous page"
                >
                    <ChevronLeft className="w-4 h-4" />
                </Link>
            )}

            {pages.map((page, index) => {
                if (page === '...') {
                    return (
                        <div key={`ellipsis-${index}`} className="w-10 h-10 flex items-end justify-center pb-2 text-muted-foreground">
                            <MoreHorizontal className="w-4 h-4" />
                        </div>
                    );
                }

                const isCurrentPage = page === currentPage;
                return (
                    <Link
                        key={page}
                        href={createPageURL(page)}
                        className={`w-10 h-10 rounded-button flex items-center justify-center text-sm font-medium transition-colors ${isCurrentPage
                                ? "bg-primary text-primary-foreground shadow-glow"
                                : "bg-card border border-border text-foreground hover:border-primary hover:text-primary"
                            }`}
                        aria-current={isCurrentPage ? "page" : undefined}
                    >
                        {page}
                    </Link>
                );
            })}

            {currentPage < totalPages && (
                <Link
                    href={createPageURL(currentPage + 1)}
                    className="w-10 h-10 rounded-button text-sm font-medium transition-colors flex items-center justify-center bg-card border border-border text-foreground hover:border-primary hover:text-primary"
                    aria-label="Next page"
                >
                    <ChevronRight className="w-4 h-4" />
                </Link>
            )}
        </div>
    );
}
