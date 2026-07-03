import type { ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import useMobileMenu from "../../hooks/useMobileMenu";
import { api } from "../../lib/api";

const adminLinks = [
  { label: "Invoices", to: "/admin/invoices" },
  { label: "Pay Invoice", to: "/admin/pay-invoice" },
  { label: "Portfolio CMS", to: "/admin/portfolio-cms" },
  { label: "Bookings", to: "/admin/bookings" },
  { label: "Quotes", to: "/admin/quotes" },
  { label: "Public Events", to: "/admin/public-events" },
  { label: "Stats", to: "/admin/stats" },
  { label: "Settings", to: "/admin/settings" },
];

const adminMobileLinks = [
  { label: "Dashboard", to: "/admin" },
  { label: "Bookings", to: "/admin/bookings" },
  { label: "Invoices", to: "/admin/invoices" },
  { label: "Quotes", to: "/admin/quotes" },
  { label: "Calendar", to: "/admin/calendar" },
  { label: "Portfolio", to: "/admin/portfolio-cms" },
  { label: "Stats", to: "/admin/stats" },
  { label: "Settings", to: "/admin/settings" },
];

export default function AdminShell({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isOpen, menuRef, setIsOpen, toggleRef } = useMobileMenu();
  const logoutMutation = useMutation({
    mutationFn: api.auth.logout,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
      navigate("/admin/login", { replace: true });
    },
  });

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* DIAGNOSIS
       * Public menu component: client/src/components/Header.tsx
       * Admin layout component: client/src/components/layout/AdminShell.tsx
       * Breakpoint used by public menu: Tailwind default md, 768px
       * Reason admin menu is missing/broken: admin navigation had its own duplicated mobile menu logic, making behavior easy to drift from the public hamburger.
       * Approach to fix: share the public menu state, focus trap, Escape, outside-click, route-close, and body-scroll behavior through useMobileMenu while keeping admin desktop sidebar markup unchanged.
       */}
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-grey-light bg-paper p-6 md:flex">
        <div className="mb-10">
          <p className="font-display text-3xl font-semibold uppercase tracking-[-0.04em]">
            Malume
          </p>
          <div className="mt-8 border-t border-grey-light pt-6">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
              Admin
            </p>
            <p className="mt-1 text-sm font-semibold uppercase">Malume</p>
          </div>
        </div>
        <nav className="flex flex-col border-t border-grey-light pt-4">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `border-l py-3 pl-3 text-[0.75rem] font-semibold uppercase tracking-[0.25em] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                  isActive
                    ? "border-ink text-ink underline decoration-ink decoration-1 underline-offset-4"
                    : "border-transparent text-grey"
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="mt-auto border border-ink px-4 py-3 text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-not-allowed disabled:border-grey disabled:text-grey"
        >
          {logoutMutation.isPending ? "Signing out" : "Logout"}
        </button>
      </aside>

      <header className="sticky top-0 z-40 border-b border-grey-light bg-paper md:hidden">
        <div className="flex items-center justify-between px-6 py-4">
          <span className="font-display text-2xl font-semibold uppercase">
            Malume
          </span>
          <button
            ref={toggleRef}
            type="button"
            aria-label={isOpen ? "Close admin menu" : "Open admin menu"}
            aria-expanded={isOpen}
            aria-controls="admin-mobile-menu"
            onClick={() => setIsOpen((value) => !value)}
            className="inline-flex h-10 w-10 items-center justify-center border border-ink text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            <span className="sr-only">
              {isOpen ? "Close admin menu" : "Open admin menu"}
            </span>
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
          id="admin-mobile-menu"
          ref={menuRef}
          className={`border-t border-grey-light bg-paper px-6 transition-[max-height,opacity] duration-300 ${
            isOpen
              ? "max-h-screen opacity-100"
              : "max-h-0 overflow-hidden opacity-0"
          }`}
          aria-hidden={!isOpen}
        >
          <nav
            className="flex flex-col gap-5 py-8"
            aria-label="Admin mobile navigation"
          >
            {adminMobileLinks.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                tabIndex={isOpen ? 0 : -1}
                className={({ isActive }) =>
                  `nav-link uppercase tracking-[0.25em] text-[0.75rem] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink ${
                    isActive ? "nav-link--active" : "text-grey"
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}
            <button
              type="button"
              onClick={() => logoutMutation.mutate()}
              disabled={logoutMutation.isPending}
              tabIndex={isOpen ? 0 : -1}
              className="mt-3 border border-ink px-4 py-3 text-left text-[0.75rem] font-semibold uppercase tracking-[0.2em] text-ink transition-colors hover:bg-ink hover:text-paper focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink disabled:cursor-not-allowed disabled:border-grey disabled:text-grey"
            >
              {logoutMutation.isPending ? "Signing out" : "Logout"}
            </button>
          </nav>
        </div>
      </header>

      <main className="min-h-screen px-6 py-12 md:ml-64 md:px-8">
        {children}
      </main>
    </div>
  );
}
