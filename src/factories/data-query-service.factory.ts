import { DataQueryService } from '../common/data-query.service';

export function DataQueryServiceFactory() {
    return new DataQueryService();
}