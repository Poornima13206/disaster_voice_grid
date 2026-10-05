"use client";
import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { translate } from "./locales";
import { isSupported } from "./languages";

type Ctx = { lang: string; setLang: (l: string) => void; t: (k: string) => string };
const LanguageContext = createContext<Ctx>({ lang: "en", setLang: () => {}, t: (k) => k });

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState("en");
  useEffect(() => {
    const saved = localStorage.getItem("dvg_lang");
    const browser = navigator.language?.slice(0, 2);
    if (saved && isSupported(saved)) setLangState(saved);
    else if (browser && isSupported(browser)) setLangState(browser);
  }, []);
  const setLang = useCallback((l: string) => {
    setLangState(l);
    localStorage.setItem("dvg_lang", l);
  }, []);
  const t = useCallback((k: string) => translate(lang, k), [lang]);
  return <LanguageContext.Provider value={{ lang, setLang, t }}>{children}</LanguageContext.Provider>;
}
export const useI18n = () => useContext(LanguageContext);
