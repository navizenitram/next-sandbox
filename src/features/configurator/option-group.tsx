import type { CategoryGroup } from "@/domain/catalogue/catalogue";
import { grossPriceOf } from "@/domain/pricing/pricing";
import type { Locale } from "@/i18n/config";
import type { Dictionary } from "@/i18n/dictionaries";
import { formatMoney } from "@/i18n/format";

type Props = {
  group: CategoryGroup;
  selectedId: string | null;
  onChoose: (categoryId: string, componentId: string | null) => void;
  locale: Locale;
  t: Dictionary["configurator"];
};

const optionClass =
  "flex cursor-pointer items-center gap-3 rounded-xl border border-border px-4 py-3 transition hover:border-foreground/40 has-checked:border-accent has-checked:bg-accent/5 has-disabled:cursor-not-allowed has-disabled:opacity-50 has-disabled:hover:border-border has-focus-visible:outline-2 has-focus-visible:outline-accent";

export function OptionGroup({ group, selectedId, onChoose, locale, t }: Props) {
  const { category, components } = group;
  const name = `category-${category.id}`;

  return (
    <fieldset className="rounded-2xl border border-border p-4 sm:p-5">
      <legend className="flex items-center gap-2 px-1 font-semibold">
        {category.name[locale]}
        <span className="rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
          {category.mandatory ? t.required : t.optional}
        </span>
      </legend>
      <div className="mt-2 grid gap-2">
        {components.map((component) => {
          const outOfStock = component.stock <= 0;
          return (
            <label key={component.id} className={optionClass}>
              <input
                type="radio"
                name={name}
                value={component.id}
                checked={selectedId === component.id}
                disabled={outOfStock}
                onChange={() => onChoose(category.id, component.id)}
                className="size-4 accent-accent focus:outline-none"
              />
              <span
                aria-hidden="true"
                className="size-4 shrink-0 rounded-full border border-foreground/20"
                style={{ backgroundColor: component.visual.colour }}
              />
              <span className="flex-1">{component.name[locale]}</span>
              {outOfStock ? (
                <span className="text-xs font-medium uppercase text-muted-foreground">{t.outOfStock}</span>
              ) : (
                <span className="text-sm font-medium tabular-nums">{formatMoney(grossPriceOf(component), locale)}</span>
              )}
            </label>
          );
        })}
        {!category.mandatory && (
          <label className={optionClass}>
            <input
              type="radio"
              name={name}
              value=""
              checked={selectedId === null}
              onChange={() => onChoose(category.id, null)}
              className="size-4 accent-accent focus:outline-none"
            />
            <span className="flex-1 text-muted-foreground">{t.none}</span>
          </label>
        )}
      </div>
    </fieldset>
  );
}
