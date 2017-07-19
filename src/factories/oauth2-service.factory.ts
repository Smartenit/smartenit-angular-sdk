import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';

import { Oauth2Service } from '../resources/oauth-2.service';

export function Oauth2ServiceFactory(
    http: HttpInterceptor,
    authService: AuthService,
    eventsService: EventsManagerService) {
    return new Oauth2Service(http, authService, eventsService);
}