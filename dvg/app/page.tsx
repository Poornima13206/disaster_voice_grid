"use client";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export default function Home() {
  const { t } = useI18n();
  return (
    <section className="mx-auto flex max-w-2xl flex-col items-center px-4 py-20 text-center">
      <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-5xl">{t("appName")}</h1>
      <p className="mt-4 text-lg text-slate-600">{t("tagline")}</p>
      <div className="mt-10 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <Link href="/report" className="rounded-2xl bg-teal-600 px-8 py-4 text-lg font-semibold text-white shadow hover:bg-teal-700">{t("fileReport")}</Link>
        <Link href="/dashboard" className="rounded-2xl border border-slate-300 bg-white px-8 py-4 text-lg font-semibold text-slate-700 shadow-sm hover:bg-slate-100">{t("controlRoom")}</Link>
      </div>
    </section>
  );
}
