import { execFile } from "child_process";
import { mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";
import { promisify } from "util";
import type { DiagramFormat } from "./validation";

const execFileAsync = promisify(execFile);

const MIME_BY_FORMAT: Record<DiagramFormat, string> = {
  svg: "image/svg+xml",
  png: "image/png",
};

const D2_THEME_BY_MODE: Record<"light" | "dark", string> = {
  light: "200",
  dark: "300",
};

export async function renderDiagramWithD2(
  code: string,
  options: { format: DiagramFormat; theme: "light" | "dark" },
) {
  const dir = await mkdtemp(join(tmpdir(), "d2-diagram-"));
  const inputPath = join(dir, "source.d2");
  const outputPath = join(dir, `diagram.${options.format}`);

  await writeFile(inputPath, code, "utf8");

  const args = [
    "--layout",
    "elk",
    "--pad",
    "30",
    "--theme",
    D2_THEME_BY_MODE[options.theme],
    inputPath,
    outputPath,
  ];

  try {
    await execFileAsync("d2", args, {
      env: {
        ...process.env,
      },
    });

    const buffer = await readFile(outputPath);

    return {
      buffer,
      mimeType: MIME_BY_FORMAT[options.format],
      bytes: buffer.byteLength,
    };
  } catch (error) {
    throw new Error(
      error instanceof Error
        ? `Failed to run d2 CLI: ${error.message}`
        : "Failed to run d2 CLI",
    );
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
}
