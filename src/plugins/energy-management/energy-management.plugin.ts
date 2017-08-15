import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { ICondition } from "../../interfaces/condition.interface";

export class EnergyManagementPlugin extends SmartenitPlugin implements ICondition {
  getConditionOptions(): any {
    return null;
  }

  getConditionAttribute(): string {
    return 'PeriodCost';
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    return this.state;
  }
}