type MetricTileProps = {
  label: string;
  value: string;
};

export default function MetricTile({ label, value }: MetricTileProps) {
  return (
    <div className="flex min-h-36 flex-col justify-between border-b border-r border-grey-light p-6">
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
        {label}
      </p>
      <p className="font-display text-3xl font-semibold tracking-[-0.04em] text-ink">
        {value}
      </p>
    </div>
  );
}
