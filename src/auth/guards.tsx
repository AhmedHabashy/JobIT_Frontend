import { Navigate, useLocation } from "react-router-dom";
import type { ReactNode } from "react";
import { useAuth } from "@/auth/AuthProvider";

function AuthLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <span className="material-symbols-outlined animate-spin text-primary text-[32px]">
        progress_activity
      </span>
    </div>
  );
}

/** Gate authed-only routes: redirect to /login when there is no session. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();
  const location = useLocation();

  if (loading) return <AuthLoading />;
  if (!session) return <Navigate to="/login" replace state={{ from: location }} />;
  return <>{children}</>;
}

/** For /login and / — send an already-signed-in user into the workspace. */
export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { session, loading } = useAuth();

  if (loading) return <AuthLoading />;
  if (session) return <Navigate to="/app" replace />;
  return <>{children}</>;
}
