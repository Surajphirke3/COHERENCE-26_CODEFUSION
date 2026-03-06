// src/lib/utils.ts
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind CSS class names with clsx for conditional classes.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Format a Date object into a human-readable string.
 *
 * @param date - The date to format
 * @param format - Optional Intl.DateTimeFormat style: "short" | "medium" | "long"
 * @returns A locale-formatted date string
 */
export function formatDate(
  date: Date | string | number,
  format: "short" | "medium" | "long" = "medium"
): string {
  const d = new Date(date);

  const options: Record<string, Intl.DateTimeFormatOptions> = {
    short: { month: "short", day: "numeric" },
    medium: { month: "short", day: "numeric", year: "numeric" },
    long: {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    },
  };

  return d.toLocaleDateString("en-US", options[format]);
}

/**
 * Truncate a string to the given length with an ellipsis.
 *
 * @param str - The string to truncate
 * @param length - Maximum character count (default 50)
 * @returns The truncated string with "…" appended if needed
 */
export function truncate(str: string, length: number = 50): string {
  if (str.length <= length) return str;
  return str.slice(0, length).trimEnd() + "…";
}

/**
 * Convert a string into a URL-safe slug.
 *
 * @param str - The string to slugify
 * @returns A lowercase, hyphen-separated slug
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Return a Promise that resolves after the specified milliseconds.
 *
 * @param ms - Milliseconds to sleep
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generate a short, unique identifier (nanoid-style).
 *
 * @returns A 12-character alphanumeric ID
 */
export function generateId(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  for (let i = 0; i < 12; i++) {
    result += chars[array[i] % chars.length];
  }
  return result;
}

/**
 * Format a number into a compact, human-readable string.
 *
 * @example formatNumber(1234) → "1.2K"
 * @example formatNumber(1_500_000) → "1.5M"
 */
export function formatNumber(n: number): string {
  if (n >= 1_000_000) {
    return (n / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  }
  if (n >= 1_000) {
    return (n / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }
  return n.toString();
}

/**
 * Extract initials from a full name.
 *
 * @example getInitials("John Doe") → "JD"
 * @example getInitials("Alice") → "A"
 */
export function getInitials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .map((part) => part[0].toUpperCase())
    .slice(0, 2)
    .join("");
}
