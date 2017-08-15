import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { DataQueryService } from "../common/data-query.service";
import { DatabaseService } from "../storage/database.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";
import { SyncService } from "../storage/sync.service";
import { DevicesService } from "../resources/devices.service";
import { PluginFactoryService } from "../plugins/plugin-factory.service";
import { LocationModel } from "../models/location.model";
import { HttpInterceptor } from "../common/http-interceptor.service";
import { AppConfigurationService } from "../common/app-configuration.service";

@Injectable()
export class LocationsService extends PersistentCRUDService {
  constructor(
    http: HttpInterceptor, authService: AuthService, public dbService: DatabaseService,
    syncService: SyncService, dataQueryService: DataQueryService, eventsManagerService: EventsManagerService,
    AppConfiguration: AppConfigurationService, public devicesService: DevicesService, public pluginFactory: PluginFactoryService,
  ) {
    super('locations', http, authService, dbService, syncService, dataQueryService, eventsManagerService, AppConfiguration);
  }

  createModel(data: any): LocationModel {
    return new LocationModel(
      data,
      this,
      this.devicesService,
      this.pluginFactory
    )
  }
}