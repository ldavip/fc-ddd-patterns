import { AbstractEvent } from "../../@shared/event/abstract-event";

export interface CustomerAddressChangedEventData {
  id: string;
  name: string;
  address: string;
}

export default class CustomerAddressChangedEvent extends AbstractEvent<CustomerAddressChangedEventData> {
  constructor(eventData: CustomerAddressChangedEventData) {
    super(eventData);
  }
}
