import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { IListValue } from "../../interfaces/list-value.interface";
import { FanModes } from "./fan-modes.enum";

const INIT_FAN_MODE: number = FanModes.AUTO;
const CACHE_TIME: number = 3600;

export class FanControlServerPlugin extends SmartenitPlugin implements IListValue {
  private _fanMode: any;

  setFanMode(mode: FanModes, subscribe?: boolean): any {
    this._fanMode = mode;

    return this.setAttributeWithSubscribeOption(this.componentId, this.processorName, 'FanMode', { value: mode }, subscribe || false);
  }

  getValue(attribute?: string): number {
    let value: any = null;

    switch (attribute) {
      case 'FanMode': value = this._fanMode; break;
    }

    return value;
  }

  getSelectedValues(): any[] {
    return [this._fanMode];
  }

  selectValue(option: any, subscribe?: boolean): any {
    this._fanMode = option;
    this._onUpdate.next({ FanMode: this._fanMode });

    return this.setFanMode(option, subscribe);
  }

  getCachedValues(subscribe?: boolean): any {
    let cacheValues = [
      this.getCache('FanMode')
    ];

    const observable = Observable.forkJoin(cacheValues).flatMap((array) => {
      if (array && array[0] != null) {
        this._fanMode = array[3];
      }

      this._onUpdate.next({
        FanMode: this._fanMode
      });

      return Observable.of(this._fanMode);
    });

    if (subscribe === true) {
      return observable;
    }

    let subscription: Subscription = observable.subscribe(() => subscription.unsubscribe());
  }

  getStatusPayload(): any {
    return ['FanMode'];
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const attribute = message && message.attributeOrMethod;

    if (attribute === 'FanMode') {
      const response = message && message.data && message.data.response;

      this._fanMode = parseInt(response.value);

      this.setCache('FanMode', this._fanMode, CACHE_TIME);

      this._onUpdate.next({ FanMode: this._fanMode });
    }

    return this.state;
  }
}
