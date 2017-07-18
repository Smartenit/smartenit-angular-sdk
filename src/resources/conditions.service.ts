import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { DataQueryService } from "../common/data-query.service";
import { DatabaseService } from "../storage/database.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";
import { SyncService } from "../storage/sync.service";
import { ConditionModel } from "../models/condition.model";
import { HttpInterceptor } from "../common/http-interceptor.service";

@Injectable()
export class ConditionsService extends PersistentCRUDService {
  constructor(
    http: HttpInterceptor, authService: AuthService, public dbService: DatabaseService,
    syncService: SyncService, dataQueryService: DataQueryService, eventsService: EventsManagerService
  ) {
    super('conditions', http, authService, dbService, syncService, dataQueryService, eventsService);
  }

  createModel(data: any): ConditionModel {
    return new ConditionModel(this, data);
  }
}