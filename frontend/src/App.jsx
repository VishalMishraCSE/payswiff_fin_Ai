import { BrowserRouter, Routes, Route } from "react-router-dom";

import Dashboard from "./pages/dashboard/Dashboard";
import Login from "./pages/auth/Login";
import Merchants from "./pages/merchants/Merchants";
import Settlements from "./pages/settlements/Settlements";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/merchants" element={<Merchants />} />
        <Route path="/settlements" element={<Settlements />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;