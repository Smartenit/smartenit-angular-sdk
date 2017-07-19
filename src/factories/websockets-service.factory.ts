import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';
import { Oauth2Service } from '../resources/oauth-2.service';

import { WebSocketsService } from '../websockets/websockets.service';

export function WebSocketsServiceFactory(
    http: HttpInterceptor,
    authService: AuthService,
    oauthService: Oauth2Service,
    eventsService: EventsManagerService
) {
    return new WebSocketsService(http, authService, oauthService, eventsService);
}