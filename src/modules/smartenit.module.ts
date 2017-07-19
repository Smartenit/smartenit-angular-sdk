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
import { ControllersService } from '../resources/controllers.service';
import { RespondersService } from '../resources/responders.service';
import { GatewayConnectivityService } from '../common/gateway-connectivity.service';

import { EventsManagerServiceFactory } from '../factories/events-manager-service.factory';
import { HttpInterceptorFactory } from '../factories/http-interceptor.factory';
import { XHRBackend, RequestOptions, Http } from '@angular/http';
import { AuthServiceFactory } from '../factories/auth-service.factory';
import { Oauth2ServiceFactory } from '../factories/oauth2-service.factory';
import { ResourcesProviderFactory } from '../factories/resource-provider.factory';
import { WebSocketsServiceFactory } from '../factories/websockets-service.factory';
import { AreasServiceFactory } from '../factories/areas-service.factory';
import { StorageServiceFactory } from '../factories/storage-service.factory';
import { DatabaseServiceFactory } from '../factories/database-service.factory';
import { SyncServiceFactory } from '../factories/sync-service.factory';
import { Injector } from '@angular/core';
import { DataQueryServiceFactory } from '../factories/data-query-service.factory';
import { UsersServiceFactory } from '../factories/users-service.factory';
import { LocationsServiceFactory } from '../factories/locations-service.factory';
import { CategoriesServiceFactory } from '../factories/categories-service.factory';
import { DevicesServiceFactory } from '../factories/devices-service.factory';
import { EventsServiceFactory } from '../factories/events-service.factory';
import { ScenesServiceFactory } from '../factories/scenes-service.factory';
import { PairingsServiceFactory } from '../factories/pairings-service.factory';
import { MediaServiceFactory } from '../factories/media-service.factory';
import { WizardsServiceFactory } from '../factories/wizards-service.factory';
import { PluginFactoryServiceFactory } from '../factories/plugin-factory-service.factory';
import { PluginUtilsServiceFactory } from '../factories/plugin-utils-service.factory';
import { ActionsServiceFactory } from '../factories/actions-service.factory';
import { EffectsServiceFactory } from '../factories/effects-service.factory';
import { ConditionsServiceFactory } from '../factories/conditions-service.factory';
import { DeviceReferenceServiceFactory } from '../factories/device-reference-service.factory';
import { LocalConnectionServiceFactory } from '../factories/local-connection-service.factory';
import { GatewayConnectivityServiceFactory } from '../factories/gateway-connectivity-service.factory';

export function initConfig(config: ISmartenitConfig) {
    AppConfiguration.initialConfig = config;
}

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
        //initConfig(config);

        return {
            ngModule: SmartenitModule,
            providers: [
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
                // {
                //     provide: EventsManagerService,
                //     useFactory: EventsManagerServiceFactory
                // },
                // {
                //     provide: StorageService,
                //     useFactory: StorageServiceFactory
                // },
                // {
                //     provide: DataQueryService,
                //     useFactory: DataQueryServiceFactory
                // },
                // {
                //     provide: DatabaseService,
                //     useFactory: DatabaseServiceFactory
                // },
                // {
                //     provide: PluginUtilsService,
                //     useFactory: PluginUtilsServiceFactory
                // },
                // {
                //     provide: HttpInterceptor,
                //     useFactory: HttpInterceptorFactory,
                //     deps: [XHRBackend, RequestOptions, Http, EventsManagerService]
                // },
                // {
                //     provide: AuthService,
                //     useFactory: AuthServiceFactory,
                //     deps: [StorageService, DatabaseService, EventsManagerService]
                // },
                // {
                //     provide: Oauth2Service,
                //     useFactory: Oauth2ServiceFactory,
                //     deps: [HttpInterceptor, AuthService, EventsManagerService]
                // },
                // {
                //     provide: WebSocketsService,
                //     useFactory: WebSocketsServiceFactory,
                //     deps: [HttpInterceptor, AuthService, Oauth2Service, EventsManagerService]
                // },
                // {
                //     provide: SyncService,
                //     useFactory: SyncServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         WebSocketsService,
                //         DatabaseService,
                //         DataQueryService,
                //         Injector,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: AreasService,
                //     useFactory: AreasServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: UsersService,
                //     useFactory: UsersServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: LocationsService,
                //     useFactory: LocationsServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: CategoriesService,
                //     useFactory: CategoriesServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: EventsService,
                //     useFactory: EventsServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: ScenesService,
                //     useFactory: ScenesServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         WebSocketsService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: PairingsService,
                //     useFactory: PairingsServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         WebSocketsService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: MediaService,
                //     useFactory: MediaServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: WizardsService,
                //     useFactory: WizardsServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         WebSocketsService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: PluginFactoryService,
                //     useFactory: PluginFactoryServiceFactory,
                //     deps: [
                //         DatabaseService,
                //         ActionsService,
                //         EffectsService,
                //         ConditionsService,
                //         PluginUtilsService
                //     ]
                // },
                // {
                //     provide: DevicesService,
                //     useFactory: DevicesServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         WebSocketsService,
                //         PluginFactoryService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: ActionsService,
                //     useFactory: ActionsServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: EffectsService,
                //     useFactory: EffectsServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: ConditionsService,
                //     useFactory: ConditionsServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: ResourcesProvider,
                //     useFactory: ResourcesProviderFactory,
                //     deps: [
                //         ActionsService,
                //         AreasService,
                //         CategoriesService,
                //         ConditionsService,
                //         ControllersService,
                //         DevicesService,
                //         EffectsService,
                //         EventsService,
                //         LocationsService,
                //         PairingsService,
                //         RespondersService,
                //         ScenesService,
                //         UsersService,
                //         WizardsService,
                //         PluginFactoryService,
                //         EventsManagerService,
                //         AuthService,
                //         Oauth2Service
                //     ]
                // },
                // {
                //     provide: DeviceReferenceService,
                //     useFactory: DeviceReferenceServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         DatabaseService,
                //         SyncService,
                //         DataQueryService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: LocalConnectionService,
                //     useFactory: LocalConnectionServiceFactory,
                //     deps: [
                //         HttpInterceptor,
                //         AuthService,
                //         Oauth2Service,
                //         DevicesService,
                //         DatabaseService,
                //         EventsManagerService
                //     ]
                // },
                // {
                //     provide: GatewayConnectivityService,
                //     useFactory: GatewayConnectivityServiceFactory,
                //     deps: [
                //         SyncService,
                //         DevicesService
                //     ]
                // }
            ]
        };
    }

    public static forRoot(): ModuleWithProviders {
        return {
            ngModule: SmartenitModule,
            providers: [
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
            ]
        };
    }

    public static forChild(): ModuleWithProviders {
        return {
            ngModule: SmartenitModule,
            providers: [
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
            ]
        };
    }

}
