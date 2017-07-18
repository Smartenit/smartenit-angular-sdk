import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { ITextValue } from "../../interfaces/text-value.interface";
import { INumericValue } from "../../interfaces/numeric-value.interface";
import { Observable } from "rxjs/Observable";

import "rxjs/add/observable/of";

export class ElectricalMeasurementServerPlugin extends SmartenitPlugin implements ITextValue, INumericValue {
  getUnit(attribute?: string): string {
    return 'W';
  }

  getActivePower(): string {
    return this.state.activePower;
  }

  getValue(attribute?: string): number {
    return Number(this.getActivePower());
  }

  getConditionAttribute(): string {
    return 'ActivePower';
  }

  getEffectAttribute(): string | null {
    return null;
  }

  getEffectMethod(context?: any): string | null {
    return null;
  }

  setValue(value: number, attribute?: string, subscribe?: boolean): any {
    // Do nothing becase values are read only

    if (subscribe) {
      return Observable.of(true);
    }

    return true;
  }

  getTextValue(context?: string): string {
    return this.getActivePower() + this.getUnit();
  }

  getStatusPayload(): any {
    return ['ActivePower'];
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const response = message && message.data && message.data.response;
    const attribute = message && message.attributeOrMethod;

    if (attribute === 'ActivePower') {
      this.state.activePower = response.value;
      this._onUpdate.next({ state: this.state });
    }

    return this.state;
  }
}