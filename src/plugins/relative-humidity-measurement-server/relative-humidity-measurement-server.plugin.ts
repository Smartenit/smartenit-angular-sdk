import { SmartenitPlugin } from '../smartenit-plugin';
import { IWebSocketDeviceMessage } from '../../websockets/websocket-device-message.interface';
import { INumericValue } from "../../interfaces/numeric-value.interface";
import { ITextValue } from "../../interfaces/text-value.interface";
import { Observable } from 'rxjs/Observable';

export class RelativeHumidityMeasurementServerPlugin extends SmartenitPlugin implements INumericValue, ITextValue {

  get stateTTL(): number {
    return 2 * 60 * 1000;
  }

  onInit() {
    this.getCache()
      .subscribe(state => {
        if (state !== undefined) {
          this.state = state;
          this._onUpdate.next({ state });
        }
      });
  }

  getStatus(context?: string, subscribe?: boolean): any {
    context = 'MeasuredValue';
    this.getAttributeWithSubscribeOption(this.componentId, this.processorName, context, null, false);
  }

  setValue(value: number, attribute?: string, subscribe?: boolean): any {
    // Do nothing becase values are read only
    if (subscribe) {
      return Observable.of(true);
    }
    return true;
  }

  getValue(attribute?: string): number {
    let response: number = Number(this.state);
    return response;
  }

  getConditionAttribute(): string {
    return 'MeasuredValue';
  }

  getEffectAttribute(): string | null {
    return null;
  }

  getEffectMethod(context?: any): string | null {
    return null;
  }

  getUnit(attribute?: string): string {
    return '%';
  }

  getTextValue(context?: string) {
    return String(this.getValue()) + " " + this.getUnit();
  }

  getStatusPayload(): any {
    return ['MeasuredValue'];
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const response = message && message.data && message.data.response || {};
    const attributeOrMethod = message && message.attributeOrMethod;
    const value = response.value;

    if (attributeOrMethod === 'MeasuredValue') {
      const measuredValue = parseInt(value) / 100;
      this.state = Math.round(measuredValue);
      this._onUpdate.next({ state: measuredValue });
    }

    return this.state;
  }

  getRawValue(value: number, attribute?: string, method?: string): number {
    if (!attribute || attribute === 'MeasuredValue') {
      return this.pluginUtilsService.getValueByMultiplying(value, 100);
    } else {
      return value;
    }
  }

  getProcessedValue(value: any, attribute?: string, method?: string) {
    if (!attribute || attribute === 'MeasuredValue') {
      return this.pluginUtilsService.getValueByDividing(value, 100);
    } else {
      return value;
    }
  }
}