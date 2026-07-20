import {
  type AnchorHTMLAttributes,
  type ButtonHTMLAttributes,
  forwardRef,
} from "react";
import { cn } from "@/app/utils/cn";

type Variant = "solid" | "outline";

const base =
  "inline-flex items-center justify-center font-body text-xs uppercase tracking-[0.2em] px-8 py-4 border transition-all duration-150 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  // Oliva preenchido
  solid:
    "bg-olive text-cream-light border-olive hover:bg-olive-deep hover:border-olive-deep",
  // Contorno dourado que preenche no hover
  outline:
    "bg-transparent text-olive-dark border-gold hover:bg-gold hover:text-cream-light",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/** Botão editorial retangular (caixa-alta, espaçado) do convite. */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "solid", className, ...props }, ref) => (
    <button
      ref={ref}
      className={cn(base, variants[variant], className)}
      {...props}
    />
  ),
);
Button.displayName = "Button";

interface LinkButtonProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  variant?: Variant;
}

/** Mesma aparência do Button, porém como link (<a>). */
export function LinkButton({
  variant = "solid",
  className,
  ...props
}: LinkButtonProps) {
  return (
    <a className={cn(base, variants[variant], className)} {...props} />
  );
}
