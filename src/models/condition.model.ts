import { ConditionsService } from "../resources/conditions.service";
import { Model } from "../common/model";

export class ConditionModel extends Model {
  static readonly TIME_SUNSET = 'time-sunset';
  static readonly TIME_SUNRISE = 'time-sunrise';
  static readonly TIME_DEFAULT = 'time';
  static readonly TIME_RANDOM = 'time-random';
  static readonly TIME_WINDOW = 'time-window';
  static readonly TIME_INTERVAL = 'time-interval';
  static readonly DEVICE_STATE = 'device-state';

  static readonly SUNRISE = 'sunrise';
  static readonly SUNSET = 'sunset';

  static readonly CRONTAB = '#crontab';
  static readonly EQ = '#eq';

  private _name: string;

  get name(): string {
    return this._name;
  }

  get type(): string {
    return this._data.type;
  }

  set type(value: string) {
    this._data.type = value;
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
      if (split && split.length > 8 && split[7] == 'attrs') {
        return split[8];
      }
    }

    return null;
  }

  set description(value: string) {
    this._data.description = value;
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

  set name(value: string) {
    this._name = value;
  }

  get value(): any {
    return this._data.value;
  }

  set value(value: any) {
    this._data.value = value;
  }

  get days(): any {
    return this._data.days;
  }

  set days(value: any) {
    this._data.days = value;
  }

  constructor(protected conditionsService: ConditionsService, data: any) {
    super(conditionsService, data);
  }
}