import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Combines Tailwind classes conditionally
 * @param  {...any} inputs - class values
 * @returns {string} merged class string
 */
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}
