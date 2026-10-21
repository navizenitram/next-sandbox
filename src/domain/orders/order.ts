import type { Configuration } from "@/domain/configuration/configuration";
import type { Quote } from "@/domain/pricing/pricing";

export type Address = Readonly<{ street: string; postalCode: string; city: string; province: string }>;

export type Customer = Readonly<{
  name: string;
  email: string;
  phone: string;
  address: Address;
  notes: string;
}>;

/** "lead": saved without payment. Payment statuses come with a payment adapter. */
export type OrderStatus = "lead";

export type Order = Readonly<{
  id: string;
  status: OrderStatus;
  createdAt: Date;
  customer: Customer;
  configuration: Configuration;
  /** Priced on the server when the order was placed. */
  quote: Quote;
}>;
