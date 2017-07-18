import { ActionsService } from "../resources/actions.service";
import { Model } from "../common/model";

export class ActionModel extends Model {
  get name(): string {
    return this._data.name;
  }

  set name(value: string) {
    this._data.name = value;
  }

  get expr(): any {
    return this._data.expr;
  }

  set expr(value: any) {
    this._data.expr = value;
  }

  get meta(): any {
    return this._data.meta;
  }

  set ownerId(value: any) {
    this._data.ownerId = value;
  }

  get ownerId(): any {
    return this._data.ownerId;
  }

  set meta(value: any) {
    this._data.meta = value;
  }

  constructor(protected actionsService: ActionsService, data: any) {
    super(actionsService, data);
  }
}