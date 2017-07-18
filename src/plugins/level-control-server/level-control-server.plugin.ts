import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { INumericValue } from "../../interfaces/numeric-value.interface";
import { OnOffPlugin } from '../on-off/on-off.plugin';

const CURRENT_LEVEL_MIN = 0;
const CURRENT_LEVEL_MAX = 254;

export class LevelControlServerPlugin extends SmartenitPlugin implements INumericValue {
  setValue(value: number, attribute?: string): any {
    value = Math.round(value * 2.55);

    const payload = {
      Level: value,
      TransitionTime: 0
    };

    setTimeout(() => {
      this.readDeviceOnOffStatus();
    }, 500);

    return this.executeMethod(this.componentId, this.processorName, 'MoveToLevelWOnOff', payload);
  }

  getUnit(attribute?: string): string {
    return '%';
  }

  getValue(attribute?: string): number {
    return this.state;
  }

  getConditionAttribute(): string {
    return 'CurrentLevel';
  }

  getEffectAttribute(): string | null {
    return null;
  }

  getEffectMethod(context?: any): string {
    return 'MoveToLevelWOnOff';
  }

  getEffectPayload(value: any, attribute?: string, method?: string) {
    return { Level: this.getRawValue(value, attribute, method), TransitionTime: 0 };
  }

  valueFromEffectPayload(payload: any, attribute?: string, method?: string) {
    const value = payload && payload['Level'] ? payload['Level'] : 50;
    return this.getProcessedValue(value, attribute, method);
  }

  getResponderAttribute(): string {
    return 'CurrentLevel';
  }

  getResponderMethod(): string | null {
    return null;
  }

  getStatusPayload(): any {
    return ['CurrentLevel'];
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const attribute = message && message.attributeOrMethod;

    if (attribute === 'CurrentLevel') {
      const response = message && message.data && message.data.response;

      let value = Number(response.value);
      this.state = value / 2.55;

      this._onUpdate.next({ state: this.state });
    }

    return this.state;
  }

  readDeviceOnOffStatus() {
    Object.keys(this.device.plugins)
      .map(key => this.device.plugins[key])
      .filter(plugin => plugin instanceof OnOffPlugin)
      .forEach((plugin: OnOffPlugin) => {
        plugin.device.getStatus(plugin.componentId, plugin.processorName, plugin.getStatusPayload(), 'cached=false');
      });
  }

  getRawValue(value: number, attribute?: string, method?: string): number {
    if (!attribute || attribute === 'CurrentLevel') {
      return this.pluginUtilsService.getValueFromPercentage(value, CURRENT_LEVEL_MIN, CURRENT_LEVEL_MAX);
    } else {
      return value;
    }
  }

  getProcessedValue(value: any, attribute?: string, method?: string) {
    if ((method && method.toLowerCase() === 'movetolevelwonoff') || !attribute || attribute === 'CurrentLevel') {
      return this.pluginUtilsService.getValueToPercentage(value, CURRENT_LEVEL_MIN, CURRENT_LEVEL_MAX);
    } else {
      return value;
    }
  }
}