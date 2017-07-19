import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';
import { Oauth2Service } from '../resources/oauth-2.service';
import { DatabaseService } from '../storage/database.service';
import { SyncService } from '../storage/sync.service';
import { DataQueryService } from '../common/data-query.service';

import { ConditionsService } from '../resources/conditions.service';

export function ConditionsServiceFactory(
    http: HttpInterceptor,
    authService: AuthService,
    dbService: DatabaseService,
    syncService: SyncService,
    dataQueryService: DataQueryService,
    eventsService: EventsManagerService
) {
    return new ConditionsService(http, authService, dbService, syncService, dataQueryService, eventsService);
}