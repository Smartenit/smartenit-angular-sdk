import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';
import { Oauth2Service } from '../resources/oauth-2.service';
import { DatabaseService } from '../storage/database.service';
import { SyncService } from '../storage/sync.service';
import { DataQueryService } from '../common/data-query.service';
import { WebSocketsService } from '../websockets/websockets.service';

import { ScenesService } from '../resources/scenes.service';

export function ScenesServiceFactory(
    http: HttpInterceptor,
    authService: AuthService,
    dbService: DatabaseService,
    webSocketsService: WebSocketsService,
    syncService: SyncService,
    dataQueryService: DataQueryService,
    eventsService: EventsManagerService
) {
    return new ScenesService(http, authService, dbService, webSocketsService, syncService, dataQueryService, eventsService);
}