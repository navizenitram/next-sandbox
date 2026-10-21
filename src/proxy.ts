import { NextResponse, type NextRequest } from "next/server";
import { locales, negotiateLocale } from "@/i18n/config";

/** Redirects paths without a locale prefix to the visitor's preferred locale. */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasLocalePrefix = locales.some((locale) => pathname === `/${locale}` || pathname.startsWith(`/${locale}/`));
  if (hasLocalePrefix) return;

  const locale = negotiateLocale(request.headers.get("accept-language"));
  const url = request.nextUrl.clone();
  url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Skip API routes, Next internals and files with an extension (favicon.ico, images…).
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
