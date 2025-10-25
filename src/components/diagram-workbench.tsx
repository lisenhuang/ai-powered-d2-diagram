"use client";

import { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Download, LoaderCircle, PenLine, Sparkles, Copy } from "lucide-react";
import { useTheme } from "next-themes";
import { useForm, useWatch } from "react-hook-form";
import { useLocale, useTranslations } from "next-intl";
import { builderFormSchema, type BuilderFormValues } from "@/lib/validation";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useDiagramMutation, type DiagramResponse } from "@/hooks/use-diagram";
import { cn } from "@/lib/utils";
import { toast } from "@/hooks/use-toast";

export function DiagramWorkbench() {
  const t = useTranslations();
  const locale = useLocale();
  const { resolvedTheme, theme } = useTheme();
  const [result, setResult] = useState<DiagramResponse | null>(null);
  const { trigger, isMutating } = useDiagramMutation();

  const form = useForm<BuilderFormValues>({
    resolver: zodResolver(builderFormSchema),
    defaultValues: {
      mode: "ai",
      prompt: "",
      code: "",
      format: "svg",
    },
  });

  const currentMode =
    useWatch({
      control: form.control,
      name: "mode",
    }) ?? "ai";

  const formatOptions = useMemo(
    () => [
      { value: "svg", label: t("builder.formatSvg") },
      { value: "png", label: t("builder.formatPng") },
    ],
    [t],
  );

  async function onSubmit(values: BuilderFormValues) {
    const activeTheme = theme === "system" ? resolvedTheme : theme;
    const payload = {
      ...values,
      prompt: values.prompt?.trim(),
      code: values.code?.trim(),
      theme: activeTheme === "dark" ? "dark" : "light",
      locale,
    } as const;

    try {
      const data = await trigger(payload);
      if (data) {
        setResult(data);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : t("messages.aiError");
      const normalized = /OPENAI_API_KEY/i.test(message)
        ? t("messages.openaiMissing")
        : message;
      toast({
        title: t("common.appName"),
        description: normalized,
        variant: "destructive",
      });
    }
  }

  function handleReset() {
    form.reset();
    setResult(null);
  }

  async function handleCopy() {
    if (!result?.code) return;
    await navigator.clipboard.writeText(result.code);
    toast({ description: t("messages.copied") });
  }

  function handleDownload() {
    if (!result) return;
    const link = document.createElement("a");
    link.href = `data:${result.mimeType};base64,${result.data}`;
    link.download = `diagram.${result.format}`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast({ description: t("messages.downloadReady") });
  }

  const previewUrl = result
    ? `data:${result.mimeType};base64,${result.data}`
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,420px)]">
      <Card>
        <CardHeader>
          <CardTitle>{t("hero.title")}</CardTitle>
          <CardDescription>{t("hero.subtitle")}</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Tabs
                  value={currentMode}
                  onValueChange={(value) =>
                    form.setValue("mode", value as BuilderFormValues["mode"])
                  }
                >
                  <TabsList>
                    <TabsTrigger value="ai">
                      <Sparkles className="mr-2 h-4 w-4" />
                      {t("builder.tabs.ai")}
                    </TabsTrigger>
                    <TabsTrigger value="manual">
                      <PenLine className="mr-2 h-4 w-4" />
                      {t("builder.tabs.manual")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="ai">
                    <FormField
                      control={form.control}
                      name="prompt"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("builder.promptLabel")}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={6}
                              placeholder={t("builder.promptPlaceholder")}
                              disabled={isMutating && currentMode === "ai"}
                            />
                          </FormControl>
                          <FormDescription>{t("builder.aiHelper")}</FormDescription>
                          <FormMessage>
                            {form.formState.errors.prompt
                              ? t("validation.promptRequired")
                              : null}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  <TabsContent value="manual">
                    <FormField
                      control={form.control}
                      name="code"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>{t("builder.codeLabel")}</FormLabel>
                          <FormControl>
                            <Textarea
                              {...field}
                              rows={8}
                              placeholder={t("builder.codePlaceholder")}
                              disabled={isMutating && currentMode === "manual"}
                            />
                          </FormControl>
                          <FormDescription>{t("builder.manualHint")}</FormDescription>
                          <FormMessage>
                            {form.formState.errors.code
                              ? t("validation.codeRequired")
                              : null}
                          </FormMessage>
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="format"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("builder.formatLabel")}</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                        disabled={isMutating}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {formatOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value}>
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Button type="submit" disabled={isMutating}>
                  {isMutating ? (
                    <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />
                  ) : null}
                  {t("builder.submit")}
                </Button>
                <Button type="button" variant="ghost" onClick={handleReset}>
                  {t("builder.reset")}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card className="flex flex-col">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {t("builder.resultTitle")}
            {result?.cached ? (
              <Badge variant="secondary">{t("builder.cachedBadge")}</Badge>
            ) : null}
          </CardTitle>
          <CardDescription>
            {isMutating
              ? currentMode === "ai"
                ? `${t("builder.statusAI")}`
                : `${t("builder.statusD2")}`
              : result
                ? `${t("builder.createdAt")}: ${new Date().toLocaleTimeString()}`
                : t("builder.emptyState")}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex-1 space-y-4">
          <div
            className={cn(
              "flex min-h-[240px] items-center justify-center rounded-md border",
              !previewUrl && "border-dashed"
            )}
          >
            {previewUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={previewUrl}
                alt={t("builder.resultTitle")}
                className="max-h-[400px] w-full object-contain"
              />
            ) : (
              <p className="text-sm text-muted-foreground">
                {t("builder.emptyState")}
              </p>
            )}
          </div>

          {result ? (
            <div className="flex flex-wrap gap-2 text-sm text-muted-foreground">
              <span>
                {t("builder.formatLabel")}: {result.format.toUpperCase()}
              </span>
              <span>·</span>
              <span>
                {t("builder.sizeLabel")}: {(result.size / 1024).toFixed(1)} KB
              </span>
            </div>
          ) : null}
          {result?.code ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">{t("builder.codeTitle")}</p>
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={handleCopy}
                >
                  <Copy className="mr-2 h-4 w-4" />
                  {t("common.copy")}
                </Button>
              </div>
              <ScrollArea className="h-48 rounded-md border">
                <pre className="whitespace-pre-wrap p-3 text-sm font-mono">
                  {result.code}
                </pre>
              </ScrollArea>
            </div>
          ) : null}
        </CardContent>
        <CardFooter className="flex flex-wrap gap-3">
          <Button
            type="button"
            onClick={handleDownload}
            disabled={!result}
            variant="secondary"
          >
            <Download className="mr-2 h-4 w-4" />
            {t("builder.download")}
          </Button>
          <Button type="button" onClick={handleCopy} disabled={!result?.code} variant="outline">
            <Copy className="mr-2 h-4 w-4" />
            {t("common.copy")}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
