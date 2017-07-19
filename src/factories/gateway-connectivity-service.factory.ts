import { SyncService } from '../storage/sync.service';
import { DevicesService } from '../resources/devices.service';

import { GatewayConnectivityService } from '../common/gateway-connectivity.service';

export function GatewayConnectivityServiceFactory(
    syncService: SyncService,
    devicesService: DevicesService
) {
    return new GatewayConnectivityService(syncService, devicesService);
}