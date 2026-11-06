
import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import AppErrorBoundary from "./components/AppErrorBoundary";
import RouteLoading from "./components/RouteLoading";
import ProtectedRoute from "./components/ProtectedRoute";

const LandingPage = lazy(() => import("./routes/LandingPage"));
const ControlRoom = lazy(() => import("./routes/ControlRoom"));
const LoginPage = lazy(() => import("./routes/LoginPage"));
const PlayPage = lazy(() => import("./routes/PlayPage"));
const NotFoundPage = lazy(() => import("./routes/NotFoundPage"));

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route
              path="/"
              element={<LandingPage />}
            />

            <Route
              path="/play"
              element={<PlayPage />}
            />

            <Route
              path="/login"
              element={<LoginPage />}
            />

            <Route
              path="/preview"
              element={<ControlRoom preview />}
            />

            <Route
              path="/demo"
              element={
                <ProtectedRoute>
                  <ControlRoom />
                </ProtectedRoute>
              }
            />

            <Route
              path="*"
              element={<NotFoundPage />}
            />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
