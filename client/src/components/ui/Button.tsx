import { Link } from "react-router-dom";
import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = {
  asLink?: boolean;
  to?: string;
} & ComponentPropsWithoutRef<"button">;

export default function Button({
  asLink,
  to,
  className = "",
  children,
  type = "button",
  ...rest
}: ButtonProps) {
  const base =
    "motion-button inline-flex items-center justify-center gap-2 border border-ink text-ink bg-transparent px-6 py-3 uppercase tracking-[0.2em] text-[0.75rem] font-semibold transition-colors duration-200";
  const hover =
    "hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-ink";
  const classes = `${base} ${hover} ${className}`.trim();

  if (asLink && to) {
    return (
      <Link to={to} className={classes}>
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
