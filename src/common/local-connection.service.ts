import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/timeoutWith';

import { AuthService } from "../auth/auth.service";
import { Oauth2Service } from "../resources/oauth-2.service";
import { DeviceModel } from "../models/device.model";
import { AppConfigurationService } from "../common/app-configuration.service";
import { DevicesService } from "../resources/devices.service";
import { DatabaseCollection } from "../storage/database-collection";
import { DatabaseService } from "../storage/database.service";
import { APIClientService } from "../common/api-client.service";
import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from "../common/http-interceptor.service";

@Injectable()
export class LocalConnectionService {
  private usingLocalConnection: Boolean = false;
  private apiVersionUrl = '/v2';
  private switchingConnection: Boolean = false;

  constructor(
    private http: HttpInterceptor,
    public authService: AuthService,
    public oauthService: Oauth2Service,
    public devicesService: DevicesService,
    public database: DatabaseService,
    public eventsService: EventsManagerService,
    public AppConfiguration: AppConfigurationService
  ) {
    this.eventsService.onServerConnectivityError.subscribe(({ enqueueRequests }) => {
      if (enqueueRequests && !this.switchingConnection) {
        console.log('Connectivity error, checking connection switching');

        this.switchingConnection = true;

        this.checkLocalConnection();
      }
    });
  }

  private startLocalConnectionTimer() {
    this.usingLocalConnection = true;
    setTimeout(() => {
      this.usingLocalConnection = false;
    }, 10 * 60 * 1000)
  }

  private testConnection(path: string, pingUrl: string, domain: string, onError?: Observable<any>): Observable<any> {
    return this.http.get(path + pingUrl)
      .timeout(2000)
      .map(response => Observable.of({ url: path, domain: domain, response: response }))
      .catch(() => {
        return onError ? onError : Observable.of({ error: true });
      });
  }

  private testConnections(domains: any, assignConnection = true, refreshToken = true) {
    let requests = [];

    const pingUrl = this.apiVersionUrl + '/ping';
    const localGateways = this.database.getCollection('local_gateways');

    let observables: any = domains
      .map((domain: any) => {
        let path = this.AppConfiguration.useHTTPS ? 'https://' : 'http://';
        path += domain.domain;

        const secondPath = path + ':' + 54444;

        return this.testConnection(path, pingUrl, domain,
          this.testConnection(secondPath, pingUrl, domain));
      });

    let anyConnectionAssigned = false;

    let subscription = Observable.forkJoin(observables)
      .subscribe((val: any) => {
        let successResponse;

        if (val && val.length > 0) {
          successResponse = val.find((item: any) => (item && !item.error));

          const workingRequest = successResponse;

          if (workingRequest && workingRequest.value && workingRequest.value.response) {
            const data = workingRequest.value.response.json();

            let versionValid = false;

            if (data && data.version) {
              const version = data.version.split('.');

              if (version.length >= 1) {
                if (Number(version[0]) == 3) {
                  if (version.length >= 2) {
                    if (Number(version[1]) == 4) {
                      if (version.length >= 3) {
                        const latest = version[2].split('-');
                        if (latest.length >= 1) {
                          if (Number(latest[0]) >= 0) {
                            versionValid = true;
                          }
                        }
                      }
                    } else if (Number(version[1]) > 4) {
                      versionValid = true;
                    }
                  }
                } else if (Number(version[0]) > 3) {
                  versionValid = true;
                }
              }
            }

            if (!versionValid) {
              return Observable.throw(new Error('Invalid gateway version'));
            } else {
              if (workingRequest && workingRequest.value && workingRequest.value.url) {
                const url = workingRequest.value.url;
                localGateways.save(workingRequest.value.domain.domain, workingRequest.value.domain).subscribe();

                if (assignConnection && this.AppConfiguration.currentConfig.useLocalConnection && !this.usingLocalConnection) {
                  anyConnectionAssigned = true;
                  this.setNewAPIURL(url + this.apiVersionUrl, workingRequest.value.domain.gateway, refreshToken);
                }
              }
            }
          }
        }
      }, (error) => {
        this.useRemoteAPI(assignConnection, anyConnectionAssigned, refreshToken);
      }, () => {
        this.useRemoteAPI(assignConnection, anyConnectionAssigned, refreshToken);

        if (subscription) {
          subscription.unsubscribe();
        }
      });
  }

