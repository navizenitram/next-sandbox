import type { ReactNode } from "react";
import type { Dictionary } from "@/i18n/dictionaries";

type FooterText = Dictionary["footer"];

export function TrustSignals({ t }: { t: FooterText }) {
  const signals: { key: string; icon: ReactNode; title: string; text: string }[] = [
    { key: "warranty", icon: <ShieldIcon />, ...t.warranty },
    { key: "shipping", icon: <TruckIcon />, ...t.shipping },
    { key: "payment", icon: <LockIcon />, ...t.payment },
  ];

  return (
    <section aria-labelledby="trust-heading">
      <h2 id="trust-heading" className="sr-only">
        {t.trustHeading}
      </h2>
      <ul className="grid gap-6 sm:grid-cols-3">
        {signals.map((signal) => (
          <li key={signal.key} className="flex gap-4">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-accent/10 text-accent">
              {signal.icon}
            </span>
            <div>
              <h3 className="font-semibold">{signal.title}</h3>
              <p className="mt-1 text-sm text-muted-foreground">{signal.text}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export function PaymentBadges({ t }: { t: FooterText }) {
  return (
    <ul aria-label={t.badgesLabel} className="flex flex-wrap gap-2">
      {[t.badges.card, t.badges.transfer, t.badges.ssl].map((badge) => (
        <li
          key={badge}
          className="rounded-md border border-border px-3 py-1 text-xs font-medium text-muted-foreground"
        >
          {badge}
        </li>
      ))}
    </ul>
  );
}

function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      aria-hidden="true"
      className="size-6"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {children}
    </svg>
  );
}

function ShieldIcon() {
  return (
    <Icon>
      <path d="M12 3l7 3v5c0 4.5-3 8.5-7 10-4-1.5-7-5.5-7-10V6l7-3z" />
      <path d="M9 12l2 2 4-4" />
    </Icon>
  );
}

function TruckIcon() {
  return (
    <Icon>
      <path d="M3 6h11v10H3zM14 10h4l3 3v3h-7z" />
      <circle cx="7" cy="17.5" r="1.8" />
      <circle cx="17" cy="17.5" r="1.8" />
    </Icon>
  );
}

function LockIcon() {
  return (
    <Icon>
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V7a4 4 0 0 1 8 0v4" />
    </Icon>
  );
}
