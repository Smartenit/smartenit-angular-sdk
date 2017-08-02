import { Model } from "../common/model";
import { LocationsService } from "../resources/locations.service";

export class LocationModel extends Model {
  get settings(): any {
    return this._data.expr;
  }

  set settings(value: any) {
    this._data.expr = value;
  }

  constructor(
    protected locationsService: LocationsService, data: any
  ) {
    super(locationsService, data);
  }
}