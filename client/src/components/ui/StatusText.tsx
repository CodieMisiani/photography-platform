type StatusTextProps = {
  status: string;
};

export default function StatusText({ status }: StatusTextProps) {
  const normalized = status.toLowerCase();
  const accentStatuses = new Set(["paid", "confirmed", "new", "featured"]);
  const destructiveStatuses = new Set(["failed", "declined"]);
  const tone = accentStatuses.has(normalized)
    ? "border border-accent/30 bg-accent-muted px-3 py-1 font-semibold text-accent"
    : destructiveStatuses.has(normalized)
      ? "border border-red-700/30 px-3 py-1 font-semibold text-red-700"
      : "font-semibold text-grey";

  return (
    <span
      className={`uppercase tracking-[0.25em] text-[0.75rem] ${tone}`}
    >
      {status}
    </span>
  );
}
