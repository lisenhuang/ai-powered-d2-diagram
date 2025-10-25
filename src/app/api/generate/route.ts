import { NextResponse } from "next/server";
import { performance } from "perf_hooks";
import { getCachedDiagram, makeCacheKey, setCachedDiagram } from "@/lib/cache";
import { renderDiagramWithD2 } from "@/lib/d2";
import { promptToD2Code } from "@/lib/openai";
import { serverDiagramSchema } from "@/lib/validation";

export async function POST(request: Request) {
  let payload: unknown;

  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON payload" },
      { status: 400 },
    );
  }

  const result = serverDiagramSchema.safeParse(payload);

  if (!result.success) {
    return NextResponse.json(
      {
        error: "Invalid request",
        issues: result.error.issues,
      },
      { status: 400 },
    );
  }

  const { mode, prompt, code, format, theme, locale } = result.data;
  const timings: Record<string, number> = {};
  const start = performance.now();

  let diagramCode = (code ?? "").trim();

  if (mode === "ai") {
    const aiStart = performance.now();

    try {
      diagramCode = await promptToD2Code(prompt!.trim(), locale);
    } catch (error) {
      return NextResponse.json(
        {
          error: error instanceof Error ? error.message : "OpenAI request failed",
          code: "OPENAI_ERROR",
        },
        { status: 500 },
      );
    }

    timings.aiMs = Math.round(performance.now() - aiStart);
  }

  if (!diagramCode) {
    return NextResponse.json(
      { error: "No D2 code provided after processing." },
      { status: 422 },
    );
  }

  const cacheKey = makeCacheKey({
    code: diagramCode,
    format,
    theme,
  });

  const cached = getCachedDiagram(cacheKey);

  if (cached) {
    timings.totalMs = Math.round(performance.now() - start);

    return NextResponse.json({
      success: true,
      cacheKey,
      cached: true,
      format,
      mimeType: cached.mimeType,
      size: cached.bytes,
      data: cached.buffer.toString("base64"),
      code: diagramCode,
      timings,
    });
  }

  const renderStart = performance.now();

  try {
    const rendered = await renderDiagramWithD2(diagramCode, { format, theme });

    setCachedDiagram(cacheKey, {
      buffer: rendered.buffer,
      mimeType: rendered.mimeType,
      format,
      createdAt: Date.now(),
      bytes: rendered.bytes,
    });

    timings.renderMs = Math.round(performance.now() - renderStart);
    timings.totalMs = Math.round(performance.now() - start);

    return NextResponse.json({
      success: true,
      cacheKey,
      cached: false,
      format,
      mimeType: rendered.mimeType,
      size: rendered.bytes,
      data: rendered.buffer.toString("base64"),
      code: diagramCode,
      timings,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to render diagram",
        code: "D2_ERROR",
      },
      { status: 500 },
    );
  }
}
