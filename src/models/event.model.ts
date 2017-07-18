import { Model } from "../common/model";
import { EventsService } from "../resources/events.service";

export class EventModel extends Model {
  constructor(
    protected eventsService: EventsService, data: any
  ) {
    super(eventsService, data);
  }
}