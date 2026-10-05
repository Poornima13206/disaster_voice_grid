"use client";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { StatusBadge, UrgencyBadge, Pill } from "@/components/Badges";
import IncidentActions from "@/components/IncidentActions";
import type { MapIncident } from "@/components/IncidentMap";

const IncidentMap = dynamic(() => import("@/components/IncidentMap"), { ssr: false, loading: () => <div className="h-full w-full animate-pulse rounded-2xl bg-slate-200" /> });

type Incident = MapIncident & { locationText: string; peopleAtRiskTotal: number; status: string; assignedToTeam: string | null };
const ISSUES = ["rescue", "medical", "food", "shelter", "road", "missing"];

export default function Dashboard() {
  const { t } = useI18n();
  const [items, setItems] = useState<Incident[] | null>(null);
  const [status, setStatus] = useState("");
  const [issueType, setIssueType] = useState("");
  const [urgency, setUrgency] = useState("");
  const [selected, setSelected] = useState<string | null>(null);

  const load = useCallback(async () => {
    const q = new URLSearchParams();
    if (status) q.set("status", status);
    if (issueType) q.set("issueType", issueType);
    if (urgency) q.set("urgency", urgency);
    const res = await fetch(`/api/incidents?${q}`, { cache: "no-store" });
    setItems(await res.json());
  }, [status, issueType, urgency]);

  useEffect(() => { load(); const id = setInterval(load, 10000); return () => clearInterval(id); }, [load]);

  const sel = "rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm";
  return (
    <section className="mx-auto grid max-w-7xl gap-4 px-4 py-4 lg:grid-cols-2">
      <div className="h-[40vh] overflow-hidden rounded-2xl shadow lg:sticky lg:top-20 lg:h-[calc(100vh-6rem)]">
        <IncidentMap incidents={items || []} selectedId={selected} labelFor={(i) => `${t("i_" + i.issueType)} · ${t("u_" + i.maxUrgency)}`} />
      </div>

      <div>
        <div className="mb-3 flex flex-wrap gap-2">
          <select className={sel} value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">{t("status")}: {t("all")}</option>
            {["new", "verified", "assigned", "resolved"].map((s) => <option key={s} value={s}>{t("s_" + s)}</option>)}
          </select>
          <select className={sel} value={issueType} onChange={(e) => setIssueType(e.target.value)}>
            <option value="">{t("issueType")}: {t("all")}</option>
            {ISSUES.map((s) => <option key={s} value={s}>{t("i_" + s)}</option>)}
          </select>
          <select className={sel} value={urgency} onChange={(e) => setUrgency(e.target.value)}>
            <option value="">{t("urgency")}: {t("all")}</option>
            {["high", "medium", "low"].map((s) => <option key={s} value={s}>{t("u_" + s)}</option>)}
          </select>
        </div>

        {items === null && [1, 2, 3].map((n) => <div key={n} className="mb-3 h-32 animate-pulse rounded-2xl bg-slate-200" />)}
        {items?.length === 0 && <p className="rounded-2xl bg-white p-6 text-center text-slate-500 shadow-sm">{t("noIncidents")}</p>}
        {items?.map((i) => (
          <div key={i.id} onClick={() => setSelected(i.id)}
            className={`mb-3 cursor-pointer rounded-2xl bg-white p-4 shadow-sm transition hover:shadow-md ${selected === i.id ? "ring-2 ring-teal-500" : ""}`}>
            <div className="flex items-start justify-between gap-2">
              <Link href={`/incidents/${i.id}`} onClick={(e) => e.stopPropagation()} className="font-semibold text-slate-900 hover:text-teal-700">
                {i.areaName} · {t("i_" + i.issueType)}
              </Link>
              <StatusBadge v={i.status} />
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              <UrgencyBadge v={i.maxUrgency} />
              <Pill className="bg-slate-100 text-slate-700">{t("reports")}: {i.totalReports}</Pill>
              <Pill className="bg-slate-100 text-slate-700">{t("peopleAtRisk")}: {i.peopleAtRiskTotal}</Pill>
              {i.assignedToTeam && <Pill className="bg-indigo-50 text-indigo-700">{t("assignedTo")}: {i.assignedToTeam}</Pill>}
            </div>
            <IncidentActions id={i.id} assignedToTeam={i.assignedToTeam} onChanged={load} />
          </div>
        ))}
      </div>
    </section>
  );
}
