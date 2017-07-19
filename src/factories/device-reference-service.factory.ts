import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';
import { DatabaseService } from '../storage/database.service';

import { DeviceReferenceService } from '../common/device-reference.service';

export function DeviceReferenceServiceFactory(
    http: HttpInterceptor,
    authService: AuthService,
    dbService: DatabaseService,
    eventsService: EventsManagerService
) {
    return new DeviceReferenceService(http, authService, dbService, eventsService);
}