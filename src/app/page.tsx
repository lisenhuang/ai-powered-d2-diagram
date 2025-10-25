import { getTranslations } from "next-intl/server";
import { DiagramWorkbench } from "@/components/diagram-workbench";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Separator } from "@/components/ui/separator";

export default async function Home() {
  const tHero = await getTranslations("hero");
  const tCommon = await getTranslations("common");

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 lg:py-16">
      <header className="space-y-4 rounded-xl border bg-card/60 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm text-muted-foreground">{tCommon("appName")}</p>
            <h1 className="text-2xl font-semibold leading-tight tracking-tight">
              {tHero("title")}
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <LanguageSwitcher />
            <ThemeToggle />
          </div>
        </div>
        <p className="text-sm text-muted-foreground">{tHero("subtitle")}</p>
        <Separator />
        <div className="text-xs text-muted-foreground">
          GPT-4.1 · D2 CLI · Next.js · SWR
        </div>
      </header>

      <DiagramWorkbench />
    </div>
  );
}
