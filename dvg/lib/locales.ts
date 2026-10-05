import en from "@/locales/en.json";
import hi from "@/locales/hi.json";
import kn from "@/locales/kn.json";
import ta from "@/locales/ta.json";
import te from "@/locales/te.json";
import ml from "@/locales/ml.json";
import bn from "@/locales/bn.json";
import mr from "@/locales/mr.json";
import gu from "@/locales/gu.json";
import or from "@/locales/or.json";

export const dictionaries: Record<string, Record<string, string>> = { en, hi, kn, ta, te, ml, bn, mr, gu, or };
export function translate(lang: string, key: string): string {
  return dictionaries[lang]?.[key] ?? dictionaries.en[key] ?? key;
}
