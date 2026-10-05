"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { StatusBadge, UrgencyBadge, Pill } from "@/components/Badges";
import IncidentActions from "@/components/IncidentActions";

export default function IncidentDetail() {
  const { id } = useParams<{ id: string }>();
  const { t } = useI18n();
  const [inc, setInc] = useState<any>(null);
  const [err, setErr] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/incidents/${id}`, { cache: "no-store" });
    if (!res.ok) return setErr("Not found");
    setInc(await res.json());
  }, [id]);
  useEffect(() => { load(); }, [load]);

  if (err) return <p className="p-8 text-center text-red-600">{err}</p>;
  if (!inc) return <div className="mx-auto mt-8 h-48 max-w-3xl animate-pulse rounded-2xl bg-slate-200" />;
  const list = (v: unknown) => (Array.isArray(v) && v.length ? v.join(", ") : "—");

  return (
    <section className="mx-auto max-w-3xl px-4 py-6">
      <Link href="/dashboard" className="text-sm text-teal-700 hover:underline">← {t("back")}</Link>
      <div className="mt-3 rounded-2xl bg-white p-6 shadow">
        <div className="flex items-start justify-between gap-2">
          <h1 className="text-2xl font-bold">{inc.areaName} · {t("i_" + inc.issueType)}</h1>
          <StatusBadge v={inc.status} />
        </div>
        <p className="mt-1 text-slate-500">{inc.locationText}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          <UrgencyBadge v={inc.maxUrgency} />
          <Pill className="bg-slate-100 text-slate-700">{t("reports")}: {inc.totalReports}</Pill>
          <Pill className="bg-slate-100 text-slate-700">{t("peopleAtRisk")}: {inc.peopleAtRiskTotal}</Pill>
          {inc.assignedToTeam && <Pill className="bg-indigo-50 text-indigo-700">{t("assignedTo")}: {inc.assignedToTeam}</Pill>}
        </div>
        <p className="mt-3 text-sm text-slate-600">Vulnerable: {list(inc.vulnerableGroups)} · Resources: {list(inc.resourcesNeeded)}</p>
        <IncidentActions id={inc.id} assignedToTeam={inc.assignedToTeam} onChanged={load} />
      </div>

      <h2 className="mb-2 mt-6 text-lg font-semibold">{t("reports")}</h2>
      {inc.reports.length === 0 && <p className="text-slate-500">—</p>}
      {inc.reports.map((r: any) => (
        <div key={r.id} className="mb-3 rounded-2xl bg-white p-4 shadow-sm">
          <div className="flex justify-between text-xs text-slate-500">
            <span className="rounded bg-teal-50 px-2 py-0.5 font-medium uppercase text-teal-700">{r.language}</span>
            <span>{new Date(r.createdAt).toLocaleString()}</span>
          </div>
          <p className="mt-2">{r.transcriptLocal || "…"}</p>
          {r.transcriptEn && r.transcriptEn !== r.transcriptLocal && <p className="mt-1 text-sm italic text-slate-500">EN: {r.transcriptEn}</p>}
          {r.structuredData?.summaryEn && <p className="mt-2 text-sm text-slate-700">{t("summary")}: {r.structuredData.summaryEn}</p>}
        </div>
      ))}
    </section>
  );
}
