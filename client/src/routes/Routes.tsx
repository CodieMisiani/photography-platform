import { Route, Routes } from "react-router-dom";
import HomePage from "../pages/HomePage";
import PortfolioPage from "../pages/PortfolioPage";
import PublicEventsPage from "../pages/PublicEventsPage";
import RequestQuotePage from "../pages/RequestQuotePage";

export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/portfolio" element={<PortfolioPage />} />
      <Route path="/public-events" element={<PublicEventsPage />} />
      <Route path="/request-quote" element={<RequestQuotePage />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}
