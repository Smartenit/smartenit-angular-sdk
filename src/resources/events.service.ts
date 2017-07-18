import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { DataQueryService } from "../common/data-query.service";
import { IRequestOptions } from "../common/request-options.interface";
import { DatabaseService } from "../storage/database.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";
import { SyncService } from "../storage/sync.service";
import { EventModel } from "../models/event.model";
import { HttpInterceptor } from "../common/http-interceptor.service";

@Injectable()
export class EventsService extends PersistentCRUDService {
  constructor(
    http: HttpInterceptor,
    authService: AuthService,
    public dbService: DatabaseService,
    syncService: SyncService,
    dataQueryService: DataQueryService,
    eventsManagerService: EventsManagerService
  ) {
    super('events', http, authService, dbService, syncService, dataQueryService, eventsManagerService);
  }

  createModel(data: any): EventModel {
    return new EventModel(this, data);
  }

  list(query?: any, options?: IRequestOptions): Observable<any> {
    return this.listFromBackend(query, options);
  }
}