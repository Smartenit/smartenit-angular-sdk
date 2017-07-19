import { Injectable, Inject } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';

import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/map';
import 'rxjs/add/observable/throw';
import { AuthService } from "../auth/auth.service";
import { Oauth2Service } from '../resources/oauth-2.service';
import { LocalConnectionService } from '../common/local-connection.service';
import { ISmartenitConfig } from "../smartenit-config.interface";
import { IRequestOptions } from "./request-options.interface";
import { AppConfigurationService } from "../common/app-configuration.service";
import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from "../common/http-interceptor.service";

@Injectable()
export class APIClientService {
  get apiURL(): string {
    return this.AppConfiguration.currentAPIURL;
  }

  _onServerError: Subject<any> = new Subject();

  public get onServerError(): Observable<any> {
    return this._onServerError.asObservable();
  }

  constructor(
    protected defaultPath: string,
    protected http: HttpInterceptor,
    public authService: AuthService,
    public eventsManagerService: EventsManagerService,
    public AppConfiguration: AppConfigurationService
  ) {
    this.defaultPath = defaultPath ? defaultPath : '';
  }

  get(path?: string | null, data?: any, options?: IRequestOptions): Observable<any> {
    const headers = new Headers();
    const innerOptions = new RequestOptions({ headers: headers });

    let resourcePath = this.apiURL;

    if (this.defaultPath) {
      resourcePath += '/' + this.defaultPath;
    }

    if (!options || options.credentials === undefined || options.credentials === true) {
      headers.append('Authorization', 'Bearer ' + this.authService.getAccessToken())
    }

    if (path) {
      resourcePath += '/' + path;
    }

    if (data) {
      resourcePath = this.addUrlParams(data, resourcePath);
    }

    return this.http.get(resourcePath, innerOptions)
      .map(this.extractData)
      .catch((error: any) => {
        let errorData;
        try {
          errorData = error._body ? JSON.parse(error._body) : undefined;
        } catch (parseError) {
          console.log('Response Parse error: ' + parseError.toString());
        }

        const errors = errorData && errorData.error && errorData.error.errors || [];
        const accessToken = this.authService.getAccessToken();

        /**
         * code 114 means Invalid access_token
         */
        if (accessToken && errors.length && (errors[0].code === 114 || errors[0].code === 115)) {
          const oauth2Service = new Oauth2Service(this.http, this.authService, this.eventsManagerService, this.AppConfiguration);
          return oauth2Service.refreshToken()
            .do(response => this.get(resourcePath, innerOptions));
        }

        return this.handleError(error);
      });
  }

  private addUrlParams(data: any, resourcePath: string): string {
    if (data) {
      let params = <any>[];
      const keys = Object.keys(data);
      for (let i = 0; i < keys.length; i++) {
        params.push(keys[i] + '=' + encodeURIComponent(data[keys[i]]));
      }

      if (params.length > 0) {
        resourcePath += '?' + params.join('&');
      }
    }

    return resourcePath;
  }

  remove(path?: string, data?: any, options?: IRequestOptions): Observable<any> {
    const headers = new Headers();
    const innerOptions = new RequestOptions({ headers: headers });

    let resourcePath = this.apiURL;

    if (this.defaultPath) {
      resourcePath += '/' + this.defaultPath;
    }

    if (!options || options.credentials === undefined || options.credentials === true) {
      headers.append('Authorization', 'Bearer ' + this.authService.getAccessToken())
    }

    if (path) {
      resourcePath += '/' + path;
    }

    if (data) {
      resourcePath = this.addUrlParams(data, resourcePath);
    }

    return this.http.delete(resourcePath, innerOptions)
      .map(this.extractData)
      .catch((error: any) => {
        let errorData;
        try {
          errorData = error._body ? JSON.parse(error._body) : undefined;
        } catch (parseError) {
          console.log('Response Parse error: ' + parseError.toString());
        }

        const errors = errorData && errorData.error && errorData.error.errors || [];

        const accessToken = this.authService.getAccessToken();

        /**
         * code 114 means Invalid access_token
         */
        if (accessToken && errors.length && (errors[0].code === 114 || errors[0].code === 115)) {
          const oauth2Service = new Oauth2Service(this.http, this.authService, this.eventsManagerService, this.AppConfiguration);
          return oauth2Service.refreshToken()
            .do(response => this.remove(resourcePath, innerOptions));
        }

        /**
         * Conflict case
         */
        if (error.status === 409) {
          return Observable.throw(Object.assign({}, error, {
            data: errorData
          }));
        }

        if (error.status >= 500) {
          this.eventsManagerService.trigger(EventsManagerService.ON_SERVER_CONNECTIVITY_ERROR, error);
        }

        return this.handleError(error);
      });
  }

