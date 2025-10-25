"use client";

import { useTransition } from "react";
import { Languages } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { localeLabels, type AppLocale, locales } from "@/i18n/config";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function LanguageSwitcher() {
  const t = useTranslations("common");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleLocaleChange(value: AppLocale) {
    if (value === locale || isPending) return;
    startTransition(() => {
      void persistLocale(value);
    });
  }

  async function persistLocale(value: AppLocale) {
    try {
      const response = await fetch("/api/locale", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ locale: value }),
      });

      if (!response.ok) {
        console.error("Failed to persist locale", await response.text());
        return;
      }
    } catch (error) {
      console.error("Failed to persist locale", error);
    } finally {
      router.refresh();
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon" aria-label={t("language")} disabled={isPending}>
          <Languages className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>{t("language")}</DropdownMenuLabel>
        {locales.map((value) => (
          <DropdownMenuItem
            key={value}
            disabled={isPending && value !== locale}
            className={value === locale ? "justify-between font-medium" : "justify-between"}
            onClick={() => handleLocaleChange(value)}
          >
            {localeLabels[value]}
            {value === locale ? "•" : null}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
