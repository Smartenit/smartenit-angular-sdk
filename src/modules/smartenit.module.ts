import { NgModule, ModuleWithProviders } from '@angular/core';

import { AppConfiguration } from '../common/app-configuration';
import { ISmartenitConfig } from '../smartenit-config.interface';
import { EventsManagerService } from '../common/events-manager.service';
import { HttpInterceptor } from '../common/http-interceptor.service';
import { AuthService } from '../auth/auth.service';
import { Oauth2Service } from '../resources/oauth-2.service';
import { ResourcesProvider } from '../resources/resources.provider';
import { WebSocketsService } from '../websockets/websockets.service';
import { AreasService } from '../resources/areas.service';
import { StorageService } from '../storage/storage.service';
import { DatabaseService } from '../storage/database.service';
import { UsersService } from '../resources/users.service';
import { LocationsService } from '../resources/locations.service';
import { CategoriesService } from '../resources/categories.service';
import { DevicesService } from '../resources/devices.service';
import { EventsService } from '../resources/events.service';
import { ScenesService } from '../resources/scenes.service';
import { PairingsService } from '../resources/pairings.service';
import { MediaService } from '../resources/media.service';
import { WizardsService } from '../resources/wizards.service';
import { PluginFactoryService } from '../plugins/plugin-factory.service';
import { PluginUtilsService } from '../plugins/plugin-utils.service';
import { ActionsService } from '../resources/actions.service';
import { ConditionsService } from '../resources/conditions.service';
import { EffectsService } from '../resources/effects.service';
import { LocalConnectionService } from '../common/local-connection.service';
import { DataQueryService } from '../common/data-query.service';
import { DeviceReferenceService } from '../common/device-reference.service';
import { SyncService } from '../storage/sync.service';
import { GatewayConnectivityService } from '../common/gateway-connectivity.service';

const providers = [
    EventsManagerService,
    HttpInterceptor,
    AuthService,
    Oauth2Service,
    ResourcesProvider,
    WebSocketsService,
    AreasService,
    StorageService,
    DatabaseService,
    UsersService,
    LocationsService,
    CategoriesService,
    DevicesService,
    EventsService,
    ScenesService,
    PairingsService,
    MediaService,
    WizardsService,
    PluginFactoryService,
    PluginUtilsService,
    ActionsService,
    EffectsService,
    ConditionsService,
    DeviceReferenceService,
    LocalConnectionService,
    SyncService,
    DataQueryService,
    GatewayConnectivityService
];

@NgModule({
    declarations: [
        // Pipes.
        // Directives.
    ],
    exports: [
        // Pipes.
        // Directives.
    ]
})
export class SmartenitModule {

    static withConfig(config: ISmartenitConfig): ModuleWithProviders {
        AppConfiguration.initialConfig = config;

        return {
              ngModule: SmartenitModule,
              providers: providers
        };
    }

    /**
     * Use in AppModule: new instance of SumService.
     */
    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: SmartenitModule,
            providers: providers
        };
    }

    /**
     * Use in features modules with lazy loading: new instance of SumService.
     */
    public static forChild(): ModuleWithProviders {
        return {
            ngModule: SmartenitModule,
            providers: providers
        };
    }

}
