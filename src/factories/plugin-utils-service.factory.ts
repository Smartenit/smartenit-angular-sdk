import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';
import { Oauth2Service } from '../resources/oauth-2.service';
import { DatabaseService } from '../storage/database.service';
import { PluginUtilsService } from '../plugins/plugin-utils.service';

export function PluginUtilsServiceFactory() {
    return new PluginUtilsService();
}