import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom"; // Importation de BrowserRouter
import "./index.css";
import RoutesConfig from "./RoutesConfig.tsx";
import { UserProvider } from "./hook/useContext.tsx";
import { QueryClient, QueryClientProvider } from "react-query";

const queryClient = new QueryClient();
createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <StrictMode>
        <BrowserRouter>
          <RoutesConfig />
        </BrowserRouter>
      </StrictMode>
    </UserProvider>
  </QueryClientProvider>
);
