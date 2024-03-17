import EventInterface from "./event.interface";

export abstract class AbstractEvent<T> implements EventInterface {
  dataTimeOccurred: Date;
  eventData: T;

  constructor(eventData: T) {
    this.eventData = eventData;
    this.dataTimeOccurred = new Date();
  }
}
