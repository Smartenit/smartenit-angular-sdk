import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { Observable } from "rxjs/Observable";

const CACHE_TIME: number = 3600;

export class IASWDServerPlugin extends SmartenitPlugin {
  private _maxDuration: number;

  onInit() {
    this.getCacheZoneValues();
  }

  get maxDuration(): any {
    return this._maxDuration;
  }

  startWarning(duration: number = 240): void {
    const payload = { Mode: "0x71", Duration: duration, StrobeDutyCycle: 50, StrobeLevel: "0x01" };
    this.executeMethod(this.componentId, this.processorName, 'Startwarning', payload);
  }

  stopWarning(): void {
    const payload = { Mode: "0x00", Duration: 0, StrobeDutyCycle: 0, StrobeLevel: "0x00" };
    this.executeMethod(this.componentId, this.processorName, 'Startwarning', payload);
  }

  getStatusPayload(): any {
    return ['MaxDuration'];
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const attribute = message && message.attributeOrMethod;

    const response = message && message.data && message.data.response;

    if (attribute === 'MaxDuration') {
      this._maxDuration = response.value;
      this.setCache('MaxDuration', this._maxDuration, CACHE_TIME);
      this._onUpdate.next({ maxDuration: this._maxDuration });
    }

    return this.state;
  }

  private getCacheZoneValues() {
    let cacheValues = [
      this.getCache('MaxDuration'),
      this.getCache()
    ];

    Observable.forkJoin(cacheValues).subscribe((array) => {
      if (array && array[0] != null) {
        this._maxDuration = array[0];
      } else {
        this._maxDuration = 240;
      }

      if (array && array[1] != null) {
        this.state = array[1];
      } else {
        this.state = {};
      }

      this._onUpdate.next({
        maxDuration: this._maxDuration,
        state: this.state,
      });
    });
  }

  getMaxDuration() {
    this.getAttributeWithSubscribeOption(this.componentId, this.processorName, 'MaxDuration', {}, false);
  }

  getConditionOptions(): any {
    return null;
  }

  getConditionAttribute() {
    return null;
  }

  getEffectOptions(): any {
    return [{
      name: 'Start Warning',
      value: {
        method: 'Startwarning',
        payload: {
          Mode: "0x71",
          Duration: 240,
          StrobeDutyCycle: 50,
          StrobeLevel: "0x01"
        }
      },
      requireDuration: true,
      parameterKey: 'Duration'
    },
    {
      name: 'Stop Warning',
      value: {
        method: 'Startwarning',
        payload: {
          Mode: "0x00",
          Duration: 0,
          StrobeDutyCycle: 0,
          StrobeLevel: "0x00"
        }
      },
      requireDuration: false,
      parameterKey: 'Duration'
    }];
  }

  getEffectAttribute(): string | null {
    return null;
  }

  getEffectMethod(context?: any): string | null {
    return null;
  }

  isEffectActive(option: any, payload: any) {
    let mode = payload['Mode'] || "0xff";
    return ((option.name == 'Stop Warning' && mode == "0x00") || (option.name == 'Start Warning' && mode == "0x71"));
  }

}