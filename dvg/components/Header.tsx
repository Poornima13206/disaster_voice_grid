"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { LANGUAGES } from "@/lib/languages";

export function LanguageSelect({ value, onChange, className = "" }: { value: string; onChange: (v: string) => void; className?: string }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} className={`rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm ${className}`}>
      {LANGUAGES.map((l) => <option key={l.code} value={l.code}>{l.label}</option>)}
    </select>
  );
}

export default function Header() {
  const { lang, setLang, t } = useI18n();
  return (
    <header className="sticky top-0 z-[1000] border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold text-teal-700">
          <span className="inline-block h-3 w-3 rounded-full bg-teal-500" /> {t("appName")}
        </Link>
        <LanguageSelect value={lang} onChange={setLang} />
      </div>
    </header>
  );
}
