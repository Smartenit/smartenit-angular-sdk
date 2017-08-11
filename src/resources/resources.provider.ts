import { Injectable } from '@angular/core';

import { PersistentCRUDService } from '../storage/persistent-crud.service';
import { ActionsService } from "./actions.service";
import { AreasService } from "./areas.service";
import { CategoriesService } from "./categories.service";
import { ConditionsService } from "./conditions.service";
import { ControllersService } from "./controllers.service";
import { DevicesService } from "./devices.service";
import { EffectsService } from "./effects.service";
import { EventsService } from "./events.service";
import { LocationsService } from "./locations.service";
import { PairingsService } from "./pairings.service";
import { RespondersService } from "./responders.service";
import { ScenesService } from "./scenes.service";
import { UsersService } from "./users.service";
import { WizardsService } from "./wizards.service";
import { PluginFactoryService } from '../plugins/plugin-factory.service';
import { AuthService } from '../auth/auth.service';
import { Oauth2Service } from './oauth-2.service';
import { EventsManagerService } from '../common/events-manager.service';

@Injectable()
export class ResourcesProvider {
  resources: any;

  constructor(
    private actionsService: ActionsService,
    private areasService: AreasService,
    private categoriesService: CategoriesService,
    private conditionsService: ConditionsService,
    private controllersService: ControllersService,
    private devicesService: DevicesService,
    private effectsService: EffectsService,
    private eventsService: EventsService,
    private locationsService: LocationsService,
    private pairingsService: PairingsService,
    private respondersService: RespondersService,
    private scenesService: ScenesService,
    private usersService: UsersService,
    private wizardsService: WizardsService,
    private pluginFactoryService: PluginFactoryService,
    private eventsManagerService: EventsManagerService,
    authService: AuthService,
    oauth2Service: Oauth2Service
  ) {
    this.resources = {
      actions: actionsService,
      areas: areasService,
      categories: categoriesService,
      conditions: conditionsService,
      controllers: controllersService,
      devices: devicesService,
      effects: effectsService,
      events: eventsService,
      locations: locationsService,
      pairings: pairingsService,
      responders: respondersService,
      scenes: scenesService,
      users: usersService,
      wizards: wizardsService
    };

    this.eventsManagerService.onUserSignIn.subscribe(() => {
      this.tearUpResources();
    });

    this.eventsManagerService.onUserSignOut.subscribe(() => {
      this.tearDownResources();
    });
  }

  getResourceToken(resource: string): PersistentCRUDService {
    return this.resources[resource];
  }

  tearUpResources() {
    Object.keys(this.resources).forEach((res) => {
      (<PersistentCRUDService>this.resources[res]).tearUpListAll();
    });
  }

  tearDownResources() {
    Object.keys(this.resources).forEach((res) => {
      (<PersistentCRUDService>this.resources[res]).tearDownListAll();
    });
    this.devicesService.clearDevices();
    this.pluginFactoryService.clearPlugins();
  }
}
