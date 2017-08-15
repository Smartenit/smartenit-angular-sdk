import { Model } from "../common/model";
import { LocationsService } from "../resources/locations.service";
import { DevicesService } from "../resources/devices.service";
import { SmartenitPlugin } from "../plugins/smartenit-plugin";
import { PluginFactoryService } from "../plugins/plugin-factory.service";

export class LocationModel extends Model {
  private _processors: any;
  private _plugins: any;

  get plugins(): any {
    return this._plugins;
  }

  get processors(): any {
    return this._processors;
  }

  get settings(): any {
    return this._data.settings;
  }

  set settings(value: any) {
    this._data.settings = value;
  }

  getPlugin(processorName: string): SmartenitPlugin | null {
    const pluginKey: string = LocationModel.getPluginKey(processorName);

    if (this._plugins.hasOwnProperty(pluginKey)) {
      return this._plugins[pluginKey];
    }

    return null;
  }

  getComponent(): any {
    return {
      name: this.name,
      id: '1'
    }
  }

  constructor(
    data: any,
    protected locationsService: LocationsService,
    protected devicesService: DevicesService,
    public pluginFactory: PluginFactoryService
  ) {
    super(locationsService, data);

    this._processors = [];
    this._plugins = {};

    this.loadPluginsAndProcessors(this, data);
  }

  static getPluginKey(processorName: string) {
    return ['proc', processorName].join('_');
  }

  loadPluginsAndProcessors(locationInstance: LocationModel, data: any) {
    if (data && data.meta && data.meta.hasEnergyManagement === true) {
      const processorName = 'EnergyManagement';
      const componentId = '1';

      const energyPluginKey = LocationModel.getPluginKey(processorName);

      let energyPlugin = locationInstance.pluginFactory.createPlugin(processorName, componentId, processorName, locationInstance, this.devicesService);

      locationInstance._processors.push(energyPlugin);
      locationInstance._plugins[energyPluginKey] = energyPlugin;
    }
  }
}