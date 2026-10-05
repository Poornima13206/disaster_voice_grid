import { toSarvamCode } from "./languages";

const BASE = process.env.SARVAM_API_BASE_URL || "https://api.sarvam.ai";

export class SarvamError extends Error {}

export type StructuredIncident = {
  issueType: "rescue" | "medical" | "food" | "shelter" | "road" | "missing";
  urgency: "low" | "medium" | "high";
  peopleCount: number;
  vulnerableGroups: string[];
  resourceNeeded: string[];
  locationText: string;
  summaryEn: string;
  safetyAdvice: string;
};

async function sarvamFetch(path: string, init: RequestInit & { headers?: Record<string, string> }) {
  const key = process.env.SARVAM_API_KEY;
  if (!key) throw new SarvamError("SARVAM_API_KEY is not set on the server.");
  let res: Response;
  try {
    res = await fetch(`${BASE}${path}`, { ...init, headers: { "api-subscription-key": key, ...(init.headers || {}) } });
  } catch (e: any) {
    throw new SarvamError(`Could not reach Sarvam (${path}): ${e?.message}`);
  }
  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new SarvamError(`Sarvam ${path} failed (${res.status}): ${body.slice(0, 300)}`);
  }
  return res.json();
}

const jsonPost = (path: string, body: unknown) =>
  sarvamFetch(path, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });

/** Speech-to-text. language: app code (e.g. "kn") or omitted/"auto" for auto-detect. */
export async function transcribeAudio(audioBlob: Blob, language?: string): Promise<{ transcriptLocal: string; transcriptEn?: string }> {
  const type = (audioBlob.type || "audio/webm").split(";")[0];
  const ext = type.split("/")[1] || "webm";
  const form = new FormData();
  form.append("file", new Blob([await audioBlob.arrayBuffer()], { type }), `audio.${ext}`);
  form.append("model", "saarika:v2.5");
  form.append("language_code", !language || language === "auto" ? "unknown" : toSarvamCode(language));

  const data = await sarvamFetch("/speech-to-text", { method: "POST", body: form });
  const transcriptLocal: string = (data.transcript || "").trim();
  const detected: string = data.language_code || (language ? toSarvamCode(language) : "hi-IN");

  let transcriptEn: string | undefined;
  if (transcriptLocal && !detected.startsWith("en")) {
    try {
      transcriptEn = (await callTranslate(transcriptLocal, detected, "en-IN")).translatedText;
    } catch {
      transcriptEn = undefined; // English translation is optional
    }
  } else if (transcriptLocal) transcriptEn = transcriptLocal;
  return { transcriptLocal, transcriptEn };
}

const SYSTEM_PROMPT =
  "You are a disaster intake assistant. Given a transcript of a citizen's voice report, extract: issue_type, urgency, people_count, vulnerable_groups, resource_needed, location_text, summary_en, safety_advice. Output strict JSON.\n" +
  'Use exactly these keys: {"issue_type": one of rescue|medical|food|shelter|road|missing, "urgency": one of low|medium|high, "people_count": integer, "vulnerable_groups": string[] (e.g. elderly, children, pregnant, disabled), "resource_needed": string[] (e.g. boat, ambulance, food, blankets), "location_text": string in English/Latin script, "summary_en": one-sentence English summary, "safety_advice": one short English sentence}. Return ONLY the JSON object, no prose.';

export async function extractIncidentFromText(transcriptLocal: string, transcriptEn?: string): Promise<StructuredIncident> {
  const user = `Transcript (original): ${transcriptLocal}\n${transcriptEn ? `Transcript (English): ${transcriptEn}` : ""}`;
  const data = await jsonPost("/v1/chat/completions", {
    model: "sarvam-m",
    temperature: 0.1,
    max_tokens: 800,
    messages: [{ role: "system", content: SYSTEM_PROMPT }, { role: "user", content: user }],
  });
  let content: string = data?.choices?.[0]?.message?.content ?? "";
  content = content.replace(/<think>[\s\S]*?<\/think>/g, "").replace(/```json|```/g, "");
  const start = content.indexOf("{");
  const end = content.lastIndexOf("}");
  if (start < 0 || end < 0) throw new SarvamError("Sarvam chat did not return JSON.");
  let raw: any;
  try {
    raw = JSON.parse(content.slice(start, end + 1));
  } catch {
    throw new SarvamError("Sarvam chat returned invalid JSON.");
  }
  const issues = ["rescue", "medical", "food", "shelter", "road", "missing"];
  const urg = ["low", "medium", "high"];
  const arr = (v: any): string[] => (Array.isArray(v) ? v.map(String) : v ? [String(v)] : []);
  return {
    issueType: issues.includes(raw.issue_type) ? raw.issue_type : "rescue",
    urgency: urg.includes(raw.urgency) ? raw.urgency : "medium",
    peopleCount: Math.max(1, parseInt(raw.people_count, 10) || 1),
    vulnerableGroups: arr(raw.vulnerable_groups),
    resourceNeeded: arr(raw.resource_needed),
    locationText: String(raw.location_text || "Unknown location").trim(),
    summaryEn: String(raw.summary_en || transcriptEn || transcriptLocal).slice(0, 500),
    safetyAdvice: String(raw.safety_advice || ""),
  };
}

export async function synthesizeSpeech(text: string, language: string): Promise<{ audioUrl: string }> {
  const data = await jsonPost("/text-to-speech", {
    inputs: [text.slice(0, 500)],
    target_language_code: toSarvamCode(language),
    speaker: "anushka",
    model: "bulbul:v2",
  });
  const b64 = data?.audios?.[0];
  if (!b64) throw new SarvamError("Sarvam TTS returned no audio.");
  return { audioUrl: `data:audio/wav;base64,${b64}` };
}

async function callTranslate(text: string, fromCode: string, toCode: string) {
  const data = await jsonPost("/translate", {
    input: text.slice(0, 1000),
    source_language_code: fromCode,
    target_language_code: toCode,
    model: "mayura:v1",
  });
  if (!data?.translated_text) throw new SarvamError("Sarvam translate returned no text.");
  return { translatedText: data.translated_text as string };
}

/** from/to: app language codes (en, hi, kn, ...) */
export async function translateText(text: string, from: string, to: string): Promise<{ translatedText: string }> {
  return callTranslate(text, toSarvamCode(from), toSarvamCode(to));
}
