import { AbstractEvent } from "../../@shared/event/abstract-event";
import Customer from "../entity/customer";

export default class CustomerCreatedEvent extends AbstractEvent<Customer> {
  constructor(eventData: Customer) {
    super(eventData);
  }
}
