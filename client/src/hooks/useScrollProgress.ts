import { useEffect, useState } from "react";
import usePrefersReducedMotion from "./usePrefersReducedMotion";

export default function useScrollProgress() {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (prefersReducedMotion) {
      return;
    }

    const update = () => {
      const height = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(height > 0 ? (window.scrollY / height) * 100 : 0);
    };

    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [prefersReducedMotion]);

  return prefersReducedMotion ? 0 : progress;
}
