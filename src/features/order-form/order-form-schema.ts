import { z } from "zod";
import type { Configuration } from "@/domain/configuration/configuration";
import type { Customer } from "@/domain/orders/order";

/** Error codes, translated on the client. */
export const orderFormErrorCodes = [
  "required",
  "too-long",
  "invalid-email",
  "invalid-phone",
  "invalid-postal-code",
  "consent-required",
  "invalid",
] as const;

export type OrderFormErrorCode = (typeof orderFormErrorCodes)[number];

export const customerFields = ["name", "email", "phone", "street", "postalCode", "city", "province", "notes"] as const;

type CustomerField = (typeof customerFields)[number];

export type OrderFormField = CustomerField | "privacyConsent" | "configuration";

/** Raw order form values as submitted. */
export type OrderFormInput = Record<CustomerField | "privacyConsent" | "bikeTypeId", string | undefined> & {
  selections: Record<string, string>;
};

export type OrderFormFieldErrors = Partial<Record<OrderFormField, OrderFormErrorCode>>;

const text = (max: number) => z.string({ error: "required" }).trim().min(1, "required").max(max, "too-long");

const phonePattern = /^[+\d\s()-]+$/;
const digitCount = (value: string) => value.replace(/\D/g, "").length;

/** Spanish postal codes: 01000–52999 (market ES). */
const postalCodePattern = /^(0[1-9]|[1-4]\d|5[0-2])\d{3}$/;

const orderFormSchema = z.object({
  name: text(120),
  email: text(254).pipe(z.email("invalid-email")),
  phone: text(30).refine(
    (value) => phonePattern.test(value) && digitCount(value) >= 9 && digitCount(value) <= 15,
    "invalid-phone",
  ),
  street: text(200),
  postalCode: text(10).pipe(z.string().regex(postalCodePattern, "invalid-postal-code")),
  city: text(100),
  province: text(100),
  notes: z.string().trim().max(1000, "too-long").default(""),
  privacyConsent: z.literal("on", { error: "consent-required" }),
  bikeTypeId: z.string().min(1),
  selections: z.record(z.string().min(1), z.string().min(1)),
});

export type ParsedOrderForm =
  | { ok: true; data: { customer: Customer; configuration: Configuration } }
  | { ok: false; fieldErrors: OrderFormFieldErrors };

/** Validates the order form and maps it to the domain's customer and configuration. */
export function parseOrderForm(input: unknown): ParsedOrderForm {
  const result = orderFormSchema.safeParse(input);
  if (!result.success) {
    const fieldErrors: OrderFormFieldErrors = {};
    for (const issue of result.error.issues) {
      const path = String(issue.path[0]);
      const field = (path === "bikeTypeId" || path === "selections" ? "configuration" : path) as OrderFormField;
      const code = (orderFormErrorCodes as readonly string[]).includes(issue.message)
        ? (issue.message as OrderFormErrorCode)
        : "invalid";
      fieldErrors[field] ??= field === "configuration" ? "invalid" : code;
    }
    return { ok: false, fieldErrors };
  }

  const { name, email, phone, street, postalCode, city, province, notes, bikeTypeId, selections } = result.data;
  return {
    ok: true,
    data: {
      customer: { name, email, phone, address: { street, postalCode, city, province }, notes },
      configuration: { bikeTypeId, selections },
    },
  };
}

/** Reads the order form fields from FormData; selections come as `selection.<categoryId>` entries. */
export function orderFormInput(formData: FormData): OrderFormInput {
  const field = (name: string) => {
    const value = formData.get(name);
    return typeof value === "string" ? value : undefined;
  };
  const selections: Record<string, string> = {};
  for (const [key, value] of formData.entries()) {
    if (key.startsWith("selection.") && typeof value === "string") selections[key.slice("selection.".length)] = value;
  }
  return {
    ...(Object.fromEntries(customerFields.map((name) => [name, field(name)])) as Record<CustomerField, string | undefined>),
    privacyConsent: field("privacyConsent"),
    bikeTypeId: field("bikeTypeId"),
    selections,
  };
}
