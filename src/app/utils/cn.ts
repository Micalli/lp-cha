import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Composição segura de classes Tailwind — mesmo utilitário do design system.
 * Junta condicionais (clsx) e resolve conflitos de classe (tailwind-merge).
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
