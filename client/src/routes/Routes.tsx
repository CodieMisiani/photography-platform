import { Suspense, lazy } from "react";
import { Route, Routes } from "react-router-dom";
import PageTransition from "../components/motion/PageTransition";

const HomePage = lazy(() => import("../pages/HomePage"));
const PortfolioPage = lazy(() => import("../pages/PortfolioPage"));
const PublicEventsPage = lazy(() => import("../pages/PublicEventsPage"));
const RequestQuotePage = lazy(() => import("../pages/RequestQuotePage"));
const InvoiceManagementPage = lazy(() => import("../pages/InvoiceManagementPage"));
const PayInvoicePage = lazy(() => import("../pages/PayInvoicePage"));
const PortfolioCmsPage = lazy(() => import("../pages/PortfolioCmsPage"));

export default function AppRoutes() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <PageTransition>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/public-events" element={<PublicEventsPage />} />
          <Route path="/request-quote" element={<RequestQuotePage />} />
          <Route path="/admin/invoices" element={<InvoiceManagementPage />} />
          <Route path="/admin/pay-invoice" element={<PayInvoicePage />} />
          <Route path="/admin/portfolio-cms" element={<PortfolioCmsPage />} />
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
