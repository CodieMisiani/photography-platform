import Button from "./ui/Button";
import { NavLink } from "react-router-dom";

const navItems = [
  { label: "Home", to: "/" },
  { label: "Portfolio", to: "/portfolio" },
  { label: "Public Events", to: "/public-events" },
  { label: "Request a Quote", to: "/request-quote" },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-grey-light bg-paper">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="flex items-center gap-6">
          <span className="font-display text-[1rem] uppercase tracking-[0.35em]">
            Elara Studio
          </span>
        </div>
        <nav className="hidden gap-8 md:flex">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `uppercase tracking-[0.25em] text-[0.75rem] ${isActive ? "underline decoration-ink decoration-1 underline-offset-4" : "text-grey"}`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Button asLink to="/request-quote" className="hidden md:inline-flex">
          Book Me
        </Button>
      </div>
    </header>
  );
}
