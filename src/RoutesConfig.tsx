// Routes.tsx

import { Route, Routes } from "react-router-dom";
import Formulaire from "./Formulaire";
import Ticket from "./Ticket";

const RoutesConfig = () => {
  return (
    <Routes>
      <Route path="/" element={<Formulaire />} />
      <Route path="/ticket" element={<Ticket />} />
    </Routes>
  );
};

export default RoutesConfig;
