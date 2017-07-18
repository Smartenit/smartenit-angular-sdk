import { Model } from "../common/model";
import { WizardsService } from "../resources/wizards.service";

export class WizardModel extends Model {
  constructor(
    protected wizardsService: WizardsService, data: any
  ) {
    super(wizardsService, data);
  }
}