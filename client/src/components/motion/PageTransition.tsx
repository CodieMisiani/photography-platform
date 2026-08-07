import { useLayoutEffect, useRef } from "react";
import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import usePrefersReducedMotion from "../../hooks/usePrefersReducedMotion";

export default function PageTransition({ children }: { children: ReactNode }) {
  const location = useLocation();
  const scopeRef = useRef<HTMLDivElement>(null);
  const prefersReducedMotion = usePrefersReducedMotion();
  const isAdminRoute = location.pathname.startsWith("/admin");

  useLayoutEffect(() => {
    const scope = scopeRef.current;
    // Public ScrollTrigger reveals mutate every section/article with transforms and
    // clip paths. Admin pages contain dense native controls, so they must remain
    // outside that viewport-dependent animation and hit-testing pipeline.
    if (!scope || prefersReducedMotion || isAdminRoute) {
      return;
    }

    let disposed = false;
    let cleanup = () => {};

    void import("../../animations/gsap").then(({ ScrollTrigger, gsap }) => {
      if (disposed) {
        return;
      }
      const transitionTarget = scope.querySelector<HTMLElement>("main");

      const context = gsap.context(() => {
        if (transitionTarget) {
          gsap.fromTo(
            transitionTarget,
            { autoAlpha: 0, y: 18 },
            { autoAlpha: 1, y: 0, duration: 0.75, ease: "power3.out" },
          );
        }

        const revealTargets = Array.from(
          new Set(
            gsap.utils.toArray<HTMLElement>(
              "[data-reveal], main section, main article",
              scope,
            ),
          ),
        );
        revealTargets.forEach((target, index) => {
          gsap.fromTo(
            target,
            { autoAlpha: 0, y: 34, clipPath: "inset(12% 0% 0% 0%)" },
            {
              autoAlpha: 1,
              y: 0,
              clipPath: "inset(0% 0% 0% 0%)",
              duration: 0.9,
              delay: Math.min(index * 0.035, 0.18),
              ease: "power3.out",
              scrollTrigger: {
                trigger: target,
                start: "top 86%",
                once: true,
              },
            },
          );
        });
      }, scope);

      ScrollTrigger.refresh();
      cleanup = () => context.revert();
    });

    return () => {
      disposed = true;
      cleanup();
    };
  }, [location.pathname, prefersReducedMotion, isAdminRoute]);

  return (
    <div key={location.pathname} ref={scopeRef}>
      {children}
    </div>
  );
}
