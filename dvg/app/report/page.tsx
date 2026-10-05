"use client";
import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/lib/i18n";
import { LanguageSelect } from "@/components/Header";

type Phase = "idle" | "recording" | "uploading" | "processing" | "done" | "error";

export default function ReportPage() {
  const { lang, t } = useI18n();
  const [reportLang, setReportLang] = useState("en");
  const [phase, setPhase] = useState<Phase>("idle");
  const [error, setError] = useState("");
  const [result, setResult] = useState<any>(null);
  const recorder = useRef<MediaRecorder | null>(null);
  const chunks = useRef<Blob[]>([]);

  useEffect(() => setReportLang(lang), [lang]);

  async function start() {
    setError(""); setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/webm", "audio/mp4", "audio/ogg"].find((m) => MediaRecorder.isTypeSupported(m));
      const rec = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
      chunks.current = [];
      rec.ondataavailable = (e) => e.data.size && chunks.current.push(e.data);
      rec.onstop = () => {
        stream.getTracks().forEach((tr) => tr.stop());
        upload(new Blob(chunks.current, { type: rec.mimeType || "audio/webm" }));
      };
      rec.start();
      recorder.current = rec;
      setPhase("recording");
    } catch {
      setError(t("micDenied")); setPhase("error");
    }
  }

  const stop = () => recorder.current?.state === "recording" && recorder.current.stop();

  function upload(blob: Blob) {
    setPhase("uploading");
    const form = new FormData();
    form.append("audio", blob, "report.webm");
    form.append("language", reportLang);
    const xhr = new XMLHttpRequest();
    xhr.open("POST", "/api/report");
    xhr.upload.onload = () => setPhase("processing");
    xhr.onload = () => {
      let data: any = {};
      try { data = JSON.parse(xhr.responseText); } catch {}
      if (xhr.status >= 200 && xhr.status < 300) { setResult(data); setPhase("done"); }
      else { setError(data.error || t("errorGeneric")); setPhase("error"); }
    };
    xhr.onerror = () => { setError(t("errorGeneric")); setPhase("error"); };
    xhr.send(form);
  }

  const busy = phase === "uploading" || phase === "processing";
  return (
    <section className="mx-auto max-w-xl px-4 py-12">
      <div className="rounded-3xl bg-white p-8 text-center shadow-lg">
        <h1 className="text-2xl font-bold">{t("reportTitle")}</h1>
        <div className="mt-4 flex items-center justify-center gap-2 text-sm text-slate-600">
          <span>{t("language")}:</span>
          <LanguageSelect value={reportLang} onChange={setReportLang} />
        </div>

        <div className="my-10 flex flex-col items-center gap-4">
          {phase !== "recording" ? (
            <button onClick={start} disabled={busy} aria-label={t("tapToRecord")}
              className="flex h-32 w-32 items-center justify-center rounded-full bg-teal-600 text-5xl text-white shadow-xl transition hover:scale-105 hover:bg-teal-700 disabled:opacity-50">🎙️</button>
          ) : (
            <button onClick={stop} aria-label={t("stop")} className="relative flex h-32 w-32 items-center justify-center rounded-full bg-red-600 text-white shadow-xl">
              <span className="absolute inset-0 animate-ping rounded-full bg-red-400 opacity-60" />
              <span className="relative h-10 w-10 rounded-md bg-white" />
            </button>
          )}
          <p className="text-slate-600">
            {phase === "idle" && t("tapToRecord")}
            {phase === "recording" && <span className="font-semibold text-red-600">{t("recording")} — {t("stop")}</span>}
            {phase === "uploading" && t("uploading")}
            {phase === "processing" && t("processing")}
          </p>
          {busy && <div className="h-8 w-8 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600" />}
        </div>

        {phase === "done" && result && (
          <div className="rounded-2xl bg-green-50 p-5 text-left text-green-900">
            <p className="font-semibold">✅ {t("reportReceived")}</p>
            <p className="mt-1 text-sm">{result.feedbackTextLocal}</p>
            {result.feedbackAudioUrl && <audio className="mt-3 w-full" controls autoPlay src={result.feedbackAudioUrl} />}
            {result.warning && <p className="mt-2 text-xs text-amber-700">{result.warning}</p>}
            <p className="mt-3 text-xs text-green-700">{t("reportId")}: {result.reportId}</p>
            <button onClick={() => setPhase("idle")} className="mt-3 rounded-lg bg-teal-600 px-4 py-2 text-sm font-medium text-white">{t("newReport")}</button>
          </div>
        )}
        {phase === "error" && (
          <div className="rounded-2xl bg-red-50 p-5 text-left text-red-800">
            <p className="font-semibold">⚠️ {t("errorGeneric")}</p>
            <p className="mt-1 break-words text-sm">{error}</p>
            <button onClick={() => setPhase("idle")} className="mt-3 rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white">{t("tryAgain")}</button>
          </div>
        )}
      </div>
    </section>
  );
}
