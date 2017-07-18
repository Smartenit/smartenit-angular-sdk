import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { DataQueryService } from "../common/data-query.service";
import { DatabaseService } from "../storage/database.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";
import { SyncService } from "../storage/sync.service";
import { SceneModel } from "../models/scene.model";
import { WebSocketsService } from "../websockets/websockets.service";
import { HttpInterceptor } from "../common/http-interceptor.service";

@Injectable()
export class ScenesService extends PersistentCRUDService {
  constructor(
    http: HttpInterceptor, authService: AuthService, public dbService: DatabaseService,
    public webSocketsService: WebSocketsService,
    syncService: SyncService, dataQueryService: DataQueryService, eventsService: EventsManagerService
  ) {
    super('scenes', http, authService, dbService, syncService, dataQueryService, eventsService);
  }

  createModel(data: any): SceneModel {
    return new SceneModel(this, data, this.webSocketsService);
  }
}