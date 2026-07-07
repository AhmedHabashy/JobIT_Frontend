import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

export type Direction = "ltr" | "rtl";

const STORAGE_KEY = "jobit.direction";

interface DirectionContextValue {
  direction: Direction;
  isRtl: boolean;
  setDirection: (dir: Direction) => void;
  toggleDirection: () => void;
}

const DirectionContext = createContext<DirectionContextValue | null>(null);

function readInitial(): Direction {
  const stored = typeof localStorage !== "undefined" ? localStorage.getItem(STORAGE_KEY) : null;
  return stored === "rtl" ? "rtl" : "ltr";
}

/**
 * App-level layout direction (ltr/rtl). Sets <html dir> and persists the choice.
 * Full Arabic string translation is out of scope for v1; this drives layout
 * mirroring only. Per-chart RTL is handled independently in PlotlyChart.
 */
export function DirectionProvider({ children }: { children: ReactNode }) {
  const [direction, setDirectionState] = useState<Direction>(readInitial);

  useEffect(() => {
    document.documentElement.setAttribute("dir", direction);
    document.documentElement.setAttribute("lang", direction === "rtl" ? "ar" : "en");
  }, [direction]);

  const setDirection = useCallback((dir: Direction) => {
    setDirectionState(dir);
    try {
      localStorage.setItem(STORAGE_KEY, dir);
    } catch {
      /* ignore storage failures (private mode) */
    }
  }, []);

  const toggleDirection = useCallback(() => {
    setDirection(direction === "rtl" ? "ltr" : "rtl");
  }, [direction, setDirection]);

  const value = useMemo<DirectionContextValue>(
    () => ({ direction, isRtl: direction === "rtl", setDirection, toggleDirection }),
    [direction, setDirection, toggleDirection],
  );

  return <DirectionContext.Provider value={value}>{children}</DirectionContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useDirection(): DirectionContextValue {
  const ctx = useContext(DirectionContext);
  if (!ctx) throw new Error("useDirection must be used within a DirectionProvider");
  return ctx;
}
