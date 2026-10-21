import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/dictionaries";
import { LanguageSwitcher } from "./language-switcher";

export async function SiteHeader() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <header className="border-b border-border">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href={`/${locale}`} className="text-lg font-semibold tracking-tight">
          {dict.meta.siteName}
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          <Link href={`/${locale}/configurator`} className="hover:underline">
            {dict.header.configurator}
          </Link>
          <LanguageSwitcher current={locale} label={dict.header.language} />
        </nav>
      </div>
    </header>
  );
}
