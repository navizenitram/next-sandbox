import type { ConfigurationError } from "@/domain/configuration/configuration";
import type { Money } from "@/domain/shared/money";
import type { OrderFormFieldErrors, OrderFormInput } from "./order-form-schema";

/** What the order Server Action returns to the form. */
export type OrderFormState =
  | { status: "idle" }
  | { status: "invalid"; fieldErrors: OrderFormFieldErrors; values: OrderFormInput }
  | { status: "rejected"; errors: ConfigurationError[]; values: OrderFormInput }
  | { status: "failed"; values: OrderFormInput }
  | { status: "placed"; reference: string; total: Money };
