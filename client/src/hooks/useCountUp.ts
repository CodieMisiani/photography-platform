import { useEffect, useRef, useState } from "react";

type Options = {
  duration?: number;
  start?: number;
};

export function useCountUp(target: number, options: Options = {}) {
  const { duration = 1500, start = 0 } = options;
  const [value, setValue] = useState(start);
  const ref = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    if (prefersReduced) {
      frameRef.current = requestAnimationFrame(() => setValue(target));
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }

    let startTime: number | null = null;

    function step(ts: number) {
      if (!startTime) startTime = ts;
      const elapsed = ts - startTime;
      const progress = Math.min(1, elapsed / duration);
      const eased =
        progress < 0.5
          ? 2 * progress * progress
          : -1 + (4 - 2 * progress) * progress; // easeInOut
      const current = Math.round(start + (target - start) * eased);
      setValue(current);
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    }

    // Observe element visibility
    const el = ref.current;
    if (!el) {
      // start immediately
      frameRef.current = requestAnimationFrame(step);
      return () => {
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            frameRef.current = requestAnimationFrame(step);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(el);

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, [target, duration, start]);

  return { value, ref } as const;
}

export default useCountUp;
