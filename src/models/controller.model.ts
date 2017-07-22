import { Model } from "../common/model";
import { ControllersService } from "../resources/controllers.service";

export class ControllerModel extends Model {
  constructor(
    protected controllersService: ControllersService, data: any
  ) {
    super(controllersService, data);
  }

  get description(): string {
    return this._data.description;
  }

  get componentId(): string | null {
    if (this.path) {
      let split = this.path.split('/');
      if (split && split.length > 4) {
        return split[4];
      }
    }

    return null;
  }

  get processorName(): string | null {
    if (this.path) {
      let split = this.path.split('/');
      if (split && split.length > 6) {
        return split[6];
      }
    }

    return null;
  }

  get attribute(): string | null {
    if (this.path) {
      let split = this.path.split('/');
      if (split && split.length > 8) {
        return split[8];
      }
    }

    return null;
  }

  set description(value: string) {
    this._data.description = value;
  }

  get componentName(): string {
    return this._data.componentName;
  }

  set componentName(value: string) {
    this._data.componentName = value;
  }

  get parents(): any {
    return this._data.parents;
  }

  set parents(value: any) {
    this._data.parents = value;
  }

  get path(): string {
    return this._data.path;
  }

  set path(value: string) {
    this._data.path = value;
  }

  get value(): any {
    return this._data.value;
  }

  set value(value: any) {
    this._data.value = value;
  }

  get ownerId(): string {
    return this._data.ownerId;
  }

  set ownerId(value: string) {
    this._data.ownerId = value;
  }
}
