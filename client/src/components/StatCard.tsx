import useCountUp from "../hooks/useCountUp";
import useFadeUpOnView from "../hooks/useFadeUpOnView";

type StatCardProps = {
  delay?: number;
  label: string;
  value: number;
  suffix?: string | null;
};

/**
 * Animated stat card with a deferred count-up.
 *
 * The card reveals when it enters the viewport, then starts counting after
 * its own entrance transition completes. Reduced motion renders final values.
 */
export default function StatCard({
  delay = 0,
  label,
  value,
  suffix,
}: StatCardProps) {
  const { isVisible, prefersReducedMotion, ref, style } =
    useFadeUpOnView<HTMLDivElement>({
      delay,
      duration: 500,
      scale: 0.97,
      translateY: 16,
    });
  const { value: current } = useCountUp(value, {
    delay: prefersReducedMotion ? 0 : delay + 500,
    duration: 1400,
    enabled: isVisible,
  });

  return (
    <div className="stat-card p-6 text-center" ref={ref} style={style}>
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
