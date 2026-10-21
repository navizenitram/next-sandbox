"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/i18n/config";

/** Links to the current page in every other locale. */
export function LanguageSwitcher({ current, label }: { current: Locale; label: string }) {
  const pathname = usePathname();
  const rest = pathname.split("/").slice(2).join("/");

  return (
    <ul aria-label={label} className="flex items-center gap-1">
      {locales.map((locale) => (
        <li key={locale}>
          <Link
            href={`/${locale}${rest ? `/${rest}` : ""}`}
            hrefLang={locale}
            lang={locale}
            aria-current={locale === current ? "true" : undefined}
            className="rounded px-2 py-1 font-medium uppercase aria-[current]:bg-foreground aria-[current]:text-background"
          >
            {locale}
          </Link>
        </li>
      ))}
    </ul>
  );
}
