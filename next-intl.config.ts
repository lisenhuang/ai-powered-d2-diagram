import { defineConfig } from "next-intl/config";
import { defaultLocale, localePrefix, locales } from "./src/i18n/config";

export default defineConfig({
  locales,
  defaultLocale,
  localePrefix,
});
