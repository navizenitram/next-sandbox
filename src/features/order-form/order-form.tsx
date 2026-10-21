"use client";

import { useActionState, type HTMLInputTypeAttribute } from "react";
import type { Catalogue } from "@/domain/catalogue/catalogue";
import type { Configuration } from "@/domain/configuration/configuration";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatMoney } from "@/i18n/format";
import type { OrderFormField } from "./order-form-schema";
import type { OrderFormState } from "./order-form-state";

type Props = {
  action: (state: OrderFormState, formData: FormData) => Promise<OrderFormState>;
  configuration: Configuration;
  catalogue: Catalogue;
  locale: Locale;
  t: Dictionary["orderForm"];
  configurationErrors: Dictionary["configurator"]["errors"];
};

const inputClass =
  "w-full rounded-lg border border-border bg-background px-3 py-2 outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/30 aria-invalid:border-red-600";

export function OrderForm({ action, configuration, catalogue, locale, t, configurationErrors }: Props) {
  const [state, formAction, pending] = useActionState(action, { status: "idle" });

  if (state.status === "placed") {
    return (
      <section role="status" className="rounded-2xl border border-accent/40 bg-accent/5 p-6">
        <h2 className="text-xl font-semibold">{t.placed.title}</h2>
        <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-6 gap-y-1">
          <dt className="text-muted-foreground">{t.placed.reference}</dt>
          <dd className="font-mono font-semibold">{state.reference}</dd>
          <dt className="text-muted-foreground">{t.placed.total}</dt>
          <dd className="font-semibold tabular-nums">{formatMoney(state.total, locale)}</dd>
        </dl>
        <p className="mt-4 text-muted-foreground">{t.placed.text}</p>
      </section>
    );
  }

  const values = state.status === "idle" ? undefined : state.values;
  const fieldErrors = state.status === "invalid" ? state.fieldErrors : {};
  const categoryName = (categoryId: string) =>
    catalogue.categories.find((category) => category.id === categoryId)?.name[locale];

  const field = (
    name: Exclude<OrderFormField, "privacyConsent" | "configuration" | "notes">,
    options: { type?: HTMLInputTypeAttribute; autoComplete: string; inputMode?: "numeric"; wide?: boolean },
  ) => {
    const error = fieldErrors[name];
    return (
      <div className={options.wide ? "sm:col-span-2" : undefined}>
        <label htmlFor={`order-${name}`} className="mb-1 block text-sm font-medium">
          {t.fields[name]}
        </label>
        <input
          id={`order-${name}`}
          name={name}
          type={options.type ?? "text"}
          autoComplete={options.autoComplete}
          inputMode={options.inputMode}
          required
          defaultValue={values?.[name] ?? ""}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `order-${name}-error` : undefined}
          className={inputClass}
        />
        {error && (
          <p id={`order-${name}-error`} className="mt-1 text-sm text-red-600">
            {t.errors[error]}
          </p>
        )}
      </div>
    );
  };

  return (
    <section aria-labelledby="order-heading" className="rounded-2xl border border-border p-5 sm:p-6">
      <h2 id="order-heading" className="text-xl font-semibold">
        {t.title}
      </h2>
      <p className="mt-1 text-sm text-muted-foreground">{t.subtitle}</p>

      {/* noValidate: the server validates and returns messages in the page's language. */}
      <form action={formAction} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
        <input type="hidden" name="bikeTypeId" value={configuration.bikeTypeId} />
        {Object.entries(configuration.selections).map(([categoryId, componentId]) => (
          <input key={categoryId} type="hidden" name={`selection.${categoryId}`} value={componentId} />
        ))}

        {field("name", { autoComplete: "name", wide: true })}
        {field("email", { type: "email", autoComplete: "email" })}
        {field("phone", { type: "tel", autoComplete: "tel" })}
        {field("street", { autoComplete: "street-address", wide: true })}
        {field("postalCode", { autoComplete: "postal-code", inputMode: "numeric" })}
        {field("city", { autoComplete: "address-level2" })}
        {field("province", { autoComplete: "address-level1", wide: true })}

        <div className="sm:col-span-2">
          <label htmlFor="order-notes" className="mb-1 block text-sm font-medium">
            {t.fields.notes}
          </label>
          <textarea
            id="order-notes"
            name="notes"
            rows={3}
            defaultValue={values?.notes ?? ""}
            aria-invalid={fieldErrors.notes ? true : undefined}
            aria-describedby={fieldErrors.notes ? "order-notes-error" : undefined}
            className={inputClass}
          />
          {fieldErrors.notes && (
            <p id="order-notes-error" className="mt-1 text-sm text-red-600">
              {t.errors[fieldErrors.notes]}
            </p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label className="flex items-start gap-3 text-sm">
            <input
              type="checkbox"
              name="privacyConsent"
              required
              defaultChecked={values?.privacyConsent === "on"}
              aria-invalid={fieldErrors.privacyConsent ? true : undefined}
              aria-describedby={fieldErrors.privacyConsent ? "order-consent-error" : undefined}
              className="mt-0.5 size-4 accent-accent"
            />
            {t.consent}
          </label>
          {fieldErrors.privacyConsent && (
            <p id="order-consent-error" className="mt-1 text-sm text-red-600">
              {t.errors[fieldErrors.privacyConsent]}
            </p>
          )}
        </div>

        <div aria-live="polite" className="sm:col-span-2 empty:hidden">
          {state.status === "invalid" && (
            <p className="rounded-lg bg-red-600/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              {fieldErrors.configuration ? t.errors[fieldErrors.configuration] : t.invalid}
            </p>
          )}
          {state.status === "rejected" && (
            <div className="rounded-lg bg-red-600/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">
              <p>{t.rejected}</p>
              <ul className="mt-2 list-disc pl-5">
                {state.errors.map((error, index) => (
                  <li key={index}>
                    {"categoryId" in error && `${categoryName(error.categoryId) ?? error.categoryId}: `}
                    {configurationErrors[error.code]}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {state.status === "failed" && (
            <p className="rounded-lg bg-red-600/10 px-4 py-3 text-sm text-red-700 dark:text-red-400">{t.failed}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-full bg-accent px-6 py-3 font-semibold text-accent-foreground transition hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:opacity-60 sm:w-auto"
          >
            {pending ? t.submitting : t.submit}
          </button>
        </div>
      </form>
    </section>
  );
}
