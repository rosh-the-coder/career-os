import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatScoreBand(score: number): string {
  if (score >= 85) return "Priority";
  if (score >= 75) return "Strong";
  if (score >= 65) return "Worth reviewing";
  if (score >= 50) return "Low priority";
  return "Archive";
}

export function parseJsonArray<T = string>(value: string): T[] {
  try {
    const parsed = JSON.parse(value) as T[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function parseJsonObject<T extends Record<string, unknown>>(value: string): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return {} as T;
  }
}
