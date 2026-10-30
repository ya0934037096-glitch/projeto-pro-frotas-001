import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import AdminPanel from "@/pages/AdminPanel";
import ProFrotasLogin from "@/pages/ProFrotasLogin";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ProFrotasLogin />} />
        <Route path="/donaspainel" element={<AdminPanel />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
