import { Model } from "../common/model";
import { LocationsService } from "../resources/locations.service";

export class LocationModel extends Model {
  constructor(
    protected locationsService: LocationsService, data: any
  ) {
    super(locationsService, data);
  }
}