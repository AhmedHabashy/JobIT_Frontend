import { useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from "react-router-dom";
import { AuthProvider } from "@/auth/AuthProvider";
import { RedirectIfAuthed, RequireAuth } from "@/auth/guards";
import { DirectionProvider } from "@/i18n/DirectionProvider";
import { ToastProvider } from "@/components/ToastProvider";
import { CreditsBannerProvider, useCredits } from "@/components/Banner";
import { setApiErrorHandlers } from "@/lib/apiClient";
import { supabase } from "@/lib/supabase";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Workspace from "@/pages/Workspace";

/**
 * Bridges the decoupled apiClient error side-effects into React:
 * - forbidden (403)        → sign out + route to /login
 * - resources_exhausted    → flip the persistent out-of-credits banner
 */
function ApiErrorBridge() {
  const navigate = useNavigate();
  const { markOutOfCredits } = useCredits();

  useEffect(() => {
    setApiErrorHandlers({
      onForbidden: () => {
        void supabase.auth.signOut().finally(() => navigate("/login", { replace: true }));
      },
      onResourcesExhausted: (err) => markOutOfCredits(err.request_id),
    });
    return () => setApiErrorHandlers({});
  }, [navigate, markOutOfCredits]);

  return null;
}

function AppRoutes() {
  return (
    <>
      <ApiErrorBridge />
      <Routes>
        <Route
          path="/"
          element={
            <RedirectIfAuthed>
              <Landing />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/login"
          element={
            <RedirectIfAuthed>
              <Login />
            </RedirectIfAuthed>
          }
        />
        <Route
          path="/app"
          element={
            <RequireAuth>
              <Workspace />
            </RequireAuth>
          }
        />
        <Route
          path="/app/c/:sessionId"
          element={
            <RequireAuth>
              <Workspace />
            </RequireAuth>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <DirectionProvider>
          <ToastProvider>
            <CreditsBannerProvider>
              <AppRoutes />
            </CreditsBannerProvider>
          </ToastProvider>
        </DirectionProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
