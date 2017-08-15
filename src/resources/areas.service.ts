import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { DataQueryService } from "../common/data-query.service";
import { DatabaseService } from "../storage/database.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";
import { SyncService } from "../storage/sync.service";
import { AreaModel } from "../models/area.model";
import { HttpInterceptor } from "../common/http-interceptor.service";
import { AppConfigurationService } from "../common/app-configuration.service";
import { DevicesService } from "../resources/devices.service";
import { PluginFactoryService } from "../plugins/plugin-factory.service";

@Injectable()
export class AreasService extends PersistentCRUDService {
  constructor(
    http: HttpInterceptor,
    authService: AuthService,
    dbService: DatabaseService,
    syncService: SyncService,
    dataQueryService: DataQueryService,
    eventsService: EventsManagerService,
    AppConfiguration: AppConfigurationService,
    public devicesService: DevicesService,
    public pluginFactory: PluginFactoryService
  ) {
    super('areas', http, authService, dbService, syncService, dataQueryService, eventsService, AppConfiguration);
  }

  createModel(data: any): AreaModel {
    return new AreaModel(
      data,
      this,
      this.devicesService,
      this.pluginFactory
    );
  }
}