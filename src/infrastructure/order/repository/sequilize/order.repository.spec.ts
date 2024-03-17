import { Sequelize } from "sequelize-typescript";
import Order from "../../../../domain/checkout/entity/order";
import OrderItem from "../../../../domain/checkout/entity/order_item";
import Customer from "../../../../domain/customer/entity/customer";
import Address from "../../../../domain/customer/value-object/address";
import Product from "../../../../domain/product/entity/product";
import CustomerModel from "../../../customer/repository/sequelize/customer.model";
import CustomerRepository from "../../../customer/repository/sequelize/customer.repository";
import ProductModel from "../../../product/repository/sequelize/product.model";
import ProductRepository from "../../../product/repository/sequelize/product.repository";
import OrderItemModel from "./order-item.model";
import OrderModel from "./order.model";
import OrderRepository from "./order.repository";

describe("Order repository test", () => {
  let sequelize: Sequelize;

  beforeEach(async () => {
    sequelize = new Sequelize({
      dialect: "sqlite",
      storage: ":memory:",
      logging: false,
      sync: { force: true },
    });

    await sequelize.addModels([
      CustomerModel,
      OrderModel,
      OrderItemModel,
      ProductModel,
    ]);
    await sequelize.sync();
  });

  afterEach(async () => {
    await sequelize.close();
  });

  it("should create a new order", async () => {
    const customer: Customer = await createCustomer();
    const product: Product = await createProduct(
      new Product("123", "Product 1", 10)
    );

    const orderItem: OrderItem = createOrderItem("1", product, 2);

    const order = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: customer.id,
      total: order.total(),
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: product.id,
        },
      ],
    });
  });

  it("should update order", async () => {
    const customer: Customer = await createCustomer();
    const product1: Product = await createProduct(
      new Product("1", "Product 1", 10)
    );

    const orderItem: OrderItem = createOrderItem("1", product1, 2);

    const order = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: customer.id,
      total: 20,
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "1",
        },
      ],
    });

    const product2: Product = await createProduct(
      new Product("2", "Product 2", 20)
    );

    const orderItem2: OrderItem = createOrderItem("2", product2, 3);

    order.removeItem(orderItem.id);
    order.addItem(orderItem2);

    await orderRepository.update(order);

    const orderModelUpdated = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModelUpdated.toJSON()).toStrictEqual({
      id: "123",
      customer_id: customer.id,
      total: 60,
      items: [
        {
          id: orderItem2.id,
          name: orderItem2.name,
          price: orderItem2.price,
          quantity: orderItem2.quantity,
          order_id: order.id,
          product_id: product2.id,
        },
      ],
    });
  });

  it("should find an order", async () => {
    const customer: Customer = await createCustomer();
    const product1: Product = await createProduct(
      new Product("1", "Product 1", 10)
    );

    const orderItem: OrderItem = createOrderItem("1", product1, 2);

    const order = new Order("123", customer.id, [orderItem]);

    const orderRepository = new OrderRepository();
    await orderRepository.create(order);

    const orderModel = await OrderModel.findOne({
      where: { id: order.id },
      include: ["items"],
    });

    expect(orderModel.toJSON()).toStrictEqual({
      id: "123",
      customer_id: customer.id,
      total: 20,
      items: [
        {
          id: orderItem.id,
          name: orderItem.name,
          price: orderItem.price,
          quantity: orderItem.quantity,
          order_id: "123",
          product_id: "1",
        },
      ],
    });
  });

  it("should throw an error when order is not found", async () => {
    const orderRepository = new OrderRepository();

    expect(async () => {
      await orderRepository.find("456ABC");
    }).rejects.toThrow("Order not found");
  });

  it("should find all orders", async () => {
    const orderRepository = new OrderRepository();

    const customer: Customer = await createCustomer();
    const product1: Product = await createProduct(
      new Product("1", "Product 1", 10)
    );
    const product2: Product = await createProduct(
      new Product("2", "Product 2", 30)
    );

    const order1 = new Order("1", customer.id, [
      createOrderItem("1", product1, 2),
    ]);
    const order2 = new Order("2", customer.id, [
      createOrderItem("2", product2, 5),
    ]);

    await orderRepository.create(order1);
    await orderRepository.create(order2);

    const orders = await orderRepository.findAll();

    expect(orders).toHaveLength(2);
    expect(orders).toContainEqual(order1);
    expect(orders).toContainEqual(order2);
  });

  const createCustomer = async () => {
    const customer = new Customer(
      "123",
      "Customer 1",
      new Address("Street 1", 1, "Zipcode 1", "City 1")
    );
    await new CustomerRepository().create(customer);
    return customer;
  };

  const createProduct = async (product: Product) => {
    await new ProductRepository().create(product);
    return product;
  };

  const createOrderItem = (id: string, product: Product, quantity: number) => {
    return new OrderItem(id, product.name, product.price, product.id, quantity);
  };
});
