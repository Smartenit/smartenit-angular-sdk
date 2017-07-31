import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { ThermostatModes } from "./thermostat-modes.enum";
import { ThermostatFanModes } from "./thermostat-fan-modes.enum";
import { INumericValue } from "../../interfaces/numeric-value.interface";
import { Observable } from "rxjs/Observable";
import "rxjs/add/operator/mergeMap";
import { Subscription } from 'rxjs/Subscription';
import { ITextValue } from "../../interfaces/text-value.interface";
import { IListValue } from "../../interfaces/list-value.interface";

const INIT_COOLING: number = 10;
const INIT_HEATING: number = 20;
const INIT_MODE: number = ThermostatModes.AUTO;
const INIT_FAN_MODE: number = ThermostatFanModes.AUTO;
const CACHE_TIME: number = 3600;

export class ThermostatServerPlugin extends SmartenitPlugin implements INumericValue, ITextValue, IListValue {
  private _mode: any;
  private _fanMode: any;
  private _temperature: number;
  private _desiredCoolingTemperature: number;
  private _desiredHeatingTemperature: number;

  setMode(mode: ThermostatModes, subscribe?: boolean): any {
    this._mode = mode;

    return this.setAttributeWithSubscribeOption(this.componentId, this.processorName, 'SystemMode', { value: mode }, subscribe || false);
  }

  setFanMode(mode: ThermostatFanModes, subscribe?: boolean): any {
    this._fanMode = mode;

    return this.setAttributeWithSubscribeOption(this.componentId, this.processorName, 'FanMode', { value: mode }, subscribe || false);
  }

  getValue(attribute?: string): number {
    let value: any = null;
    switch (attribute) {
      case 'OccupiedCoolingSetpoint': value = this._desiredCoolingTemperature; break;
      case 'OccupiedHeatingSetpoint': value = this._desiredHeatingTemperature; break;
      case 'SystemMode': value = this._mode; break;
      case 'FanMode': value = this._fanMode; break;
    }

    return value;
  }

  getUnit(attribute?: string): string {
    let value: string = '';

    switch (attribute) {
      case 'OccupiedCoolingSetpoint': value = 'ºC'; break;
      case 'OccupiedHeatingSetpoint': value = 'ºC'; break;
      case 'LocalTemperature': value = 'ºC'; break;
      case 'SystemMode': value = ''; break;
    }

    return value;
  }

  getTextValue(): string {
    const temperatureUnit = 'ºC';
    const temperature = Math.floor(this._temperature);
    return this._temperature ? temperature.toString() + temperatureUnit : '';
  }

  getConditionAttribute(): string {
    return 'SystemMode';
  }

  getConditionOptions(): any {
    return [
      {
        name: 'Off',
        value: 0
      },
      {
        name: 'Auto',
        value: 1,
      },
      {
        name: 'Heat',
        value: 4,
      },
      {
        name: 'Cool',
        value: 3,
      }
    ];
  }

  getEffectOptions(): any {
    return [
      {
        name: 'Off',
        value: 0
      },
      {
        name: 'Auto',
        value: 1,
      },
      {
        name: 'Heat',
        value: 4,
      },
      {
        name: 'Cool',
        value: 3,
      }
    ];
  }

  getEffectAttribute(): string {
    return 'SystemMode';
  }

  getEffectMethod(context?: any): string | null {
    return null;
  }

  setValue(value: number, attribute?: string, subscribe?: boolean): any {
    switch (attribute) {
      case 'OccupiedCoolingSetpoint':
        this._desiredCoolingTemperature = value;
        this.setAttributeWithSubscribeOption(this.componentId, this.processorName, 'OccupiedCoolingSetpoint', { value: this._desiredCoolingTemperature * 100 }, subscribe || false);
        break;
      case 'OccupiedHeatingSetpoint':
        this._desiredHeatingTemperature = value;
        this.setAttributeWithSubscribeOption(this.componentId, this.processorName, 'OccupiedHeatingSetpoint', { value: this._desiredHeatingTemperature * 100 }, subscribe || false);
        break;
    }
  }

  getStatus(context?: string, force?: boolean, subscribe?: boolean, payload?: any): void {
    if (context === 'OccupiedCoolingSetpoint') {
      this.getCache('OccupiedCoolingSetpoint').subscribe((cached: any) => {
        if (cached == null) {
          this.getAttributeWithSubscribeOption(this.componentId, this.processorName, 'OccupiedCoolingSetpoint', null, false);
        } else {
          this._desiredCoolingTemperature = cached;
          this._onUpdate.next({ OccupiedCoolingSetpoint: this._desiredCoolingTemperature });
        }
      });
    } else if (context === 'OccupiedHeatingSetpoint') {
      this.getCache('OccupiedHeatingSetpoint').subscribe((cached: any) => {
        if (cached == null) {
          this.getAttributeWithSubscribeOption(this.componentId, this.processorName, 'OccupiedHeatingSetpoint', null, false);
        } else {
          this._desiredHeatingTemperature = cached;
          this._onUpdate.next({ OccupiedHeatingSetpoint: this._desiredHeatingTemperature });
        }
      });
    } else {
      return super.getStatus(context, subscribe, force, payload);
    }
  }

