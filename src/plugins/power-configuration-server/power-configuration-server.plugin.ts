import { SmartenitPlugin } from '../smartenit-plugin';
import { IWebSocketDeviceMessage } from '../../websockets/websocket-device-message.interface';
import { INumericValue } from "../../interfaces/numeric-value.interface";
import { Observable } from 'rxjs/Observable'

const BATTERY_PERCENTAGE_REMAINING_MIN = 0;
const BATTERY_PERCENTAGE_REMAINING_MAX = 255;

export class PowerConfigurationServerPlugin extends SmartenitPlugin implements INumericValue {

  onInit() {
    this.state.batteryPercentageRemaining = 0;

    this.getCache('battery_percentage_remaining')
      .subscribe(percentage => {
        if (percentage !== undefined) {
          this.state.batteryPercentageRemaining = percentage;
        }
      });
  }

  getValue(attribute?: string): number {
    let response: number = Number(this.state.batteryPercentageRemaining);
    return response;
  }

  setValue(value: number, attribute?: string, subscribe?: boolean): any {
    // Do nothing becase values are read only
    if (subscribe) {
      return Observable.of(true);
    }
    return true;
  }

  getConditionAttribute(): string {
    return 'BatteryPercentageRemaining';
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

  getConditionOptions(): any {
    return null;
  }

  getEffectOptions(): any {
    return null;
  }

  getStatus(context?: string, subscribe?: boolean): any {
    this.getCache('battery_percentage_remaining').subscribe((percentage: any) => {
      if (percentage == null) {
        this.getAttributeWithSubscribeOption(this.componentId, this.processorName,
          'BatteryPercentageRemaining', null, false);
      } else {
        this.state.batteryPercentageRemaining = percentage;
        this._onUpdate.next(percentage);
      }
    });
  }

  getStatusPayload(): any {
    return ['BatteryPercentageRemaining'];
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const response = message && message.data && message.data.response;
    const attributeOrMethod = message && message.attributeOrMethod;
    const value = response.value;

    if (attributeOrMethod === 'BatteryPercentageRemaining') {
      const percentage = parseInt(value) / 2;
      this.setCache('battery_percentage_remaining', percentage, 3600);
      this.state.batteryPercentageRemaining = percentage;
      this._onUpdate.next(percentage);
    }

    return this.state;
  }

  getRawValue(value: number, attribute?: string, method?: string): number {
    if (!attribute || attribute === 'BatteryPercentageRemaining') {
      return this.pluginUtilsService.getValueFromPercentage(value, BATTERY_PERCENTAGE_REMAINING_MIN, BATTERY_PERCENTAGE_REMAINING_MAX);
    } else {
      return value;
    }
  }

  getProcessedValue(value: any, attribute?: string, method?: string) {
    if (!attribute || attribute === 'BatteryPercentageRemaining') {
      return this.pluginUtilsService.getValueToPercentage(value, BATTERY_PERCENTAGE_REMAINING_MIN, BATTERY_PERCENTAGE_REMAINING_MAX);
    } else {
      return value;
    }
  }
}