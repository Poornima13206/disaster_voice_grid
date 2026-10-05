"use client";
import { useState } from "react";
import { useI18n } from "@/lib/i18n";

export default function IncidentActions({ id, assignedToTeam, onChanged }: { id: string; assignedToTeam?: string | null; onChanged: () => void }) {
  const { t } = useI18n();
  const [team, setTeam] = useState(assignedToTeam || "");
  const [busy, setBusy] = useState(false);

  async function act(action: "verify" | "assign" | "resolve") {
    setBusy(true);
    try {
      await fetch(`/api/incidents/${id}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(action === "assign" ? { assignedToTeam: team } : {}),
      });
      onChanged();
    } finally { setBusy(false); }
  }
  const btn = "rounded-lg px-3 py-1.5 text-sm font-medium disabled:opacity-50";
  return (
    <div className="mt-3 flex flex-wrap items-center gap-2" onClick={(e) => e.stopPropagation()}>
      <button disabled={busy} onClick={() => act("verify")} className={`${btn} bg-teal-600 text-white hover:bg-teal-700`}>{t("verify")}</button>
      <input value={team} onChange={(e) => setTeam(e.target.value)} placeholder={t("teamName")} className="w-32 rounded-lg border border-slate-300 px-2 py-1.5 text-sm" />
      <button disabled={busy || !team.trim()} onClick={() => act("assign")} className={`${btn} bg-indigo-600 text-white hover:bg-indigo-700`}>{t("assign")}</button>
      <button disabled={busy} onClick={() => act("resolve")} className={`${btn} bg-green-600 text-white hover:bg-green-700`}>{t("resolve")}</button>
    </div>
  );
}
