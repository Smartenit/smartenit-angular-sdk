import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { DataQueryService } from "../common/data-query.service";
import { DatabaseService } from "../storage/database.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";
import { SyncService } from "../storage/sync.service";
import { WizardModel } from "../models/wizard.model";
import { HttpInterceptor } from "../common/http-interceptor.service";
import { AppConfigurationService } from "../common/app-configuration.service";

@Injectable()
export class WizardsService extends PersistentCRUDService {
  constructor(
    http: HttpInterceptor, authService: AuthService, public dbService: DatabaseService,
    syncService: SyncService, dataQueryService: DataQueryService, eventsService: EventsManagerService,
    AppConfiguration: AppConfigurationService
  ) {
    super('wizards', http, authService, dbService, syncService, dataQueryService, eventsService, AppConfiguration);
  }

  createModel(data: any): WizardModel {
    return new WizardModel(this, data);
  }
}