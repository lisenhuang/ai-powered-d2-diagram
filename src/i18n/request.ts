import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { defaultLocale, locales, type AppLocale } from "./config";

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = (locale ?? defaultLocale) as AppLocale;

  if (!locales.includes(resolvedLocale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${resolvedLocale}.json`)).default;

  return {
    locale: resolvedLocale,
    messages,
  };
});
