"use client";
import { useI18n } from "@/lib/i18n";

const URG: Record<string, string> = { high: "bg-red-100 text-red-700", medium: "bg-orange-100 text-orange-700", low: "bg-blue-100 text-blue-700" };
const STAT: Record<string, string> = { new: "bg-slate-100 text-slate-700", verified: "bg-teal-100 text-teal-700", assigned: "bg-indigo-100 text-indigo-700", resolved: "bg-green-100 text-green-700" };

export const Pill = ({ className, children }: { className: string; children: React.ReactNode }) => (
  <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${className}`}>{children}</span>
);
export const UrgencyBadge = ({ v }: { v: string }) => { const { t } = useI18n(); return <Pill className={URG[v] || ""}>{t("u_" + v)}</Pill>; };
export const StatusBadge = ({ v }: { v: string }) => { const { t } = useI18n(); return <Pill className={STAT[v] || ""}>{t("s_" + v)}</Pill>; };
