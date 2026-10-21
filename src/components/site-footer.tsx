import { getDictionary } from "@/i18n/dictionaries";
import { PaymentBadges, TrustSignals } from "./trust-signals";

export async function SiteFooter() {
  const dict = await getDictionary();
  return (
    <footer className="mt-auto border-t border-border bg-muted/50">
      <div className="mx-auto w-full max-w-6xl space-y-10 px-4 py-12">
        <TrustSignals t={dict.footer} />
        <div className="flex flex-col gap-4 border-t border-border pt-6 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {dict.meta.siteName}. {dict.footer.rights}
          </p>
          <PaymentBadges t={dict.footer} />
        </div>
      </div>
    </footer>
  );
}
