import type { ReactNode } from "react";
import useFadeUpOnView from "../../hooks/useFadeUpOnView";

type FadeUpProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
  duration?: number;
  translateY?: number;
  scale?: number;
};

/**
 * Small wrapper for one-time fade-up viewport reveals.
 *
 * Use it around homepage copy, buttons, and section labels when the element
 * should reveal only after scrolling into view. It respects reduced motion.
 */
export default function FadeUp({
  children,
  className = "",
  delay = 0,
  duration = 600,
  translateY = 24,
  scale = 1,
}: FadeUpProps) {
  const { ref, style } = useFadeUpOnView<HTMLDivElement>({
    delay,
    duration,
    translateY,
    scale,
  });

  return (
    <div ref={ref} className={className} style={style}>
      {children}
    </div>
  );
}
