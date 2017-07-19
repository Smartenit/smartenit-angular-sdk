import { StorageService } from '../storage/storage.service';

export function StorageServiceFactory() {
    return new StorageService();
}