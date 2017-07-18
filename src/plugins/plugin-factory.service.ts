import { Injectable } from "@angular/core";
import { DatabaseService } from "../storage/database.service";
import { SmartenitPlugin } from "./smartenit-plugin";
import { OnOffPlugin } from "./on-off/on-off.plugin";
import { SimpleMeteringServerPlugin } from "./simple-metering-server/simple-metering-server.plugin";
import { ElectricalMeasurementServerPlugin } from "./electrical-measurement-server/electrical-measurement-server.plugin";
import { DoorLockPlugin } from "./door-lock-server/door-lock.plugin";
import { LevelControlServerPlugin } from "./level-control-server/level-control-server.plugin";
import { DiscoverPlugin } from "./discover/discover.plugin";
import { BasicServerPlugin } from "./basic-server/basic-server.plugin";
import { OnOffArrayServerPlugin } from "./on-off-array-server/on-off-array-server.plugin";
import { ThermostatServerPlugin } from './thermostat-server/thermostat-server.plugin';
import { OnOffClientPlugin } from "./on-off-client/on-off-client.plugin";
import { IASZoneServerPlugin } from "./iaszone-server/iaszone-server.plugin";
import { IASWDServerPlugin } from "./iaswd-server/iaswd-server.plugin";
import { IASWDClientPlugin } from "./iaswd-client/iaswd-client.plugin";
import { IASACEServerPlugin } from "./iasace-server/iasace-server.plugin";
import { NotificationServerPlugin } from "./notification-server/notification-server.plugin";
import { PowerConfigurationServerPlugin } from "./power-configuration-server/power-configuration-server.plugin";
import { TemperatureMeasurementServerPlugin } from "./temperature-measurement-server/temperature-measurement-server.plugin";
import { RelativeHumidityMeasurementServerPlugin } from "./relative-humidity-measurement-server/relative-humidity-measurement-server.plugin";
import { DeviceModel } from "../models/device.model";
import { ActionsService } from "../resources/actions.service";
import { EffectsService } from "../resources/effects.service";
import { ConditionsService } from "../resources/conditions.service";
import { DevicesService } from "../resources/devices.service";
import { PluginUtilsService } from "./plugin-utils.service";

const plugins: any = {
  'OnOffPlugin': OnOffPlugin,
  'OnOffClientPlugin': OnOffClientPlugin,
  'SimpleMeteringServerPlugin': SimpleMeteringServerPlugin,
  'LevelControlServerPlugin': LevelControlServerPlugin,
  'DiscoverPlugin': DiscoverPlugin,
  'BasicServerPlugin': BasicServerPlugin,
  'OnOffArrayServerPlugin': OnOffArrayServerPlugin,
  'ThermostatServerPlugin': ThermostatServerPlugin,
  'ElectricalMeasurementServerPlugin': ElectricalMeasurementServerPlugin,
  'IASZoneServerPlugin': IASZoneServerPlugin,
  'DoorLockServerPlugin': DoorLockPlugin,
  'PowerConfigurationServerPlugin': PowerConfigurationServerPlugin,
  'TemperatureMeasurementServerPlugin': TemperatureMeasurementServerPlugin,
  'RelativeHumidityMeasurementServerPlugin': RelativeHumidityMeasurementServerPlugin,
  'IASWDServerPlugin': IASWDServerPlugin,
  'IASACEServerPlugin': IASACEServerPlugin,
  'IASWDClientPlugin': IASWDClientPlugin,
  'NotificationServerPlugin': NotificationServerPlugin
};

@Injectable()
export class PluginFactoryService {
  private _plugins: any;

  constructor(
    public dbService: DatabaseService,
    public actionsService: ActionsService,
    public effectsService: EffectsService,
    public conditionsService: ConditionsService,
    public pluginUtilsService: PluginUtilsService
  ) {
    this._plugins = {};
  }

  private static getPluginKey(deviceId: string, componentId: string, processorName: string): string {
    return [deviceId, 'comp', componentId, 'proc', processorName].join('_');
  }

  createPlugin(
    pluginName: string, componentId: string, processorName: string, device: DeviceModel, devicesService: DevicesService
  ): SmartenitPlugin | null {
    const key = PluginFactoryService.getPluginKey(device._id, componentId, processorName);

    if (this._plugins.hasOwnProperty(key)) {
      return this._plugins[key];
    } else {
      if (plugins.hasOwnProperty(pluginName + 'Plugin')) {
        const pluginClass = plugins[pluginName + 'Plugin'];

        let newPlugin: SmartenitPlugin = new pluginClass(
          pluginName,
          componentId,
          processorName,
          device,
          this.dbService,
          devicesService,
          this.actionsService,
          this.conditionsService,
          this.effectsService,
          this.pluginUtilsService
        );

        this._plugins[key] = newPlugin;
        return newPlugin;
      }
    }

    return null;
  }

  removePluginsForDevice(deviceId: string) {
    this._plugins = Object.keys(this._plugins)
      .filter(key => !key.startsWith(deviceId))
      .reduce((obj: any, key: any) => {
        obj[key] = this._plugins[key];
        return obj;
      }, {});
  }

  clearPlugins() {
    this._plugins = {};
  }
}
