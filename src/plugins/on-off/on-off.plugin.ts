import { SmartenitPlugin } from "../smartenit-plugin";
import { IOnOff } from "../../interfaces/on-off.interface";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";

export class OnOffPlugin extends SmartenitPlugin implements IOnOff {
  on(): void {
    this.state = true;
    return this.executeMethod(this.componentId, this.processorName, 'On', null);
  }

  off(): void {
    this.state = false;
    return this.executeMethod(this.componentId, this.processorName, 'Off', null);
  }

  toggle(): void {
    // return this.executeMethod(this.componentId, this.processorName, 'Toggle', null);
    if (this.isOn()) {
      this.off();
    } else {
      this.on();
    }
  }

  isOn(): boolean {
    return this.state === true;
  }

  isOff(): boolean {
    return this.state === false;
  }

  getStatusPayload(): any {
    return ['OnOff'];
  }

  getEffectOptions(): any {
    return [{
      name: 'Turn On',
      value: {
        method: 'On'
      }
    },
    {
      name: 'Turn Off',
      value: {
        method: 'Off'
      }
    },
    {
      name: 'Toggle',
      value: {
        method: 'Toggle'
      }
    }];
  }

  getResponderOptions(): any {
    return [{
      name: 'Turn On',
      value: true
    },
    {
      name: 'Turn Off',
      value: false
    }];
  }

  getConditionOptions(): any {
    return [{
      name: 'Is On',
      value: 1
    },
    {
      name: 'Is Off',
      value: 0
    }];
  }

  getEffectAttribute(): string {
    return 'null';
  }

  getEffectMethod(context?: any): string | null {
    return null;
  }

  getConditionAttribute(): string {
    return 'OnOff';
  }

  getResponderAttribute(): string {
    return 'OnOff';
  }

  getResponderMethod(): string | null {
    return null;
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const attribute = message && message.attributeOrMethod;

    if (attribute === 'state' || attribute === 'OnOff') {
      const response = message && message.data && message.data.response;

      this.state = response.value === 'On' || response.value === true || response.value === 1;

      this._onUpdate.next({ state: this.state });
    }

    return this.state;
  }
}