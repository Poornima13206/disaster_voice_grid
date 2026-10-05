export const LANGUAGES = [
  { code: "en", label: "English", sarvam: "en-IN" },
  { code: "hi", label: "हिन्दी", sarvam: "hi-IN" },
  { code: "kn", label: "ಕನ್ನಡ", sarvam: "kn-IN" },
  { code: "ta", label: "தமிழ்", sarvam: "ta-IN" },
  { code: "te", label: "తెలుగు", sarvam: "te-IN" },
  { code: "ml", label: "മലയാളം", sarvam: "ml-IN" },
  { code: "bn", label: "বাংলা", sarvam: "bn-IN" },
  { code: "mr", label: "मराठी", sarvam: "mr-IN" },
  { code: "gu", label: "ગુજરાતી", sarvam: "gu-IN" },
  { code: "or", label: "ଓଡ଼ିଆ", sarvam: "od-IN" }, // Sarvam uses "od-IN" for Odia
] as const;

export type LangCode = (typeof LANGUAGES)[number]["code"];
export const isSupported = (c: string): c is LangCode => LANGUAGES.some((l) => l.code === c);
export const toSarvamCode = (c: string) => LANGUAGES.find((l) => l.code === c)?.sarvam ?? "en-IN";
