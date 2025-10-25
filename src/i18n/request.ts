import { notFound } from "next/navigation";
import { getRequestConfig } from "next-intl/server";
import { locales, type AppLocale } from "./config";

export default getRequestConfig(async ({ locale }) => {
  const resolvedLocale = (locale ?? "en") as AppLocale;

  if (!locales.includes(resolvedLocale)) {
    notFound();
  }

  const messages = (await import(`../../messages/${resolvedLocale}.json`)).default;

  return {
    messages,
  };
});
