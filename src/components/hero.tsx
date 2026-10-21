import Link from "next/link";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";

export function Hero({ locale, t }: { locale: Locale; t: Dictionary["home"]["hero"] }) {
  return (
    <section className="mx-auto grid w-full max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
      <div>
        <p className="text-sm font-semibold uppercase tracking-widest text-accent">{t.eyebrow}</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">{t.title}</h1>
        <p className="mt-6 max-w-prose text-lg text-pretty text-muted-foreground">{t.subtitle}</p>
        <div className="mt-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center sm:gap-5">
          <Link
            href={`/${locale}/configurator`}
            className="inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-base font-semibold text-accent-foreground shadow-sm transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            {t.cta}
            <span aria-hidden="true">→</span>
          </Link>
          <p className="text-sm text-muted-foreground">{t.note}</p>
        </div>
      </div>
      <div className="rounded-3xl bg-muted p-6 sm:p-10">
        <BikeIllustration label={t.imageAlt} />
      </div>
    </section>
  );
}

function BikeIllustration({ label }: { label: string }) {
  return (
    <svg viewBox="0 0 400 240" role="img" aria-label={label} className="h-auto w-full">
      <g fill="none" stroke="currentColor" strokeWidth="6" className="text-foreground/80">
        <circle cx="100" cy="170" r="58" />
        <circle cx="300" cy="170" r="58" />
      </g>
      <g fill="none" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" className="stroke-accent">
        <path d="M100 170 L190 170 L168 82 Z" />
        <path d="M168 82 L276 90 L190 170" />
        <path d="M276 90 L300 170" />
      </g>
      <g fill="none" stroke="currentColor" strokeWidth="6" strokeLinecap="round" className="text-foreground/80">
        <path d="M165 72 L168 82" />
        <path d="M148 68 L186 68" />
        <path d="M276 90 L284 66 L308 66" />
        <circle cx="190" cy="170" r="12" />
      </g>
    </svg>
  );
}
