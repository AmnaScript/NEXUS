import { BrowserRouter, Routes, Route } from "react-router-dom";
import LandingPage from "./routes/LandingPage";
import ControlRoom from "./routes/ControlRoom";
import LoginPage from "./routes/LoginPage";
import PlayPage from "./routes/PlayPage";
import ProtectedRoute from "./components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/play" element={<PlayPage />} />
        <Route path="/demo" element={<ProtectedRoute><ControlRoom /></ProtectedRoute>} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/preview" element={<ControlRoom preview />} />
      </Routes>
    </BrowserRouter>
  );
}
