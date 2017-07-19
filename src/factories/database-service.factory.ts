import { DatabaseService } from '../storage/database.service';

export function DatabaseServiceFactory() {
    return new DatabaseService();
}