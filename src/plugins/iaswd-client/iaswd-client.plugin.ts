import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";

export class IASWDClientPlugin extends SmartenitPlugin {

  onInit() {
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    return this.state;
  }

  getConditionOptions(): any {
    return [{
      name: 'Pressed',
      method: {
        name: 'Startwarning',
        attribute: 'Mode',
      },
      value: {
        '#bitmask': "0x0F"
      }
    }];
  }

  getConditionAttribute() {
    return null;
  }

  getEffectOptions(): any {
    return null;

  }

  getEffectAttribute(): string | null {
    return null;
  }

  getEffectMethod(context?: any): string | null {
    return null;
  }

}