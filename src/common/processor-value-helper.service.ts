import { Injectable } from '@angular/core';
import { DeviceModel } from '../models/device.model';
import { SmartenitPlugin } from '../plugins/smartenit-plugin';

@Injectable()
export class ProcessorValueHelperService {
  /**
   * Build the description of the current value
   * @param device Device
   * @param componentId Id of the component
   * @param processorName Name of the processor
   * @param value Current value
   */
  getValueDescription(device: DeviceModel, componentId: string, processorName: string, value: any): string {
    if (!device || !componentId || !processorName || !value) {
      return '';
    }

    const plugin: SmartenitPlugin | null = device.getPlugin(componentId, processorName);
    return (plugin) ? plugin.getValueDescription(value) : '';
  }
}
