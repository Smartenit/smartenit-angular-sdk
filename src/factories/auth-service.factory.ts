import { EventsManagerService } from "../common/events-manager.service";
import { StorageService } from '../storage/storage.service';
import { DatabaseService } from '../storage/database.service';

import { AuthService } from '../auth/auth.service';

export function AuthServiceFactory(
    storage: StorageService,
    database: DatabaseService,
    eventsManagerService: EventsManagerService) {
    return new AuthService(storage, database, eventsManagerService);
}