  private useRemoteAPI(assignConnection: boolean, anyConnectionAssigned: boolean, refreshToken: boolean) {
    if (assignConnection && !anyConnectionAssigned) {
      console.log('Local address not available, using remote API');
      this.switchingConnection = false;
      const currentAPIUrl = this.AppConfiguration.currentAPIURL;
      this.AppConfiguration.restoreInitialConfiguration();
      const newAPIUrl = this.AppConfiguration.currentAPIURL;
      if (refreshToken) {
        this.authService.getNewAccessTokenFromRefreshToken(currentAPIUrl === newAPIUrl);
      }
      this.eventsService.trigger(EventsManagerService.ON_CONNECTION_SETUP);
    }
  }

  checkRemoteConnections(assignRemoteConnection = true, testConnections = true, refreshToken = true) {
    const localGateways = this.database.getCollection('local_gateways');

    if (this.authService.isLoggedIn()) {
      // check remote connections

      localGateways.list().subscribe(urls => {
        if (!this.AppConfiguration.currentConfig.apiURLSet && urls && urls.length > 0) {
          let subscription = this.eventsService.onConnectionSetup.subscribe(() => {
            this.checkGateways(localGateways, assignRemoteConnection, testConnections, refreshToken);
            subscription.unsubscribe();
          }, (error) => {
            subscription.unsubscribe();
          }, () => {
            subscription.unsubscribe();
          });
        } else {
          this.checkGateways(localGateways, assignRemoteConnection, testConnections, refreshToken);
        }
      });
    }
  }

  private checkGateways(localGateways: DatabaseCollection, assignRemoteConnection = true, testConnections = true, refreshToken = true) {
    console.log('Getting Gateways...');

    let subscription = this.devicesService.listFromBackend({
      type: 'gateway',
      domain: { $nin: [null, {}, ''] }
    }).subscribe(gateways => {
      gateways = gateways.data;

      const domains = gateways.map((gateway: any) => {
        if (gateway && gateway.domain && gateway.domain.name) {
          return {
            gateway: {
              _id: gateway._id,
              hwId: gateway.hwId
            },
            domain: gateway.domain.name
          };
        }
      });

      if (domains.length > 0) {
        localGateways.clear();
        domains.forEach((element: any) => {
          localGateways.save(element.domain, element).subscribe();
        });
      }

      if (testConnections) {
        this.testConnections(domains, assignRemoteConnection, refreshToken);
      }
      subscription.unsubscribe();
    }, (error) => {
      subscription.unsubscribe();
    }, () => {
      subscription.unsubscribe();
    });
  }

  private setNewAPIURL(url: string, gateway: any, refreshToken = true) {
    this.switchingConnection = false;

    this.AppConfiguration.setCurrentGateway(gateway);
    const currentAPIUrl = this.AppConfiguration.currentAPIURL;
    this.AppConfiguration.setAPIURL(url);
    const newAPIUrl = this.AppConfiguration.currentAPIURL;
    this.startLocalConnectionTimer();

    if (this.authService.isLoggedIn()) {
      let subscription = this.eventsService.onTokenRefreshed.subscribe(() => {
        this.eventsService.trigger(EventsManagerService.ON_CONNECTION_SETUP, url);
        subscription.unsubscribe();
      });

      if (refreshToken) {
        this.authService.getNewAccessTokenFromRefreshToken(currentAPIUrl === newAPIUrl);
      }
    } else {
      this.eventsService.trigger(EventsManagerService.ON_CONNECTION_SETUP, url);
    }
  }

  checkLocalConnection(refreshToken = true) {
    if (this.AppConfiguration.currentConfig.useLocalConnection) {
      console.log('Checking Local Connections...');

      // TODO check if current local connection is OK
      const localGateways = this.database.getCollection('local_gateways');
      this.usingLocalConnection = false;

      let subscription = localGateways.list().subscribe(urls => {
        if (urls && urls.length > 0) {
          const domains = urls.map((item: any) => item.value);
          this.testConnections(domains, true, refreshToken);
          if (this.authService.isLoggedIn()) {
            this.checkRemoteConnections(false, false, refreshToken);
          }
        } else if (this.authService.isLoggedIn()) {
          this.switchingConnection = false;
          this.checkRemoteConnections(true, true, refreshToken);
        } else {
          this.switchingConnection = false;
          this.eventsService.trigger(EventsManagerService.ON_CONNECTION_SETUP);
        }

        subscription.unsubscribe();
      });
    } else {
      this.switchingConnection = false;
      this.eventsService.trigger(EventsManagerService.ON_CONNECTION_SETUP);
    }
  }
}