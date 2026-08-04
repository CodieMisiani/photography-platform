import { BrowserRouter } from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import ArrivalExperience from "./components/entry/ArrivalExperience";
import { ScrollToTop } from "./components/ScrollToTop";
import AppRoutes from "./routes/Routes";
import { queryClient } from "./lib/queryClient";
import "./styles/globals.css";

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <ScrollToTop />
        <ArrivalExperience>
          <AppRoutes />
        </ArrivalExperience>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
