import { useEffect, useRef, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import Button from "./ui/Button";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Public Events", to: "/public-events" },
  { label: "Request a Quote", to: "/request-quote" },
];

export default function Header() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const menuRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    if (previousPathRef.current === location.pathname) {
      return;
    }

    previousPathRef.current = location.pathname;
    if (!isOpen) {
      return;
    }

    const frame = window.requestAnimationFrame(() => setIsOpen(false));
    return () => window.cancelAnimationFrame(frame);
  }, [isOpen, location.pathname]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    function handlePointer(event: MouseEvent) {
      if (
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        !toggleRef.current?.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }

    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
        toggleRef.current?.focus();
      }
      if (event.key === "Tab" && menuRef.current) {
        trapFocus(event, menuRef.current);
      }
    }

    document.addEventListener("mousedown", handlePointer);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handlePointer);
      document.removeEventListener("keydown", handleKey);
    };
  }, [isOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-grey-light bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <NavLink to="/" className="font-display text-[1rem] uppercase tracking-[0.35em]">
          Elara Studio
        </NavLink>

        <nav className="hidden gap-8 md:flex" aria-label="Primary navigation">
          {navItems.map((item) => (
            <HeaderLink key={item.to} item={item} />
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
          className="inline-flex h-10 w-10 items-center justify-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink md:hidden"
        >
          <span className="sr-only">{isOpen ? "Close menu" : "Open menu"}</span>
          <span className="flex flex-col gap-1" aria-hidden="true">
            <span className={`h-px w-5 bg-current transition-transform ${isOpen ? "translate-y-1 rotate-45" : ""}`} />
            <span className={`h-px w-5 bg-current transition-opacity ${isOpen ? "opacity-0" : ""}`} />
            <span className={`h-px w-5 bg-current transition-transform ${isOpen ? "-translate-y-1 -rotate-45" : ""}`} />
          </span>
        </button>
      </div>

      <div
        id="mobile-menu"
        ref={menuRef}
        className={`border-t border-grey-light bg-paper px-6 transition-[max-height,opacity] duration-300 md:hidden ${
          isOpen ? "max-h-screen opacity-100" : "max-h-0 overflow-hidden opacity-0"
        }`}
      >
        <nav className="flex flex-col gap-5 py-8" aria-label="Mobile navigation">
          {navItems.map((item) => (
            <HeaderLink key={item.to} item={item} />
          ))}
          <div className="grid gap-3 pt-4">
            <Button asLink to="/book" className="w-full">
              Book Me
            </Button>
            <Button asLink to="/request-quote" className="w-full">
              Request a Quote
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
}

function HeaderLink({ item }: { item: { label: string; to: string } }) {
  return (
    <NavLink
      to={item.to}
      className={({ isActive }) =>
        `nav-link uppercase tracking-[0.25em] text-[0.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
          isActive ? "nav-link--active" : ""
        }`
      }
    >
      {item.label}
    </NavLink>
  );
}

function trapFocus(event: KeyboardEvent, container: HTMLElement) {
  const focusable = Array.from(
    container.querySelectorAll<HTMLElement>(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
    ),
  );
  if (focusable.length === 0) {
    return;
  }

  const first = focusable[0];
  const last = focusable[focusable.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
