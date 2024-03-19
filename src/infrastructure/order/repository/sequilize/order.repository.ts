import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import OrderRepositoryInterface from "../../../../domain/checkout/repository/order-repository.interface";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";

export default class OrderRepository implements OrderRepositoryInterface {
  async create(entity: Order): Promise<void> {
    await OrderModel.create(
      {
        id: entity.id,
        customer_id: entity.customerId,
        total: entity.total(),
        items: entity.items.map(it => ({
          id: it.id,
          name: it.name,
          price: it.price,
          product_id: it.productId,
          quantity: it.quantity,
        })),
      },
      {
        include: [{ model: OrderItemModel }],
      }
    );
  }

  async update(entity: Order): Promise<void> {
    await OrderModel.sequelize.transaction(async (transaction) => {
      await OrderItemModel.destroy({
        where: { order_id: entity.id },
        transaction,
      });

      const items = entity.items.map(it => ({
        id: it.id,
        name: it.name,
        price: it.price,
        product_id: it.productId,
        quantity: it.quantity,
        order_id: entity.id,
      }));

      await OrderItemModel.bulkCreate(items, { transaction: transaction });

      await OrderModel.update(
        { total: entity.total() },
        { where: { id: entity.id }, transaction }
      );
    });
  }

  async find(id: string): Promise<Order> {
    try {
      return this.convertToEntity(
        await OrderModel.findOne({
          where: {
            id,
          },
          include: ["items"],
          rejectOnEmpty: true,
        })
      );
    } catch (error) {
      throw new Error("Order not found");
    }
  }

  async findAll(): Promise<Order[]> {
    const orderModels: OrderModel[] = await OrderModel.findAll({ include: [{ model: OrderItemModel }] });
    return orderModels.map(this.convertToEntity);
  }

  private convertToEntity(orderModel: OrderModel): Order {
    const items = orderModel.items.map(
      it =>
        new OrderItem(it.id, it.name, it.price, it.product_id, it.quantity)
    );
    return new Order(orderModel.id, orderModel.customer_id, items);
  }
}
