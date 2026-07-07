import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "outline";

const VARIANTS: Record<Variant, string> = {
  primary: "bg-primary text-on-primary hover:bg-[#004c6e] active:scale-[0.98]",
  secondary:
    "bg-secondary-container text-on-secondary-container hover:opacity-90 active:scale-[0.98]",
  ghost: "text-on-surface-variant hover:bg-surface-container-high",
  outline: "border border-outline-variant text-on-surface-variant hover:bg-surface-container-low",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  children: ReactNode;
}

export function Button({ variant = "primary", className = "", children, ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-base rounded-lg px-md py-sm font-title-sm text-body-md transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100 ${VARIANTS[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: string;
  label: string;
}

export function IconButton({ icon, label, className = "", ...rest }: IconButtonProps) {
  return (
    <button
      aria-label={label}
      title={label}
      className={`inline-flex items-center justify-center rounded-lg p-xs text-on-surface-variant hover:text-primary hover:bg-surface-container-high transition-colors disabled:opacity-50 ${className}`}
      {...rest}
    >
      <span className="material-symbols-outlined">{icon}</span>
    </button>
  );
}
