import { Injector } from '@angular/core';
import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';
import { Oauth2Service } from '../resources/oauth-2.service';
import { WebSocketsService } from '../websockets/websockets.service';
import { DatabaseService } from '../storage/database.service';
import { DataQueryService } from '../common/data-query.service';

import { SyncService } from '../storage/sync.service';

export function SyncServiceFactory(
    http: HttpInterceptor,
    authService: AuthService,
    webSocketsService: WebSocketsService,
    dbService: DatabaseService,
    dataQueryService: DataQueryService,
    injector: Injector,
    eventsService: EventsManagerService
) {
    return new SyncService(http, authService, webSocketsService, dbService, dataQueryService, injector, eventsService);
}