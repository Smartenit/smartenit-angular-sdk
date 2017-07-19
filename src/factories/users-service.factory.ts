import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';
import { Oauth2Service } from '../resources/oauth-2.service';
import { DatabaseService } from '../storage/database.service';
import { SyncService } from '../storage/sync.service';
import { DataQueryService } from '../common/data-query.service';

import { UsersService } from '../resources/users.service';

export function UsersServiceFactory(
    http: HttpInterceptor,
    authService: AuthService,
    dbService: DatabaseService,
    syncService: SyncService,
    dataQueryService: DataQueryService,
    eventsService: EventsManagerService
) {
    return new UsersService(http, authService, dbService, syncService, dataQueryService, eventsService);
}