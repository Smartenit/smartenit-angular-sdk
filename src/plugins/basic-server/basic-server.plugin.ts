import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { Observable } from "rxjs/Observable";

export class BasicServerPlugin extends SmartenitPlugin {
  get stateTTL(): number {
    return 3600;
  }

  get hardwareVersion(): string {
    return this.state.firmwareVersion;
  }

  get softwareVersion(): string {
    return this.state.applicationVersion + '-' + this.state.stackVersion;
  }

  getHardwareVersion() {
    this.getAttributeWithSubscribeOption(this.componentId, this.processorName, 'HWVersion', null, false);
  }

  getSoftwareVersion() {
    this.getAttributeWithSubscribeOption(this.componentId, this.processorName, 'ApplicationVersion', null, false);
    this.getAttributeWithSubscribeOption(this.componentId, this.processorName, 'StackVersion', null, false);
  }

  getStatusPayload(): any {
    return ['HWVersion', 'ApplicationVersion', 'StackVersion'];
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const response = message && message.data && message.data.response;
    const attribute = message && message.attributeOrMethod;

    if (attribute === 'HWVersion') {
      this.state.hardwareVersion = response.value || '-';

      this._onUpdate.next({ state: this.state });
    } else if (attribute === 'ApplicationVersion') {
      this.state.applicationVersion = response.value || '-';

      this._onUpdate.next({ state: this.state });
    } else if (attribute === 'StackVersion') {
      this.state.stackVersion = response.value || '-';

      this._onUpdate.next({ state: this.state });
    }

    return this.state;
  }


}