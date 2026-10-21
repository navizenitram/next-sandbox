import type { Order } from "@/domain/orders/order";
import type { OrderRepository } from "@/domain/orders/order-repository";

/** Order adapter that keeps orders in memory. They are lost on restart. */
export function createInMemoryOrderRepository(): OrderRepository {
  const orders = new Map<string, Order>();
  return {
    save: async (order) => {
      orders.set(order.id, order);
    },
    findById: async (id) => orders.get(id),
  };
}

const globalForOrders = globalThis as unknown as { orderRepository?: OrderRepository };
export const inMemoryOrderRepository = globalForOrders.orderRepository ?? createInMemoryOrderRepository();
if (process.env.NODE_ENV !== "production") globalForOrders.orderRepository = inMemoryOrderRepository;
