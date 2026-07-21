import { Link } from "react-router-dom";
import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = {
  asLink?: boolean;
  to?: string;
  variant?: "primary" | "secondary" | "neutral" | "danger";
} & ComponentPropsWithoutRef<"button">;

export default function Button({
  asLink,
  to,
  className = "",
  children,
  type = "button",
  variant = "primary",
  ...rest
}: ButtonProps) {
  const base =
    "motion-button inline-flex items-center justify-center gap-2 border px-6 py-3 uppercase tracking-[0.2em] text-[0.75rem] font-semibold transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 active:scale-[0.98]";
  const variants = {
    primary:
      "border-accent bg-accent text-white hover:border-accent-hover hover:bg-accent-hover hover:text-white focus-visible:ring-accent active:border-accent-hover active:bg-accent-hover",
    secondary:
      "border-accent bg-transparent text-accent hover:border-accent hover:bg-accent hover:text-white focus-visible:ring-accent active:border-accent-hover active:bg-accent-hover active:text-white",
    neutral:
      "border-ink bg-transparent text-ink hover:bg-ink hover:text-paper focus-visible:ring-ink",
    danger:
      "border-red-700 bg-transparent text-red-700 hover:bg-red-700 hover:text-white focus-visible:ring-red-700",
  };
  const classes = `${base} ${variants[variant]} ${className}`.trim();

  if (asLink && to) {
    return (
      <Link to={to} className={classes} tabIndex={rest.tabIndex}>
        {children}
      </Link>
    );
  }

  return (
    <button type={type} className={classes} {...rest}>
      {children}
    </button>
  );
}
