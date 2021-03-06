import { EffectsService } from "../resources/effects.service";
import { Model } from "../common/model";

export class EffectModel extends Model {
  constructor(
    protected effectsService: EffectsService, data: any
  ) {
    super(effectsService, data);
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

  get componentName(): string {
    return this._data.componentName;
  }

  set componentName(value: string) {
    this._data.componentName = value;
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
      if (split && split.length > 8 && split[7] == 'attrs') {
        return split[8];
      }
    }

    return null;
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

  get delay(): number {
    return this._data.delay;
  }

  set delay(value: number) {
    this._data.delay = value;
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
}