import { Injectable } from '@angular/core';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';

@Injectable()
export class EventsManagerService {
  private events: any = {
    '_onServerConnectivityError': new Subject(),
    '_onTokenRefreshStart': new Subject(),
    '_onTokenRefreshed': new Subject(),
    '_onTokenRefreshError': new Subject(),
    '_onUserSignOut': new Subject(),
    '_onUserSignIn': new Subject(),
    '_onConnectionSetup': new Subject(),
    '_onConnectivityRecovered': new Subject()
  }

  public static ON_SERVER_CONNECTIVITY_ERROR: string = '_onServerConnectivityError';
  public static ON_TOKEN_REFRESH_START: string = '_onTokenRefreshStart';
  public static ON_TOKEN_REFRESHED: string = '_onTokenRefreshed';
  public static ON_TOKEN_REFRESH_ERROR: string = '_onTokenRefreshError';
  public static ON_USER_SIGN_OUT: string = '_onUserSignOut';
  public static ON_USER_SIGN_IN: string = '_onUserSignIn';
  public static ON_CONNECTION_SETUP: string = '_onConnectionSetup';
  public static ON_CONNECTIVITY_RECOVERED: string = '_onConnectivityRecovered';

  public get onServerConnectivityError(): Observable<any> {
    return this.events['_onServerConnectivityError'].asObservable();
  }

  public get onConnectionSetup(): Observable<any> {
    return this.events['_onConnectionSetup'].asObservable();
  }

  public get onConnectivityRecovered(): Observable<any> {
    return this.events['_onConnectivityRecovered'].asObservable();
  }

  public get onUserSignIn(): Observable<any> {
    return this.events['_onUserSignIn'].asObservable();
  }

  public get onUserSignOut(): Observable<any> {
    return this.events['_onUserSignOut'].asObservable();
  }

  public get onTokenRefreshStart(): Observable<any> {
    return this.events['_onTokenRefreshStart'].asObservable();
  }

  public get onTokenRefreshed(): Observable<any> {
    return this.events['_onTokenRefreshed'].asObservable();
  }

  public get onTokenRefreshError(): Observable<any> {
    return this.events['_onTokenRefreshError'].asObservable();
  }

  trigger(event: string, data?: any) {
    if (this.events[event] && this.events[event] instanceof Subject) {
      this.events[event].next(data || {});
    }
  }
}