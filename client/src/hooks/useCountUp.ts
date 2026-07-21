import { useEffect, useRef, useState } from "react";

type Options = {
  duration?: number;
  delay?: number;
  enabled?: boolean;
  start?: number;
};

export function useCountUp(target: number, options: Options = {}) {
  const { delay = 0, duration = 1500, enabled, start = 0 } = options;
  const [value, setValue] = useState(start);
  const ref = useRef<HTMLDivElement | null>(null);
  const frameRef = useRef<number | null>(null);
  const timeoutRef = useRef<number | null>(null);

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
    if (enabled === false) {
      frameRef.current = requestAnimationFrame(() => setValue(start));
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

    function startAnimation() {
      timeoutRef.current = window.setTimeout(() => {
        frameRef.current = requestAnimationFrame(step);
      }, delay);
    }

    if (enabled === true) {
      startAnimation();
      return () => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }

    const el = ref.current;
    if (!el) {
      startAnimation();
      return () => {
        if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
        if (frameRef.current) cancelAnimationFrame(frameRef.current);
      };
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            startAnimation();
            observer.disconnect();
          }
        });
      },
      { threshold: 0.2 },
    );

    observer.observe(el);

    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
      observer.disconnect();
    };
  }, [delay, duration, enabled, start, target]);

  return { value, ref } as const;
}

export default useCountUp;
