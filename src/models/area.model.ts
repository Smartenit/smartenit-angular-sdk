import { Model } from "../common/model";
import { AreasService } from "../resources/areas.service";

export class AreaModel extends Model {
  constructor(protected areasService: AreasService, data: any) {
    super(areasService, data);
  }
}