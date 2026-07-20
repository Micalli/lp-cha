import type { ReactNode } from "react";
import { cn } from "@/app/utils/cn";

interface EyebrowProps {
  children: ReactNode;
  className?: string;
}

/**
 * Rótulo pequeno em caixa-alta com muito espaçamento entre letras —
 * a "sobrancelha" que abre cada seção do convite.
 */
export function Eyebrow({ children, className }: EyebrowProps) {
  return (
    <span
      className={cn(
        "font-body text-xs uppercase tracking-[0.34em] text-gold",
        className,
      )}
    >
      {children}
    </span>
  );
}
