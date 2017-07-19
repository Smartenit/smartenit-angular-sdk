import { EventsManagerService } from "../common/events-manager.service";
import { AuthService } from '../auth/auth.service';
import { ActionsService } from "../resources/actions.service";
import { AreasService } from "../resources/areas.service";
import { CategoriesService } from "../resources/categories.service";
import { ConditionsService } from "../resources/conditions.service";
import { ControllersService } from "../resources/controllers.service";
import { DevicesService } from "../resources/devices.service";
import { EffectsService } from "../resources/effects.service";
import { EventsService } from "../resources/events.service";
import { LocationsService } from "../resources/locations.service";
import { PairingsService } from "../resources/pairings.service";
import { RespondersService } from "../resources/responders.service";
import { ScenesService } from "../resources/scenes.service";
import { UsersService } from "../resources/users.service";
import { WizardsService } from "../resources/wizards.service";
import { PluginFactoryService } from '../plugins/plugin-factory.service';
import { Oauth2Service } from '../resources/oauth-2.service';


import { ResourcesProvider } from '../resources/resources.provider';

export function ResourcesProviderFactory(
    actionsService: ActionsService,
    areasService: AreasService,
    categoriesService: CategoriesService,
    conditionsService: ConditionsService,
    controllersService: ControllersService,
    devicesService: DevicesService,
    effectsService: EffectsService,
    eventsService: EventsService,
    locationsService: LocationsService,
    pairingsService: PairingsService,
    respondersService: RespondersService,
    scenesService: ScenesService,
    usersService: UsersService,
    wizardsService: WizardsService,
    pluginFactoryService: PluginFactoryService,
    eventsManagerService: EventsManagerService,
    authService: AuthService,
    oauth2Service: Oauth2Service
) {
    return new ResourcesProvider(
        actionsService,
        areasService,
        categoriesService,
        conditionsService,
        controllersService,
        devicesService,
        effectsService,
        eventsService,
        locationsService,
        pairingsService,
        respondersService,
        scenesService,
        usersService,
        wizardsService,
        pluginFactoryService,
        eventsManagerService,
        authService,
        oauth2Service
    );
}