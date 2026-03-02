/**
 * Security utilities for Fresh Mart
 * Centralized security helpers for server-side validation,
 * rate limiting, and input sanitization.
 */

// ─── Simple In-Memory Rate Limiter ───────────────────────────────────

interface RateLimitEntry {
    count: number;
    resetAt: number;
}

const rateLimitStore = new Map<string, RateLimitEntry>();

/**
 * Simple in-memory rate limiter for server actions.
 * In production, use Redis or similar for distributed rate limiting.
 *
 * @param key - Unique identifier (e.g., userId + actionName)
 * @param maxRequests - Maximum requests allowed in the window
 * @param windowMs - Time window in milliseconds
 * @returns true if the request is allowed, false if rate limited
 */
export function rateLimit(key: string, maxRequests: number = 10, windowMs: number = 60_000): boolean {
    const now = Date.now();
    const entry = rateLimitStore.get(key);

    if (!entry || now > entry.resetAt) {
        rateLimitStore.set(key, { count: 1, resetAt: now + windowMs });
        return true;
    }

    if (entry.count >= maxRequests) {
        return false;
    }

    entry.count++;
    return true;
}

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
    setInterval(() => {
        const now = Date.now();
        for (const [key, entry] of rateLimitStore.entries()) {
            if (now > entry.resetAt) {
                rateLimitStore.delete(key);
            }
        }
    }, 5 * 60_000);
}

// ─── Input Sanitization ──────────────────────────────────────────────

/**
 * Strip HTML tags from a string to prevent stored XSS.
 * Use for plain-text fields that should never contain HTML.
 */
export function stripHtml(input: string): string {
    return input.replace(/<[^>]*>/g, "").trim();
}

/**
 * Sanitize a string for safe storage - trims whitespace,
 * removes null bytes, and limits length.
 */
export function sanitizeString(input: string | null | undefined, maxLength: number = 500): string | null {
    if (!input) return null;
    return input
        .replace(/\0/g, "") // Remove null bytes
        .trim()
        .slice(0, maxLength) || null;
}

// ─── UUID Validation ─────────────────────────────────────────────────

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * Validate that a string is a valid UUID v4 format.
 * Prevents SQL injection via malformed IDs.
 */
export function isValidUUID(id: string): boolean {
    return UUID_REGEX.test(id);
}

// ─── Security Constants ──────────────────────────────────────────────

/** Maximum allowed order total to prevent absurd values */
export const MAX_ORDER_TOTAL = 100_000;

/** Maximum items per order */
export const MAX_ORDER_ITEMS = 50;

/** Maximum quantity per item */
export const MAX_ITEM_QUANTITY = 20;
