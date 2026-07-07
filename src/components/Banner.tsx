import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface CreditsContextValue {
  isOutOfCredits: boolean;
  requestId: string | null;
  /** Flip the persistent out-of-credits state (called on any resources_exhausted). */
  markOutOfCredits: (requestId?: string) => void;
  /** Clear it (e.g. after a successful /me shows a healthy balance again). */
  clearOutOfCredits: () => void;
}

const CreditsContext = createContext<CreditsContextValue | null>(null);

/**
 * Global out-of-credits state. Any `resources_exhausted` response flips this on;
 * while on, the banner is shown and message sending is blocked (Principle IV).
 */
export function CreditsBannerProvider({ children }: { children: ReactNode }) {
  const [isOutOfCredits, setOut] = useState(false);
  const [requestId, setRequestId] = useState<string | null>(null);

  const markOutOfCredits = useCallback((rid?: string) => {
    setOut(true);
    if (rid) setRequestId(rid);
  }, []);
  const clearOutOfCredits = useCallback(() => {
    setOut(false);
    setRequestId(null);
  }, []);

  const value = useMemo<CreditsContextValue>(
    () => ({ isOutOfCredits, requestId, markOutOfCredits, clearOutOfCredits }),
    [isOutOfCredits, requestId, markOutOfCredits, clearOutOfCredits],
  );

  return (
    <CreditsContext.Provider value={value}>
      {isOutOfCredits ? <OutOfCreditsBanner requestId={requestId} /> : null}
      {children}
    </CreditsContext.Provider>
  );
}

function OutOfCreditsBanner({ requestId }: { requestId: string | null }) {
  return (
    <div
      role="alert"
      className="w-full bg-error-container text-on-error-container px-margin-mobile py-sm flex items-center gap-sm justify-center text-center"
    >
      <span className="material-symbols-outlined text-[20px]">credit_card_off</span>
      <p className="font-body-sm text-body-sm">
        Your account is out of credits and has been deactivated. Contact your administrator to top
        up. Sending is disabled until credits are restored.
        {requestId ? <span className="opacity-70"> (ref: {requestId})</span> : null}
      </p>
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCredits(): CreditsContextValue {
  const ctx = useContext(CreditsContext);
  if (!ctx) throw new Error("useCredits must be used within a CreditsBannerProvider");
  return ctx;
}
