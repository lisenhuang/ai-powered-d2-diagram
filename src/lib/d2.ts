import { D2 } from "@terrastruct/d2";
import sharp from "sharp";
import type { DiagramFormat } from "./validation";

const MIME_BY_FORMAT: Record<DiagramFormat, string> = {
  svg: "image/svg+xml",
  png: "image/png",
};

const D2_THEME_BY_MODE: Record<"light" | "dark", number> = {
  light: 200,
  dark: 300,
};

const PAD_PIXELS = 30;
const d2 = new D2();

export async function renderDiagramWithD2(
  code: string,
  options: { format: DiagramFormat; theme: "light" | "dark" },
) {
  const themeID = D2_THEME_BY_MODE[options.theme];

  try {
    const compiled = await d2.compile({
      fs: { "diagram.d2": code },
      inputPath: "diagram.d2",
      options: {
        layout: "elk",
        pad: PAD_PIXELS,
        themeID,
      },
    });

    const svg = await d2.render(compiled.diagram, {
      ...compiled.renderOptions,
      themeID,
      pad: PAD_PIXELS,
    });

    const svgBuffer = Buffer.from(svg, "utf8");

    if (options.format === "svg") {
      return {
        buffer: svgBuffer,
        mimeType: MIME_BY_FORMAT.svg,
        bytes: svgBuffer.byteLength,
      };
    }

    const pngBuffer = await sharp(svgBuffer).png().toBuffer();

    return {
      buffer: pngBuffer,
      mimeType: MIME_BY_FORMAT.png,
      bytes: pngBuffer.byteLength,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Failed to render with D2 runtime: ${error.message}`
        : "Failed to render with D2 runtime",
    );
  }
}
