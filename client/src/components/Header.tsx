import { NavLink, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import useMobileMenu from "../hooks/useMobileMenu";
import usePrefersReducedMotion from "../hooks/usePrefersReducedMotion";
import Button from "./ui/Button";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "About", to: "/about" },
  { label: "Journal", to: "/journal" },
  { label: "Events", to: "/public-events" },
  { label: "Request a Quote", to: "/request-quote" },
];

export default function Header() {
  const { isOpen, menuRef, setIsOpen, toggleRef } = useMobileMenu();
  const prefersReducedMotion = usePrefersReducedMotion();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const isHomepage = location.pathname === "/";
  const isHomepageAtTop = isHomepage && !isScrolled;
  const headerSurfaceClass = isHomepageAtTop
    ? "border-transparent bg-transparent text-text-inverse"
    : isScrolled
      ? "border-ink-warm bg-ink-rich/90 text-text-inverse backdrop-blur-md"
      : "border-paper-deep bg-paper/95 text-text-primary backdrop-blur";

  useEffect(() => {
    const update = () => setIsScrolled(window.scrollY > 80);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-all ${
        prefersReducedMotion ? "duration-0" : "duration-300"
      } ${headerSurfaceClass}`}
    >
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <NavLink
          to="/"
          className="font-display text-[1rem] uppercase tracking-[0.35em] transition-opacity duration-150 hover:opacity-80"
        >
          Malume
        </NavLink>

        <nav className="hidden gap-8 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <HeaderLink key={item.to} item={item} inverted={isHomepageAtTop} />
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button asLink to="/book">
            Book Me
          </Button>
        </div>

        <button
          ref={toggleRef}
          type="button"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
          aria-controls="mobile-menu"
          onClick={() => setIsOpen((value) => !value)}
          className="inline-flex h-10 w-10 items-center justify-center border border-accent text-accent transition-colors hover:bg-accent hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent md:hidden"
        >
          <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
          <span className="flex flex-col gap-1" aria-hidden="true">
            <span
              className={`h-px w-5 bg-current transition-transform ${isOpen ? "translate-y-1 rotate-45" : ""}`}
            />
            <span
              className={`h-px w-5 bg-current transition-opacity ${isOpen ? "opacity-0" : ""}`}
            />
            <span
              className={`h-px w-5 bg-current transition-transform ${isOpen ? "-translate-y-1 -rotate-45" : ""}`}
            />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={`border-t border-paper-deep bg-paper px-6 text-text-primary transition-[max-height,opacity] duration-300 md:hidden ${
          isOpen
            ? "max-h-screen opacity-100"
            : "max-h-0 overflow-hidden opacity-0"
        }`}
        aria-hidden={!isOpen}
      >
        <nav
          className="flex flex-col gap-5 py-8"
          aria-label="Mobile navigation"
        >
          {navItems.map((item) => (
            <HeaderLink key={item.to} item={item} tabIndex={isOpen ? 0 : -1} />
          ))}
          <div className="grid gap-3 pt-4">
            <Button asLink to="/book" className="w-full" tabIndex={isOpen ? 0 : -1}>
              Book Me
            </Button>
            <Button
              asLink
              to="/request-quote"
              className="w-full"
              variant="secondary"
              tabIndex={isOpen ? 0 : -1}
            >
              Request a Quote
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({
  item,
  tabIndex,
  inverted = false,
}: {
  item: { label: string; to: string };
  tabIndex?: number;
  inverted?: boolean;
}) {
  return (
    <NavLink
      to={item.to}
      tabIndex={tabIndex}
      className={({ isActive }) =>
        `nav-link uppercase tracking-[0.25em] text-[0.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
          isActive ? "nav-link--active" : ""
        } ${inverted ? "nav-link--inverted" : ""}`
      }
    >
      {item.label}
    </NavLink>
  );
}
