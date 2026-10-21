import { Hero } from "@/components/hero";
import { getDictionary, getLocale } from "@/i18n/dictionaries";

export default async function Home() {
  const [locale, dict] = await Promise.all([getLocale(), getDictionary()]);
  return (
    <main className="flex-1">
      <Hero locale={locale} t={dict.home.hero} />
    </main>
  );
}
