import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";

export type ToastVariant = "transient" | "retryable" | "info";

export interface Toast {
  id: number;
  message: string;
  variant: ToastVariant;
  requestId?: string;
  onRetry?: () => void;
}

interface ToastContextValue {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => number;
  dismissToast: (id: number) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// Transient toasts auto-dismiss; retryable ones persist until dismissed/retried.
const AUTO_DISMISS_MS: Record<ToastVariant, number | null> = {
  transient: 4000,
  info: 4000,
  retryable: null,
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const nextId = useRef(1);

  const dismissToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (toast: Omit<Toast, "id">): number => {
      const id = nextId.current++;
      setToasts((prev) => [...prev, { ...toast, id }]);
      const timeout = AUTO_DISMISS_MS[toast.variant];
      if (timeout !== null) {
        setTimeout(() => dismissToast(id), timeout);
      }
      return id;
    },
    [dismissToast],
  );

  const value = useMemo<ToastContextValue>(
    () => ({ toasts, showToast, dismissToast }),
    [toasts, showToast, dismissToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
}

function ToastViewport({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <div className="fixed bottom-md end-md z-50 flex flex-col gap-sm w-[min(360px,calc(100vw-2rem))]">
      {toasts.map((t) => (
        <div
          key={t.id}
          role="status"
          className="bg-inverse-surface text-inverse-on-surface rounded-xl p-sm shadow-lg flex flex-col gap-xs"
        >
          <div className="flex items-start gap-sm">
            <span className="material-symbols-outlined text-[20px] mt-[2px]">
              {t.variant === "retryable" ? "error" : "info"}
            </span>
            <p className="font-body-sm text-body-sm flex-1">{t.message}</p>
            <button
              type="button"
              aria-label="Dismiss"
              className="material-symbols-outlined text-[18px] opacity-70 hover:opacity-100"
              onClick={() => onDismiss(t.id)}
            >
              close
            </button>
          </div>
          <div className="flex items-center justify-between ps-[28px]">
            {t.requestId ? (
              <span className="font-label-caps text-[10px] opacity-60">ref: {t.requestId}</span>
            ) : (
              <span />
            )}
            {t.variant === "retryable" && t.onRetry ? (
              <button
                type="button"
                className="font-label-caps text-label-caps text-primary-fixed-dim hover:underline"
                onClick={() => {
                  t.onRetry?.();
                  onDismiss(t.id);
                }}
              >
                Retry
              </button>
            ) : null}
          </div>
        </div>
      ))}
    </div>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within a ToastProvider");
  return ctx;
}
