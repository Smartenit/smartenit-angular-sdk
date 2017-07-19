import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from "rxjs/Observable";

import 'rxjs/add/operator/share';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { AppConfigurationService, BACKEND_DATA_LIMIT } from '../common/app-configuration.service';
import { CRUDService } from "../common/crud.service";
import { IRequestOptions } from "../common/request-options.interface";
import { DataQueryService } from "../common/data-query.service";
import { DatabaseService } from "./database.service";
import { SyncService } from "./sync.service";
import { DatabaseCollection } from "./database-collection";
import { HttpInterceptor } from "../common/http-interceptor.service";

@Injectable()
export abstract class PersistentCRUDService extends CRUDService {
  protected resource: string;
  public collection: DatabaseCollection;
  private listAllObservable: Observable<any>;

  constructor(
    resource: string,
    http: HttpInterceptor,
    authService: AuthService,
    dbService: DatabaseService,
    private syncService: SyncService,
    private dataQueryService: DataQueryService,
    public eventsService: EventsManagerService,
    public AppConfiguration: AppConfigurationService
  ) {
    super(resource, http, authService, eventsService, AppConfiguration);
    this.resource = resource;
    this.collection = dbService.getCollection(resource);
  }

  tearUpListAll() {
    this.listAllObservable = this.retrieveAll()
      .flatMap((resourcesList) => this.processListData({ data: resourcesList }))
      .share();
  }

  tearDownListAll() {
    this.listAllObservable = Observable.empty();
  }

  save(data: any, options?: IRequestOptions): Observable<any> {
    if (this.AppConfiguration.currentConfig.offlineMode && this.AppConfiguration.currentConfig.useOfflineOperations) {
      return this.syncService.processOfflineSave(this.resource, data);
    } else {
      return super.save(data, options).flatMap((apiData) => {
        return this.collection.save(apiData.data._id, apiData.data).flatMap(() => {
          return Observable.of(apiData);
        })
      });
    }
  }

  list(query?: any, options?: IRequestOptions): Observable<any> {
    return !this.syncService.canUseLocalStorage()
      ? (options && options.page != null) ? this.listFromBackend(query, options) : this.listAllFromBackend(false, query, options)
      : this.syncService.hasSynchronized(this.resource)
        .flatMap((hasSinchronized: boolean) => hasSinchronized
          ? this.listFromLocalStorage(query, options)
          : this.syncService.syncFromBeggining(this.resource).flatMap(() => {
            return this.listFromLocalStorage(query, options);
          })
        );
  }

  listFromLocalStorage(query?: any, options?: IRequestOptions): Observable<any> {
    return this.collection.list().map((resourcesList) => ({
      message: 'Read list from local DB',
      data: this.dataQueryService
        .filterAndSliceData(resourcesList.map((data: any) => this.createModel(data.value)), query, options || {}),
      total: resourcesList.length
    }));
  }

  listFromBackend(query?: any, options?: IRequestOptions): Observable<any> {
    return super.list(query, options).flatMap((resourcesList) => this.processListData(resourcesList));
  }

  listAllFromBackend(shared: boolean, query?: any, options?: IRequestOptions): Observable<any> {
    return shared
      ? this.listAllObservable
      : this.retrieveAll(1, query, options)
        .flatMap((resourcesList) => this.processListData({ data: resourcesList }));
  }

  retrieveAll(page: number = 1, query: any = null, options: IRequestOptions = {}, acc: Array<any> = []): Observable<any> {
    return Observable.defer(
      () => super.list(query, Object.assign({}, options, { page }))
        .flatMap(({ data, _links }) => {
          acc = acc.concat(data);
          const items = Observable.of(acc);
          const nextData = (_links && ((page + 1) <= Math.ceil(_links.total / BACKEND_DATA_LIMIT)))
            ? this.retrieveAll(page + 1, query, options, acc)
            : Observable.empty();

          return Observable.concat(items, nextData);
        })
    );
  }

  processListData(resourcesList: any): Observable<any> {
    let saveOperations: Array<Observable<any>> = [];

    for (let i = 0; i < resourcesList.data.length; i++) {
      let resourceObject = resourcesList.data[i];

      if (resourceObject && resourceObject._id) {
        saveOperations.push(this.collection.save(resourceObject._id, resourceObject));
      }
    }

    if (saveOperations.length > 0) {
      return Observable.forkJoin(saveOperations).flatMap((res) => {
        return Observable.of(resourcesList);
      });
    } else {
      return Observable.of(resourcesList);
    }
  }

  getById(resourceId: string, options?: IRequestOptions): Observable<any> {
    return !this.syncService.canUseLocalStorage()
      ? this.getByIdFromBackend(resourceId, options)
      : this.syncService.hasSynchronized(this.resource)
        .flatMap((hasSinchronized: boolean) => hasSinchronized
          ? this.getByIdFromLocalStorage(resourceId, options)
          : this.syncService.syncFromBeggining(this.resource).flatMap(() => {
            return this.getByIdFromLocalStorage(resourceId, options);
          })
        );
  }

  getByIdFromLocalStorage(resourceId: string, options?: IRequestOptions): Observable<any> {
    return this.collection.getById(resourceId).flatMap((resourceResponse) => {
      if (resourceResponse) {
        return Observable.of({
          message: 'Read item from local DB',
          data: this.createModel(resourceResponse)
        });
      } else {
        return this.getByIdFromBackend(resourceId, options);
      }
    });
  }

  getByIdFromBackend(resourceId: string, options?: IRequestOptions): Observable<any> {
    return super.getById(resourceId, options).flatMap((resourceResponse) => {
      return this.collection.save(resourceId, resourceResponse.data).flatMap(() => {
        return Observable.of(resourceResponse);
      });
    });
  }

  remove(path: string, data?: any, options?: IRequestOptions): Observable<any> {
    if (this.AppConfiguration.currentConfig.offlineMode && this.AppConfiguration.currentConfig.useOfflineOperations) {
      return this.syncService.processOfflineDelete(this.resource, path);
    } else {
      return super.remove(path, data, options).flatMap((removeData) => {
        return this.removeFromLocalStorage(path, removeData);
      });
    }
  }

  removeFromLocalStorage(resourceId: string, removeData: any): Observable<any> {
    return this.collection.removeById(resourceId).map(() => (removeData));
  }

  removeById(resourceId: string, options?: IRequestOptions): Observable<any> {
    return this.remove(resourceId, null, options);
  }

  mergeInCollection(resourceId: string, resource: any): Observable<any> {
    return this.collection.getById(resourceId)
      .flatMap((resourceResponse) => {
        if (resourceResponse) {
          return this.collection.save(resourceId, Object.assign({}, resourceResponse, resource));
        } else {
          return Observable.of(resourceResponse);
        }
      });
  }
}
