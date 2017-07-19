import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { APIClientService } from './api-client.service';
import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { Observable } from "rxjs/Observable";
import { IRequestOptions } from "./request-options.interface";
import { Model } from "./model";
import { HttpInterceptor } from "../common/http-interceptor.service";
import { AppConfigurationService } from "../common/app-configuration.service";

@Injectable()
export abstract class CRUDService extends APIClientService {
  get ResourceName() {
    return this.resource;
  }

  protected resource: string;

  constructor(
    resource: string,
    http: HttpInterceptor,
    authService: AuthService,
    eventsService: EventsManagerService,
    AppConfiguration: AppConfigurationService
  ) {
    super(resource, http, authService, eventsService, AppConfiguration);
    this.resource = resource;
  }

  abstract createModel(data: any): any;

  save(data: any, options?: IRequestOptions): Observable<any> {
    if (data && typeof data.toStoreObject === 'function') {
      data = data.toStoreObject();
    }

    if (data && data.hasOwnProperty('_id')) {
      return this.put(data._id, data, options).map((apiResponse) => {
        if (apiResponse && apiResponse.data) {
          apiResponse.data = this.createModel(apiResponse.data);
        }

        return apiResponse;
      });
    } else {
      return this.post(null, data, options).map((apiResponse: any) => {
        if (apiResponse && apiResponse.data) {
          apiResponse.data = this.createModel(apiResponse.data);
        }

        return apiResponse;
      });
    }
  }

  getById(resourceId: string, options?: IRequestOptions): Observable<any> {
    let data: any = {};

    if (!resourceId || resourceId.length == 0) {
      return Observable.throw(new Error('Invalid resourceId to getById'));
    }

    if (options && options.fields) {
      data.fields = options.fields;
    }

    return super.get(resourceId, data, options).map((apiResponse) => {
      if (apiResponse && apiResponse.data) {
        apiResponse.data = this.createModel(apiResponse.data);
      }

      return apiResponse;
    });
  }

  removeById(resourceId: string, options?: IRequestOptions): Observable<any> {
    return super.remove(resourceId, null, options);
  }

  list(query?: any, options?: IRequestOptions): Observable<any> {
    let data: any = {};

    if (options) {
      if (options.limit) {
        data.limit = options.limit;
      }

      if (options.page) {
        data.page = options.page;
      }

      if (options.fields && options.fields) {
        data.fields = options.fields.join(',');
      }

      if (options.sort && options.sort) {
        data.sort = options.sort.join(',');
      }
    }

    if (query) {
      data.q = JSON.stringify(query);
    }

    return this.get(null, data, options).map((apiResponse) => {
      if (apiResponse && apiResponse.data && Array.isArray(apiResponse.data)) {
        for (let i = 0; i < apiResponse.data.length; i++) {
          apiResponse.data[i] = this.createModel(apiResponse.data[i]);
        }
      }

      return apiResponse;
    });
  }
}