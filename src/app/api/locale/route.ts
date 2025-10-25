import { NextResponse } from "next/server";
import { locales, type AppLocale } from "@/i18n/config";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const nextLocale = body?.locale as AppLocale | undefined;

  if (!nextLocale || !locales.includes(nextLocale)) {
    return NextResponse.json({ error: "Invalid locale" }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });
  response.cookies.set("NEXT_LOCALE", nextLocale, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return response;
}
