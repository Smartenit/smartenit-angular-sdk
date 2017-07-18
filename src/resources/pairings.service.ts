import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { DataQueryService } from "../common/data-query.service";
import { DatabaseService } from "../storage/database.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";
import { SyncService } from "../storage/sync.service";
import { PairingModel } from "../models/pairing.model";
import { WebSocketsService } from "../websockets/websockets.service";
import { IWebSocketDeviceMessage } from "../websockets/websocket-device-message.interface";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { HttpInterceptor } from "../common/http-interceptor.service";

@Injectable()
export class PairingsService extends PersistentCRUDService {
  private _onPairingRefresh: Subject<any>;

  get onPairRefresh(): Observable<any> {
    return this._onPairingRefresh.asObservable();
  }

  constructor(
    http: HttpInterceptor, authService: AuthService, public dbService: DatabaseService,
    public webSocketsService: WebSocketsService,
    syncService: SyncService, dataQueryService: DataQueryService, eventsService: EventsManagerService
  ) {
    super('pairings', http, authService, dbService, syncService, dataQueryService, eventsService);
    this._onPairingRefresh = new Subject<any>();
    this.webSocketsService.onPairingsMessage.subscribe((message: IWebSocketDeviceMessage) => {
      if (message.resourceId == 'refresh') {
        this._onPairingRefresh.next({});
      }
    });
  }

  createModel(data: any): PairingModel {
    return new PairingModel(this, data, this.webSocketsService);
  }

  refresh(deviceId: string, ownerId: string): Observable<any> {
    return this.post("refresh", { deviceId, ownerId });
  }
}