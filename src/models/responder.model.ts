import { Model } from "../common/model";
import { RespondersService } from "../resources/responders.service";

export class ResponderModel extends Model {
  constructor(
    protected respondersService: RespondersService, data: any
  ) {
    super(respondersService, data);
  }

  get path(): string {
    return this._data.path;
  }

  set path(value: string) {
    this._data.path = value;
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

  get parents(): any {
    return this._data.parents;
  }

  set parents(value: any) {
    this._data.parents = value;
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

  get delay(): number {
    return this._data.delay;
  }

  set delay(value: number) {
    this._data.delay = value;
  }

  get method(): string | null {
    if (this.path) {
      let split = this.path.split('/');
      if (split && split.length > 8 && split[7] == 'methods') {
        return split[8];
      }
    }

    return null;
  }

  get componentName(): string {
    return this._data.componentName;
  }

  set componentName(value: string) {
    this._data.componentName = value;
  }

  get description(): string {
    return this._data.description;
  }

  set description(value: string) {
    this._data.description = value;
  }

  get params(): any {
    return this._data.params;
  }

  set params(value: any) {
    this._data.params = value;
  }

  get ownerId(): string {
    return this._data.ownerId;
  }

  set ownerId(value: string) {
    this._data.ownerId = value;
  }
}
