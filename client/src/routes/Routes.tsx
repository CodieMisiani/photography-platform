import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import PortfolioPage from "../pages/PortfolioPage";
import PublicEventsPage from "../pages/PublicEventsPage";
import RequestQuotePage from "../pages/RequestQuotePage";
import InvoiceManagementPage from "../pages/InvoiceManagementPage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/public-events" element={<PublicEventsPage />} />
      <Route path="/request-quote" element={<RequestQuotePage />} />
      <Route path="/admin/invoices" element={<InvoiceManagementPage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
