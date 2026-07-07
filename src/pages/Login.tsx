import { useState } from "react";
import type { FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/auth/AuthProvider";
import { getMe } from "@/api/me";
import { ApiError } from "@/lib/apiError";

/**
 * "Authorized Access Only" login screen (US1). Signs in via Supabase
 * signInWithPassword — never the raw token endpoint. There is NO signup; the
 * screen states access is operator-provisioned.
 *
 * Distinct messaging (FR-004):
 * - Supabase auth error  → "invalid credentials"
 * - valid login but the backend returns 403 forbidden on /me → "deactivated"
 * A depleted (out-of-credits) account still enters the app; the persistent
 * banner takes over there.
 */
export default function Login() {
  const { signInWithPassword, signOut } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await signInWithPassword(email.trim(), password);
    } catch {
      setError("Invalid email or access key. Please check your credentials and try again.");
      setSubmitting(false);
      return;
    }

    // Login succeeded — probe account state to distinguish deactivated accounts.
    try {
      await getMe();
      navigate("/app", { replace: true });
    } catch (err) {
      if (ApiError.is(err) && err.code === "forbidden") {
        await signOut();
        setError("This account has been deactivated. Please contact your administrator.");
        setSubmitting(false);
        return;
      }
      // resources_exhausted or a transient error: enter the app anyway — the
      // out-of-credits banner / retry handling take over there.
      navigate("/app", { replace: true });
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-surface">
      <header className="w-full sticky top-0 bg-surface border-b border-outline-variant">
        <div className="flex justify-between items-center max-w-max-width-content mx-auto px-margin-mobile h-16">
          <span className="font-headline-md text-headline-md text-primary">Jobit</span>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-margin-mobile py-lg">
        <div className="mb-lg text-center">
          <h1 className="font-display-lg-mobile md:font-display-lg text-display-lg-mobile md:text-display-lg text-on-surface mb-sm">
            Authorized Access Only
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant max-w-md mx-auto">
            Sign in to access Jobit Career Intelligence.
          </p>
        </div>

        <div className="w-full max-w-[440px] bg-surface-container-lowest border border-outline-variant rounded-xl p-md md:p-lg">
          <form className="space-y-md" onSubmit={handleSubmit} noValidate>
            <div className="space-y-xs">
              <label
                className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider"
                htmlFor="email"
              >
                Corporate Email
              </label>
              <input
                id="email"
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full px-md py-sm bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
              />
            </div>

            <div className="space-y-xs">
              <label
                className="font-label-caps text-label-caps text-on-surface-variant uppercase tracking-wider"
                htmlFor="password"
              >
                Access Key
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter security key"
                  className="w-full px-md py-sm pe-12 bg-surface-container-lowest border border-outline-variant rounded-lg font-body-md text-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary transition-all"
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Hide access key" : "Show access key"}
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute end-sm top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-primary"
                >
                  <span className="material-symbols-outlined">
                    {showPassword ? "visibility_off" : "visibility"}
                  </span>
                </button>
              </div>
            </div>

            {error ? (
              <div
                role="alert"
                className="flex items-start gap-xs bg-error-container/40 p-sm rounded-lg border border-error/20"
              >
                <span className="material-symbols-outlined text-error text-[20px]">error</span>
                <p className="font-body-sm text-body-sm text-on-error-container leading-tight">
                  {error}
                </p>
              </div>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-primary hover:bg-[#004c6e] text-on-primary font-headline-md text-[18px] py-sm rounded-lg transition-all active:scale-[0.98] disabled:opacity-60 disabled:active:scale-100 flex items-center justify-center gap-base"
            >
              {submitting ? (
                <>
                  <span className="material-symbols-outlined animate-spin text-[20px]">
                    progress_activity
                  </span>
                  Verifying…
                </>
              ) : (
                "Sign In"
              )}
            </button>

            <div className="relative py-base flex items-center">
              <div className="flex-grow border-t border-outline-variant" />
              <span className="flex-shrink mx-md text-outline font-label-caps text-label-caps">
                OR
              </span>
              <div className="flex-grow border-t border-outline-variant" />
            </div>

            <div className="space-y-sm">
              <button
                type="button"
                disabled
                className="w-full bg-surface-container border border-outline-variant text-outline cursor-not-allowed font-title-sm text-body-md py-sm rounded-lg opacity-60"
              >
                Sign Up
              </button>
              <div className="flex items-start gap-xs bg-error-container/20 p-sm rounded-lg border border-error-container/30">
                <span className="material-symbols-outlined text-error text-[20px]">info</span>
                <p className="font-body-sm text-body-sm text-on-surface-variant leading-tight">
                  Registration is restricted to authorized personnel. Please contact your
                  administrator for credentials.
                </p>
              </div>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
