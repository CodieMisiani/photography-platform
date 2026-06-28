import { NavLink } from "react-router-dom";

const adminLinks = [
  { label: "Invoices", to: "/admin/invoices" },
  { label: "Pay Invoice", to: "/admin/pay-invoice" },
  { label: "Portfolio CMS", to: "/admin/portfolio-cms" },
  { label: "Bookings", to: "/admin/bookings" },
  { label: "Quotes", to: "/admin/quotes" },
  { label: "Public Events", to: "/admin/public-events" },
];

export default function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <aside className="fixed left-0 top-0 hidden h-screen w-64 flex-col border-r border-grey-light bg-paper p-6 md:flex">
        <div className="mb-10">
          <p className="font-display text-3xl font-semibold uppercase tracking-[-0.04em]">
            Elara
          </p>
          <div className="mt-8 border-t border-grey-light pt-6">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
              Admin
            </p>
            <p className="mt-1 text-sm font-semibold uppercase">
              Alexander Elara
            </p>
          </div>
        </div>
        <nav className="flex flex-col border-t border-grey-light pt-4">
          {adminLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `border-l py-3 pl-3 text-[0.75rem] font-semibold uppercase tracking-[0.25em] ${
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
      </aside>

      <header className="sticky top-0 z-40 flex items-center justify-between border-b border-grey-light bg-paper px-6 py-4 md:hidden">
        <span className="font-display text-2xl font-semibold uppercase">
          Elara
        </span>
        <span className="text-[0.7rem] font-semibold uppercase tracking-[0.25em] text-grey">
          Admin
        </span>
      </header>

      <main className="min-h-screen px-6 py-12 md:ml-64 md:px-8">
        {children}
      </main>
    </div>
  );
}
