type StatusTextProps = {
  status: string;
};

export default function StatusText({ status }: StatusTextProps) {
  const normalized = status.toLowerCase();
  const decoration =
    normalized === "featured"
      ? "underline decoration-ink decoration-1 underline-offset-2"
      : "font-semibold";

  return (
    <span
      className={`uppercase tracking-[0.25em] text-[0.75rem] ${decoration}`}
    >
      {status}
    </span>
  );
}
