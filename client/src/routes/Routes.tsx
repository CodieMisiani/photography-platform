import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import AdminRoute from "../components/auth/AdminRoute";
import PageTransition from "../components/motion/PageTransition";

const HomePage = lazy(() => import("../pages/HomePage"));
const PortfolioPage = lazy(() => import("../pages/PortfolioPage"));
const PublicEventsPage = lazy(() => import("../pages/PublicEventsPage"));
const RequestQuotePage = lazy(() => import("../pages/RequestQuotePage"));
const BookPage = lazy(() => import("../pages/BookPage"));
const InvoiceManagementPage = lazy(() => import("../pages/InvoiceManagementPage"));
const PayInvoicePage = lazy(() => import("../pages/PayInvoicePage"));
const PortfolioCmsPage = lazy(() => import("../pages/PortfolioCmsPage"));
const AdminLoginPage = lazy(() => import("../pages/AdminLoginPage"));
const AdminBookingsPage = lazy(() => import("../pages/AdminBookingsPage"));
const AdminQuotesPage = lazy(() => import("../pages/AdminQuotesPage"));
const AdminPublicEventsPage = lazy(() => import("../pages/AdminPublicEventsPage"));
const PolicyPage = lazy(() => import("../pages/PolicyPage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <PageTransition>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/public-events" element={<PublicEventsPage />} />
          <Route path="/book" element={<BookPage />} />
          <Route path="/request-quote" element={<RequestQuotePage />} />
          <Route path="/privacy" element={<PolicyPage type="privacy" />} />
          <Route path="/terms" element={<PolicyPage type="terms" />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminRoute />}>
            <Route path="/admin/invoices" element={<InvoiceManagementPage />} />
            <Route path="/admin/pay-invoice" element={<PayInvoicePage />} />
            <Route path="/admin/portfolio-cms" element={<PortfolioCmsPage />} />
            <Route path="/admin/bookings" element={<AdminBookingsPage />} />
            <Route path="/admin/quotes" element={<AdminQuotesPage />} />
            <Route path="/admin/public-events" element={<AdminPublicEventsPage />} />
          </Route>
          <Route path="*" element={<HomePage />} />
        </Routes>
      </PageTransition>
    </Suspense>
  );
}

function RouteFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-paper text-ink">
      <span className="text-[0.75rem] font-semibold uppercase tracking-[0.25em]">
        Loading
      </span>
    </div>
  );
}
