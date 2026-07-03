import React from "react";
import useCountUp from "../hooks/useCountUp";

type StatCardProps = {
  label: string;
  value: number;
  suffix?: string | null;
};

export default function StatCard({ label, value, suffix }: StatCardProps) {
  const { value: current, ref } = useCountUp(value, { duration: 1400 });

  return (
    <div className="stat-card p-6 text-center" ref={ref}>
      <p className="text-xs font-semibold uppercase tracking-widest text-grey">
        {label}
      </p>
      <p className="mt-2 text-3xl font-display font-bold text-ink">
        {current}
        {suffix ? <span className="ml-1 text-base">{suffix}</span> : null}
      </p>
    </div>
  );
}
