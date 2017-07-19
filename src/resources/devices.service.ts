import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from "rxjs/Observable";

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { DataQueryService } from "../common/data-query.service";
import { IRequestOptions } from "../common/request-options.interface";
import { DatabaseService } from "../storage/database.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";
import { SyncService } from "../storage/sync.service";
import { WebSocketsService } from "../websockets/websockets.service";
import { PluginFactoryService } from "../plugins/plugin-factory.service";
import { DeviceModel } from "../models/device.model";
import { HttpInterceptor } from "../common/http-interceptor.service";
import { AppConfigurationService } from "../common/app-configuration.service";

@Injectable()
export class DevicesService extends PersistentCRUDService {
  private static _devices: any = {};

  constructor(
    http: HttpInterceptor,
    authService: AuthService,
    public dbService: DatabaseService,
    public webSocketsService: WebSocketsService,
    public pluginFactory: PluginFactoryService,
    syncService: SyncService,
    dataQueryService: DataQueryService,
    eventsService: EventsManagerService,
    AppConfiguration: AppConfigurationService
  ) {
    super('devices', http, authService, dbService, syncService, dataQueryService, eventsService, AppConfiguration);
  }

  discover(discoverOnlyNewDevices?: boolean): Observable<any> {
    let payload: any = {};

    if (discoverOnlyNewDevices === true) {
      payload.onlyNewDevices = true;
    }

    return this.post('discover', payload).map((apiResponse) => {
      if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
        for (let i = 0; i < apiResponse.data.length; i++) {
          apiResponse.data[i] = this.createModel(apiResponse.data[i]);
        }
      }

      return apiResponse;
    });
  }

  link(deviceId: string): Observable<any> {
    return this.post('link', { deviceId: deviceId });
  }

  linkDevice(device: any): Observable<any> {
    return this.post('link', device);
  }

  createModel(data: any): DeviceModel {
    if (data.hasOwnProperty('_id') && DevicesService._devices.hasOwnProperty(data._id)) {
      let memoryDevice: DeviceModel = DevicesService._devices[data._id];
      memoryDevice.data = data;

      memoryDevice.loadBasicInfo(memoryDevice, data);
      memoryDevice.loadPluginsAndProcessors(memoryDevice, data);

      DevicesService._devices[data._id] = memoryDevice;

      return DevicesService._devices[data._id];
    } else {
      let newDevice = new DeviceModel(
        data,
        this,
        this.dbService,
        this.webSocketsService,
        this.pluginFactory
      );

      newDevice.data = data;

      DevicesService._devices[newDevice._id] = newDevice;
      return newDevice;
    }
  }

  removeFromLocalStorage(resourceId: string, removeData: any): Observable<any> {
    return super.removeFromLocalStorage(resourceId, removeData)
      .map((removeDataRes) => {
        const deviceToRemove: DeviceModel = DevicesService._devices[resourceId];
        if (deviceToRemove) {
          deviceToRemove.clearResources();
          delete DevicesService._devices[resourceId];
        }
        this.pluginFactory.removePluginsForDevice(resourceId);

        return removeDataRes;
      });
  }

  clearDevices() {
    Object.keys(DevicesService._devices).forEach(key => {
      DevicesService._devices[key].clearResources();
    });
    DevicesService._devices = {};
  }
}
