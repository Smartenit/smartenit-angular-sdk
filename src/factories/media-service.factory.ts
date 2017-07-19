import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';

import { MediaService } from '../resources/media.service';

export function MediaServiceFactory(
    http: HttpInterceptor,
    authService: AuthService,
    eventsService: EventsManagerService
) {
    return new MediaService(http, authService, eventsService);
}