import { Model } from "../common/model";
import { AreasService } from "../resources/areas.service";
import { DevicesService } from "../resources/devices.service";
import { SmartenitPlugin } from "../plugins/smartenit-plugin";
import { PluginFactoryService } from "../plugins/plugin-factory.service";

export class AreaModel extends Model {
  private _processors: any;
  private _plugins: any;

  get plugins(): any {
    return this._plugins;
  }

  get processors(): any {
    return this._processors;
  }

  constructor(
    data: any,
    protected areasService: AreasService,
    protected devicesService: DevicesService,
    public pluginFactory: PluginFactoryService
  ) {
    super(areasService, data);

    this._processors = [];
    this._plugins = {};

    this.loadPluginsAndProcessors(this, data);
  }

  getPlugin(processorName: string): SmartenitPlugin | null {
    const pluginKey: string = AreaModel.getPluginKey(processorName);

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

  static getPluginKey(processorName: string) {
    return ['proc', processorName].join('_');
  }

  loadPluginsAndProcessors(areaInstance: AreaModel, data: any) {
    if (data && data.meta && data.meta.hasEnergyManagement === true) {
      const processorName = 'EnergyManagement';
      const componentId = '1';

      const energyPluginKey = AreaModel.getPluginKey(processorName);

      let energyPlugin = areaInstance.pluginFactory.createPlugin(processorName, componentId, processorName, areaInstance, this.devicesService);

      areaInstance._processors.push(energyPlugin);
      areaInstance._plugins[energyPluginKey] = energyPlugin;
    }
  }
}