"use client";

import useSWRMutation from "swr/mutation";
import type {
  DiagramFormat,
  DiagramRequestPayload,
} from "@/lib/validation";

export type DiagramResponse = {
  success: boolean;
  cacheKey: string;
  cached: boolean;
  format: DiagramFormat;
  mimeType: string;
  size: number;
  data: string;
  code: string;
  timings?: Record<string, number>;
};

async function requestDiagram(
  url: string,
  { arg }: { arg: DiagramRequestPayload },
): Promise<DiagramResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(arg),
  });

  const json = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(json.error ?? "Failed to generate diagram");
  }

  return json as DiagramResponse;
}

export function useDiagramMutation() {
  return useSWRMutation<DiagramResponse, Error, string, DiagramRequestPayload>(
    "/api/generate",
    requestDiagram,
    {
      revalidate: false,
      throwOnError: false,
    },
  );
}