  post(path?: string | null, data?: any, options?: any): Observable<any> {
    const bodyString = JSON.stringify(data);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const innerOptions = new RequestOptions({ headers: headers });

    let resourcePath = this.apiURL;

    if (this.defaultPath) {
      resourcePath += '/' + this.defaultPath;
    }

    if (path) {
      resourcePath += '/' + path;
    }

    if (!options || options.credentials === undefined || options.credentials === true) {
      headers.append('Authorization', 'Bearer ' + this.authService.getAccessToken())
    }

    if (options && options.data) {
      resourcePath = this.addUrlParams(options.data, resourcePath);
    }

    return this.http.post(resourcePath, bodyString, innerOptions)
      .map(this.extractData)
      .catch((error: any) => {
        let errorData;
        try {
          errorData = error._body ? JSON.parse(error._body) : undefined;
        } catch (parseError) {
          console.log('Response Parse error: ' + parseError.toString());
        }

        const errors = errorData && errorData.error && errorData.error.errors || [];
        const accessToken = this.authService.getAccessToken();

        /**
         * code 114 means Invalid access_token
         */
        if (accessToken && errors.length && (errors[0].code === 114 || errors[0].code === 115)) {
          const oauth2Service = new Oauth2Service(this.http, this.authService, this.eventsManagerService, this.AppConfiguration);
          return oauth2Service.refreshToken()
            .do(response => this.post(resourcePath, innerOptions));
        }

        if (error.status >= 500) {
          this.eventsManagerService.trigger(EventsManagerService.ON_SERVER_CONNECTIVITY_ERROR, error);
        }

        return this.handleError(error);
      });
  }

  put(path?: string, data?: any, options?: any): Observable<any> {
    const bodyString = JSON.stringify(data);
    const headers = new Headers({ 'Content-Type': 'application/json' });
    const innerOptions = new RequestOptions({ headers: headers });

    let resourcePath = this.apiURL;

    if (this.defaultPath) {
      resourcePath += '/' + this.defaultPath;
    }

    if (path) {
      resourcePath += '/' + path;
    }

    if (!options || options.credentials === undefined || options.credentials === true) {
      headers.append('Authorization', 'Bearer ' + this.authService.getAccessToken())
    }

    if (options && options.data) {
      resourcePath = this.addUrlParams(options.data, resourcePath);
    }

    return this.http.put(resourcePath, bodyString, innerOptions)
      .map(this.extractData)
      .catch((error: any) => {
        let errorData;
        try {
          errorData = error._body ? JSON.parse(error._body) : undefined;
        } catch (parseError) {
          console.log('Response Parse error: ' + parseError.toString());
        }

        const errors = errorData && errorData.error && errorData.error.errors || [];
        const accessToken = this.authService.getAccessToken();

        /**
         * code 114 means Invalid access_token
         */
        if (accessToken && errors.length && (errors[0].code === 114 || errors[0].code === 115)) {
          const oauth2Service = new Oauth2Service(this.http, this.authService, this.eventsManagerService, this.AppConfiguration);
          return oauth2Service.refreshToken()
            .do(response => this.put(resourcePath, innerOptions));
        }

        /**
         * Conflict case
         */
        if (error.status === 409) {
          return Observable.throw(Object.assign({}, error, {
            data: errorData
          }));
        }

        if (error.status >= 500) {
          this.eventsManagerService.trigger(EventsManagerService.ON_SERVER_CONNECTIVITY_ERROR, error);
        }

        return this.handleError(error);
      });
  }

  private extractData(res: Response) {
    return res.json();
  }

  private handleError(error: Response | any) {
    let errObj: any;

    if (error instanceof Response) {
      const body = error.json();
      errObj = body.error;
    } else {
      errObj = error.message ? { message: error.message } : { message: error.toString() };
    }

    return Observable.throw(errObj);
  }
}