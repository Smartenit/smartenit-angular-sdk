import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';
import { Oauth2Service } from '../resources/oauth-2.service';
import { DatabaseService } from '../storage/database.service';
import { SyncService } from '../storage/sync.service';
import { DataQueryService } from '../common/data-query.service';
import { WebSocketsService } from '../websockets/websockets.service';
import { PluginFactoryService } from '../plugins/plugin-factory.service';

import { DevicesService } from '../resources/devices.service';

export function DevicesServiceFactory(
    http: HttpInterceptor,
    authService: AuthService,
    dbService: DatabaseService,
    websocketsService: WebSocketsService,
    pluginFactoryService: PluginFactoryService,
    syncService: SyncService,
    dataQueryService: DataQueryService,
    eventsService: EventsManagerService
) {
    return new DevicesService(
        http, authService, dbService,
        websocketsService, pluginFactoryService,
        syncService, dataQueryService, eventsService
    );
}