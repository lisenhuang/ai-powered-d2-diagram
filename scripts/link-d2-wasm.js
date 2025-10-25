#!/usr/bin/env node
/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require("fs");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
const namespaceDir = path.join(projectRoot, "node_modules", "@terrastruct");
const sourceDir = path.join(namespaceDir, "d2", "dist", "node-esm");
const targetDir = path.join(namespaceDir, "wasm");

if (!fs.existsSync(sourceDir)) {
  console.warn(
    "[link-d2-wasm] Source directory not found, skipping (did you install dependencies?)",
  );
  process.exit(0);
}

try {
  if (fs.existsSync(targetDir)) {
    const stat = fs.lstatSync(targetDir);
    if (stat.isSymbolicLink() || stat.isDirectory()) {
      fs.rmSync(targetDir, { recursive: true, force: true });
    }
  }

  fs.symlinkSync(sourceDir, targetDir, "junction");
  console.log("[link-d2-wasm] Linked", targetDir, "->", sourceDir);
} catch (error) {
  console.warn("[link-d2-wasm] Failed to link", error);
  process.exitCode = 0;
}
