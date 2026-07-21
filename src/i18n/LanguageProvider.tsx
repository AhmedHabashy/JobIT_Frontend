import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { dictionaries } from "@/i18n/strings";
import type { Language, StringKey } from "@/i18n/strings";

export type Direction = "ltr" | "rtl";

const STORAGE_KEY = "jobit.language";
const LEGACY_DIRECTION_KEY = "jobit.direction";

interface LanguageContextValue {
  language: Language;
  dir: Direction;
  isRtl: boolean;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  /** Look up a UI string in the active language. */
  t: (key: StringKey) => string;
}

const LanguageContext = createContext<LanguageContextValue | null>(null);

function readInitial(): Language {
  if (typeof localStorage === "undefined") return "en";
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored === "ar" || stored === "en") return stored;
  // Migrate the pre-i18n direction-only preference: rtl implied Arabic.
  return localStorage.getItem(LEGACY_DIRECTION_KEY) === "rtl" ? "ar" : "en";
}

/**
 * App language + the string layer. Language is the source of truth; layout
 * direction is derived (ar → rtl) and drives <html dir>/<html lang> exactly as
 * the old DirectionProvider did, so all existing RTL mirroring keeps working.
 * Per-chart RTL is still handled independently in PlotlyChart.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(readInitial);
  const dir: Direction = language === "ar" ? "rtl" : "ltr";

  useEffect(() => {
    document.documentElement.setAttribute("dir", dir);
    document.documentElement.setAttribute("lang", language);
  }, [dir, language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      /* ignore storage failures (private mode) */
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLanguage(language === "ar" ? "en" : "ar");
  }, [language, setLanguage]);

  const t = useCallback((key: StringKey) => dictionaries[language][key], [language]);

  const value = useMemo<LanguageContextValue>(
    () => ({ language, dir, isRtl: dir === "rtl", setLanguage, toggleLanguage, t }),
    [language, dir, setLanguage, toggleLanguage, t],
  );

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within a LanguageProvider");
  return ctx;
}
