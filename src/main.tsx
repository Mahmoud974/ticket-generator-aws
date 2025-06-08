import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "./index.css";
import RoutesConfig from "./RoutesConfig.tsx";
import { UserProvider } from "./hook/useContext.tsx";

createRoot(document.getElementById("root")!).render(
  <UserProvider>
    <StrictMode>
      <BrowserRouter>
        <RoutesConfig />
      </BrowserRouter>
    </StrictMode>
  </UserProvider>
);
