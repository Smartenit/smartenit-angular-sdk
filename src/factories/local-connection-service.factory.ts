import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';
import { Oauth2Service } from '../resources/oauth-2.service';
import { DatabaseService } from '../storage/database.service';
import { SyncService } from '../storage/sync.service';
import { DataQueryService } from '../common/data-query.service';
import { DevicesService } from '../resources/devices.service';

import { LocalConnectionService } from '../common/local-connection.service';

export function LocalConnectionServiceFactory(
    http: HttpInterceptor,
    authService: AuthService,
    oauthService: Oauth2Service,
    devicesService: DevicesService,
    database: DatabaseService,
    eventsService: EventsManagerService
) {
    return new LocalConnectionService(http, authService, oauthService, devicesService, database, eventsService);
}