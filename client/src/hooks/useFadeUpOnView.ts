import { useEffect, useMemo, useRef, useState } from "react";
import type { CSSProperties } from "react";

type Options = {
  delay?: number;
  duration?: number;
  translateY?: number;
  scale?: number;
  threshold?: number;
};

const easing = "cubic-bezier(0.16, 1, 0.3, 1)";

/**
 * Runs a one-time viewport-triggered opacity/transform reveal.
 *
 * Pass the returned `ref` to the element being animated and spread `style`
 * onto it. When `prefers-reduced-motion` is enabled, the element renders in
 * its final state immediately and no transition is applied.
 */
export function useFadeUpOnView<T extends HTMLElement>({
  delay = 0,
  duration = 600,
  translateY = 24,
  scale = 1,
  threshold = 0.2,
}: Options = {}) {
  const ref = useRef<T | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => {
      setPrefersReducedMotion(media.matches);
      if (media.matches) {
        setIsVisible(true);
      }
    };

    updatePreference();
    media.addEventListener("change", updatePreference);
    return () => media.removeEventListener("change", updatePreference);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion || isVisible) {
      return;
    }

    const element = ref.current;
    if (!element) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [isVisible, prefersReducedMotion, threshold]);

  const style = useMemo<CSSProperties>(() => {
    if (prefersReducedMotion) {
      return {
        opacity: 1,
        transform: "translate3d(0, 0, 0) scale(1)",
      };
    }

    return {
      opacity: isVisible ? 1 : 0,
      transform: isVisible
        ? "translate3d(0, 0, 0) scale(1)"
        : `translate3d(0, ${translateY}px, 0) scale(${scale})`,
      transitionProperty: "opacity, transform",
      transitionDuration: `${duration}ms`,
      transitionDelay: `${delay}ms`,
      transitionTimingFunction: easing,
      willChange: isVisible ? "auto" : "opacity, transform",
    };
  }, [delay, duration, isVisible, prefersReducedMotion, scale, translateY]);

  return { isVisible, prefersReducedMotion, ref, style } as const;
}

export default useFadeUpOnView;
