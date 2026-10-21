import type { Order } from "@/domain/orders/order";

/** Where to send the customer to pay. */
export type PaymentSession = Readonly<{ id: string; orderId: string; redirectUrl: string }>;

/**
 * Port for the payment provider, still to be chosen. Interface only: no adapter
 * exists and nothing calls it yet. A provider is added as one new adapter.
 */
export interface PaymentGateway {
  createPayment(order: Order): Promise<PaymentSession>;
}
