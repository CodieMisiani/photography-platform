import { useEffect, useState, type ReactNode } from "react";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

type ArrivalExperienceProps = {
  children?: ReactNode;
};

export default function ArrivalExperience({
  children,
}: ArrivalExperienceProps) {
  const prefersReducedMotion = usePrefersReducedMotion();
  const [isVisible, setIsVisible] = useState(true);
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const finish = () => {
      if (prefersReducedMotion) {
        setIsVisible(false);
        return;
      }

      setIsExiting(true);
      const id = window.requestAnimationFrame(() => {
        setIsVisible(false);
      });
      return () => window.cancelAnimationFrame(id);
    };

    if (document.readyState === "complete") {
      finish();
      return;
    }

    const handleLoad = () => finish();
    window.addEventListener("load", handleLoad, { once: true });
    document.fonts?.ready?.then(handleLoad).catch(() => undefined);

    return () => window.removeEventListener("load", handleLoad);
  }, [prefersReducedMotion]);

  if (!isVisible) {
    return <>{children}</>;
  }

  return (
    <div
      className={`entry-shell ${isExiting ? "entry-shell--exiting" : ""}`.trim()}
      role="status"
      aria-label="Opening Malume Photography"
    >
      <div className="entry-shell__backdrop" />
      <div className="entry-shell__halo" />

      <div className="relative z-10 flex w-full max-w-3xl flex-col items-center justify-center px-6 py-16 text-center sm:px-10">
        <div className="entry-shell__content" aria-hidden="true">
          <span className="entry-shell__line" />
          <span className="entry-shell__mark">M</span>
          <span className="entry-shell__line" />
        </div>

        <p className="entry-shell__eyebrow">
          {prefersReducedMotion ? "Malume Photography" : "Opening the story"}
        </p>
        <h1 className="entry-shell__heading">Quietly cinematic stories.</h1>
        <p className="entry-shell__copy">
          A refined entrance for portraiture, editorial work, and thoughtful
          brand storytelling.
        </p>
      </div>
    </div>
  );
}
