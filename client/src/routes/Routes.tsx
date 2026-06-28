import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import PortfolioPage from "../pages/PortfolioPage";
import PublicEventsPage from "../pages/PublicEventsPage";
import RequestQuotePage from "../pages/RequestQuotePage";
import InvoiceManagementPage from "../pages/InvoiceManagementPage";
import PayInvoicePage from "../pages/PayInvoicePage";
import PortfolioCmsPage from "../pages/PortfolioCmsPage";

export default function AppRoutes() {
  return (
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
  );
}
