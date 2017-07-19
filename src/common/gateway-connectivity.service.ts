import { Injectable } from '@angular/core';

import { AppConfigurationService } from "../common/app-configuration.service";
import { SyncService } from '../storage/sync.service';
import { DevicesService } from '../resources/devices.service';

const GATEWAY_CHECK_INTERVAL_TIME = 20 * 60 * 1000;

@Injectable()
export class GatewayConnectivityService {
  checkInterval: any;

  constructor(
    private syncService: SyncService,
    private devicesService: DevicesService,
    private AppConfiguration: AppConfigurationService
  ) { }

  public startCheckCycle() {
    if (!this.AppConfiguration.currentConfig.currentGateway) {
      if (!this.checkInterval) {
        this.checkGatewayConnectivity();
        this.checkInterval = setInterval(() => {
          this.checkGatewayConnectivity();
        }, GATEWAY_CHECK_INTERVAL_TIME);
      }
    } else {
      this.stopCheckCycle();
    }
  }

  public stopCheckCycle() {
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
  }

  private checkGatewayConnectivity() {
    this.devicesService.listAllFromBackend(false, { type: 'gateway' })
      .subscribe(() => {
        this.syncService.syncChangeSubject.next('devices');
      });
  }
}
