import type { NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { defaultLocale, localePrefix, locales } from "@/i18n/config";

const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix,
});

export default function middleware(request: NextRequest) {
  const response = intlMiddleware(request);

  const rewriteTarget = response.headers.get("x-middleware-rewrite");
  if (rewriteTarget) {
    let rewritten: URL;
    try {
      rewritten = new URL(rewriteTarget, request.nextUrl);
    } catch {
      rewritten = request.nextUrl.clone();
      rewritten.pathname = rewriteTarget;
    }

    const normalizedPath = rewritten.pathname.replace(/^\/(en|zh)(?=\/|$)/, "") || "/";

    if (normalizedPath !== rewritten.pathname) {
      rewritten.pathname = normalizedPath;
      response.headers.set("x-middleware-rewrite", rewritten.toString());
    }
  }

  return response;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