  getSelectedValues(context?: string): any[] {
    return (!context || context === 'SystemMode') ? [this._mode] : [this._fanMode];
  }

  selectValue(option: any, subscribe?: boolean, context?: string): any {
    if (!context || context === 'SystemMode') {
      this._mode = option;
      this._onUpdate.next({ mode: this._mode });

      return this.setMode(option, subscribe);
    } else {
      this._fanMode = option;
      this._onUpdate.next({ FanMode: this._fanMode });

      return this.setFanMode(option, subscribe);
    }
  }

  getCachedValues(subscribe?: boolean): any {
    let cacheValues = [
      this.getCache('OccupiedCoolingSetpoint'),
      this.getCache('OccupiedHeatingSetpoint'),
      this.getCache('SystemMode'),
      this.getCache('FanMode'),
      this.getCache()
    ];

    const observable = Observable.forkJoin(cacheValues).flatMap((array) => {
      if (array && array[0] != null) {
        this._desiredCoolingTemperature = array[0];
      }

      if (array && array[1] != null) {
        this._desiredHeatingTemperature = array[1];
      }

      if (array && array[2] != null) {
        this._mode = array[2];
      }

      if (array && array[3] != null) {
        this._fanMode = array[3];
      }

      if (array && array[4] != null) {
        this._temperature = array[4];
      }

      if (this._temperature != null) {
        this.device.cached = true;
      }

      this._onUpdate.next({
        SystemMode: this._mode,
        FanMode: this._fanMode,
        OccupiedHeatingSetpoint: this._desiredHeatingTemperature,
        OccupiedCoolingSetpoint: this._desiredCoolingTemperature,
        temperature: this._temperature
      });

      return Observable.of(this._temperature);
    });

    if (subscribe === true) {
      return observable;
    }

    let subscription: Subscription = observable.subscribe(() => subscription.unsubscribe());
  }

  getStatusPayload(): any {
    return ['LocalTemperature', 'SystemMode', 'OccupiedCoolingSetpoint', 'OccupiedHeatingSetpoint'];
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const attribute = message && message.attributeOrMethod;

    if (attribute === 'LocalTemperature') {
      const response = message && message.data && message.data.response;

      this._temperature = response.value / 100;
      this.state = this._temperature;

      this._onUpdate.next({ temperature: this._temperature });
    } else if (attribute === 'SystemMode') {
      const response = message && message.data && message.data.response;

      this._mode = parseInt(response.value);

      this.setCache('SystemMode', this._mode, CACHE_TIME);

      this._onUpdate.next({ SystemMode: this._mode });
    } else if (attribute === 'FanMode') {
      const response = message && message.data && message.data.response;

      this._fanMode = parseInt(response.value);

      this.setCache('FanMode', this._fanMode, CACHE_TIME);

      this._onUpdate.next({ FanMode: this._fanMode });
    } else if (attribute === 'OccupiedCoolingSetpoint') {
      const response = message && message.data && message.data.response;

      this._desiredCoolingTemperature = response.value / 100;

      this.setCache('OccupiedCoolingSetpoint', this._desiredCoolingTemperature, CACHE_TIME);

      this._onUpdate.next({ OccupiedCoolingSetpoint: this._desiredCoolingTemperature });
    } else if (attribute === 'OccupiedHeatingSetpoint') {
      const response = message && message.data && message.data.response;

      this._desiredHeatingTemperature = response.value / 100;

      this.setCache('OccupiedHeatingSetpoint', this._desiredHeatingTemperature, CACHE_TIME);

      this._onUpdate.next({ OccupiedHeatingSetpoint: this._desiredHeatingTemperature });
    }

    return this.state;
  }

  getRawValue(value: number, attribute?: string, method?: string): number {
    if (!attribute || attribute === 'LocalTemperature' ||
      attribute === 'OccupiedCoolingSetpoint' || attribute === 'OccupiedHeatingSetpoint') {
      return this.pluginUtilsService.getValueByMultiplying(value, 100);
    } else {
      return value;
    }
  }

  getProcessedValue(value: any, attribute?: string, method?: string) {
    if (!attribute || attribute === 'LocalTemperature' ||
      attribute === 'OccupiedCoolingSetpoint' || attribute === 'OccupiedHeatingSetpoint') {
      return this.pluginUtilsService.getValueByDividing(value, 100);
    } else {
      return value;
    }
  }
}