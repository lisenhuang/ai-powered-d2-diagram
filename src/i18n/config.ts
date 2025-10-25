export const locales = ["en", "zh"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "en";
export const localePrefix = "never";

export const localeLabels: Record<AppLocale, string> = {
  en: "English",
  zh: "中文",
};
