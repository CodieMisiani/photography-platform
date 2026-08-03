import AdminShell from "../components/layout/AdminShell";
import { Link } from "react-router-dom";

const dashboardLinks = [
  { label: "Bookings", to: "/admin/bookings" },
  { label: "Invoices", to: "/admin/invoices" },
  { label: "Quotes", to: "/admin/quotes" },
  { label: "Calendar", to: "/admin/calendar" },
  { label: "Portfolio", to: "/admin/portfolio-cms" },
  { label: "Stats", to: "/admin/stats" },
  { label: "Settings", to: "/admin/settings" },
];

export default function AdminDashboardPage() {
  return (
    <AdminShell>
      <section className="max-w-5xl">
        <p className="text-[0.75rem] font-semibold uppercase tracking-[0.25em] text-grey">
          Admin
        </p>
        <h1 className="mt-4 font-display text-5xl font-semibold uppercase tracking-[-0.04em]">
          Dashboard
        </h1>
        <div className="mt-10 grid border-t border-grey-light md:grid-cols-2">
          {dashboardLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className="border-b border-grey-light py-6 text-[0.8rem] font-semibold uppercase tracking-[0.25em] text-grey transition-all duration-150 hover:text-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 active:translate-x-1 md:odd:border-r md:odd:pr-6 md:even:pl-6"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </AdminShell>
  );
}
