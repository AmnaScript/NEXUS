
import { lazy, Suspense } from "react";
import {
  BrowserRouter,
  Route,
  Routes,
} from "react-router-dom";

import AppErrorBoundary from "./components/AppErrorBoundary";
import ProtectedRoute from "./components/ProtectedRoute";
import RouteLoading from "./components/RouteLoading";

const LandingPage = lazy(() => import("./routes/LandingPage"));
const ControlRoom = lazy(() => import("./routes/ControlRoom"));
const LoginPage = lazy(() => import("./routes/LoginPage"));
const PlayPage = lazy(() => import("./routes/PlayPage"));
const NotFoundPage = lazy(() => import("./routes/NotFoundPage"));

const OperatorAuthPage = lazy(
  () => import("./routes/OperatorAuthPage")
);

const OperatorWorkspacePage = lazy(
  () => import("./routes/OperatorWorkspacePage")
);

export default function App() {
  return (
    <AppErrorBoundary>
      <BrowserRouter>
        <Suspense fallback={<RouteLoading />}>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/play" element={<PlayPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route
              path="/preview"
              element={<ControlRoom preview />}
            />

            <Route
              path="/activate"
              element={<OperatorAuthPage mode="activate" />}
            />
            <Route
              path="/forgot-password"
              element={<OperatorAuthPage mode="forgot" />}
            />
            <Route
              path="/reset-password"
              element={<OperatorAuthPage mode="reset" />}
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
              path="/operator"
              element={
                <ProtectedRoute>
                  <OperatorWorkspacePage />
                </ProtectedRoute>
              }
            />

            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </Suspense>
      </BrowserRouter>
    </AppErrorBoundary>
  );
}
