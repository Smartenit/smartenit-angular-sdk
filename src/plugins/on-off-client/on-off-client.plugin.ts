import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";

export class OnOffClientPlugin extends SmartenitPlugin {
  getEffectOptions(): any {
    return null
  }

  getEffectAttribute(): string | null {
    return null;
  }

  getEffectMethod(context?: any): string | null {
    return null;
  }

  getConditionOptions(): any {
    return [
      {
        name: 'Switch 1',
        method: {
          name: 'Toggle'
        },
        value: '1'
      },
      {
        name: 'Switch 2',
        method: {
          name: 'Toggle'
        },
        value: '2'
      },
      {
        name: 'Switch 3',
        method: {
          name: 'Toggle'
        },
        value: '3'
      }
    ];
  }

  getConditionAttribute(): string | null {
    return null;
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const attribute = message && message.attributeOrMethod;
    const supportedMethods = ['Off', 'On', 'Toggle', 'OffWEffect', 'OnWRecallGlobalScene', 'OnWTimedOff'];

    if (attribute && supportedMethods.indexOf(attribute) > -1) {
      // TODO handle received methods
    }

    return this.state;
  }
}