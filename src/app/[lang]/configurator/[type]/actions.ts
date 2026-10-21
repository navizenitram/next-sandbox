"use server";

import { placeOrder } from "@/domain/orders/place-order";
import type { OrderFormState } from "@/features/order-form/order-form-state";
import { orderFormInput, parseOrderForm } from "@/features/order-form/order-form-schema";
import { placeOrderDeps } from "@/server/container";

/** Validates the order form, then places the order. Returns error codes; the client translates them. */
export async function submitOrder(_previous: OrderFormState, formData: FormData): Promise<OrderFormState> {
  const input = orderFormInput(formData);
  const parsed = parseOrderForm(input);
  if (!parsed.ok) return { status: "invalid", fieldErrors: parsed.fieldErrors, values: input };

  try {
    const result = await placeOrder(parsed.data, placeOrderDeps);
    if (!result.ok) return { status: "rejected", errors: result.errors, values: input };
    return { status: "placed", reference: result.order.id, total: result.order.quote.grossTotal };
  } catch (error) {
    console.error("submitOrder failed", error);
    return { status: "failed", values: input };
  }
}
