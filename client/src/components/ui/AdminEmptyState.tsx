import type { ReactNode } from "react";
import Button from "./Button";

type AdminEmptyStateProps = {
  icon: "calendar" | "receipt" | "chat" | "star" | "image";
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
};

export default function AdminEmptyState({
  icon,
  title,
  message,
  actionLabel,
  onAction,
}: AdminEmptyStateProps) {
  return (
    <section className="flex flex-col items-center justify-center gap-5 border-b border-paper-deep bg-paper-warm px-8 py-16 text-center">
      <div className="flex h-14 w-14 items-center justify-center border border-paper-deep text-text-secondary">
        <EmptyIcon icon={icon} />
      </div>
      <div>
        <h2 className="font-display text-xl font-semibold uppercase text-text-primary">
          {title}
        </h2>
        <p className="mt-2 text-sm text-text-muted">{message}</p>
      </div>
      {actionLabel && onAction ? (
        <Button onClick={onAction}>{actionLabel}</Button>
      ) : null}
    </section>
  );
}

function EmptyIcon({ icon }: { icon: AdminEmptyStateProps["icon"] }) {
  const paths: Record<AdminEmptyStateProps["icon"], ReactNode> = {
    calendar: (
      <>
        <path d="M7 4v4M17 4v4M4 10h16" />
        <rect x="4" y="6" width="16" height="14" />
      </>
    ),
    receipt: (
      <>
        <path d="M7 5h10M7 10h10M7 15h6" />
        <path d="M5 3h14v18l-3-2-3 2-3-2-3 2-2-1.33V3z" />
      </>
    ),
    chat: (
      <>
        <path d="M5 6h14v10H8l-3 3V6z" />
        <path d="M8 9h8M8 12h5" />
      </>
    ),
    star: <path d="m12 4 2.3 4.66 5.14.75-3.72 3.62.88 5.12L12 15.73l-4.6 2.42.88-5.12-3.72-3.62 5.14-.75L12 4z" />,
    image: (
      <>
        <rect x="4" y="5" width="16" height="14" />
        <path d="m7 16 3.5-4 3 3 2-2.5L19 16" />
        <path d="M8 9h.01" />
      </>
    ),
  };

  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      {paths[icon]}
    </svg>
  );
}
