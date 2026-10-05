import { NextRequest, NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { isSupported } from "@/lib/languages";
import { translate } from "@/lib/locales";
import { extractIncidentFromText, synthesizeSpeech, transcribeAudio } from "@/lib/sarvam";
import { upsertIncident } from "@/lib/incidents";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  let reportId: string | undefined;
  try {
    const form = await req.formData();
    const audio = form.get("audio");
    const language = String(form.get("language") || "en");
    const callerId = form.get("callerId") ? String(form.get("callerId")) : null;

    if (!(audio instanceof Blob) || audio.size === 0) return NextResponse.json({ error: "No audio received." }, { status: 400 });
    if (!isSupported(language)) return NextResponse.json({ error: "Unsupported language." }, { status: 400 });

    // Store audio as a data URL (demo only; use object storage in production)
    const buf = Buffer.from(await audio.arrayBuffer());
    const audioUrl = `data:${audio.type || "audio/webm"};base64,${buf.toString("base64")}`;
    const report = await prisma.report.create({ data: { callerId, audioUrl, language, status: "new" } });
    reportId = report.id;

    // 1. STT
    const { transcriptLocal, transcriptEn } = await transcribeAudio(audio, language);
    if (!transcriptLocal) throw new Error("No speech was detected. Please try again and speak clearly.");
    await prisma.report.update({ where: { id: report.id }, data: { transcriptLocal, transcriptEn } });

    // 2. Structured extraction
    const structured = await extractIncidentFromText(transcriptLocal, transcriptEn);

    // 3. Cluster into incident
    const incident = await upsertIncident(structured);
    await prisma.report.update({
      where: { id: report.id },
      data: { structuredData: structured as unknown as Prisma.InputJsonValue, incidentId: incident.id, status: "processed" },
    });

    // 4. Feedback text (pre-translated in locales) + TTS (degrades gracefully)
    const feedbackTextLocal = translate(language, "feedbackMessage");
    let feedbackAudioUrl: string | null = null;
    let warning: string | undefined;
    try {
      feedbackAudioUrl = (await synthesizeSpeech(feedbackTextLocal, language)).audioUrl;
    } catch (e: any) {
      warning = `Voice confirmation unavailable: ${e.message}`;
    }
    await prisma.report.update({
      where: { id: report.id },
      data: { feedbackTextLocal, feedbackAudioUrl, status: "feedback_sent" },
    });

    return NextResponse.json({ reportId: report.id, incidentId: incident.id, feedbackTextLocal, feedbackAudioUrl, warning });
  } catch (e: any) {
    console.error("POST /api/report", e);
    return NextResponse.json({ error: e?.message || "Something went wrong.", reportId }, { status: 502 });
  }
}
