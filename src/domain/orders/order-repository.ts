import type { Order } from "./order";

/** Port: where orders are stored (in memory today, a database later). */
export interface OrderRepository {
  save(order: Order): Promise<void>;
  findById(id: string): Promise<Order | undefined>;
}
