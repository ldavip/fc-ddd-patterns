import { AbstractEvent } from "../../@shared/event/abstract-event";

export interface ProductCreatedEventData {
  name: string;
  description: string;
  price: number;
}

export default class ProductCreatedEvent extends AbstractEvent<ProductCreatedEventData> {
  constructor(eventData: ProductCreatedEventData) {
    super(eventData);
  }
}
