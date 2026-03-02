import { createI18n } from "vue-i18n";
import zh from "./locales/zh.json";
import en from "./locales/en.json";

export const LOCALE_STORAGE_KEY = "app-locale";

function getInitialLocale(): "zh" | "en" {
  if (typeof localStorage === "undefined") return "zh";
  const saved = localStorage.getItem(LOCALE_STORAGE_KEY);
  return saved === "en" ? "en" : "zh";
}

const i18n = createI18n({
  legacy: false,
  locale: getInitialLocale(),
  fallbackLocale: "en",
  messages: { zh, en },
});

export function setLocale(locale: "zh" | "en"): void {
  const g = i18n.global as unknown as { locale: { value: string } };
  g.locale.value = locale;
  if (typeof localStorage !== "undefined") {
    localStorage.setItem(LOCALE_STORAGE_KEY, locale);
  }
}

export default i18n;
