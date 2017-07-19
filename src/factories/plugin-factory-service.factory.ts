import { DatabaseService } from '../storage/database.service';
import { ActionsService } from "../resources/actions.service";
import { EffectsService } from "../resources/effects.service";
import { ConditionsService } from "../resources/conditions.service";
import { PluginUtilsService } from "../plugins/plugin-utils.service";

import { PluginFactoryService } from '../plugins/plugin-factory.service';

export function PluginFactoryServiceFactory(
    dbService: DatabaseService,
    actionsService: ActionsService,
    effectsService: EffectsService,
    conditionsService: ConditionsService,
    pluginUtilsService: PluginUtilsService
) {
    return new PluginFactoryService(dbService, actionsService, effectsService, conditionsService, pluginUtilsService);
}