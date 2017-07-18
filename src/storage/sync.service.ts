import { Injectable, Injector } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { Subscription } from 'rxjs/Subscription';
import { Subject } from 'rxjs/Subject';
import 'rxjs/add/observable/throw';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/repeat';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/defer';
import 'rxjs/add/operator/defaultIfEmpty';

import { AuthService } from '../auth/auth.service';
import { EventsManagerService } from "../common/events-manager.service";
import { AppConfiguration, BACKEND_DATA_LIMIT } from '../common/app-configuration';
import { APIClientService } from '../common/api-client.service';
import { DataQueryService } from '../common/data-query.service';
import { changeValueInObject } from '../common/utils';
import { PersistentCRUDService } from '../storage/persistent-crud.service';
import { ResourcesProvider } from '../resources/resources.provider';
import { WebSocketsService } from '../websockets/websockets.service';
import { DatabaseCollection } from './database-collection';
import { DatabaseService } from './database.service';
import { OfflineOperation, ISyncOfflineOperation } from './sync-offline-operation.interface';
import { HttpInterceptor } from "../common/http-interceptor.service";

const SYNC_NAME = 'sync';
const OFFLINE_NAME = 'offline';
const SYNC_TIMEOUT = 5 * 60 * 1000;

@Injectable()
export class SyncService extends APIClientService {
  useLocalStorage: boolean;
  useOfflineOperations: boolean;
  syncCollection: DatabaseCollection;
  syncSubscription: Subscription | null;
  offlineCollection: DatabaseCollection;

  public syncChangeSubject: Subject<string> = new Subject();
  get onSyncChange(): Observable<string> {
    return this.syncChangeSubject.asObservable();
  }

  constructor(
    http: HttpInterceptor,
    authService: AuthService,
    private webSocketsService: WebSocketsService,
    private dbService: DatabaseService,
    private dataQueryService: DataQueryService,
    private injector: Injector,
    public eventsService: EventsManagerService
  ) {
    super(SYNC_NAME, http, authService, eventsService);
    this.useLocalStorage = AppConfiguration.currentConfig.useLocalStorage || false;
    this.useOfflineOperations = AppConfiguration.currentConfig.useOfflineOperations || false;
    this.syncCollection = dbService.getCollection(SYNC_NAME);
    this.offlineCollection = dbService.getCollection(OFFLINE_NAME);
    this.configureEventsListener();
  }

  /**
   * @private
   * Process the sync events received asynchronously
   */
  private configureEventsListener() {
    if (!this.useLocalStorage)
      return;

    this.webSocketsService.onEventsMessage
      .filter(msg => {
        return msg && msg.data && msg.data.response &&
          msg.data.response.code &&
          msg.data.response.identityType === 'sync' &&
          msg.data.response.resourcePath && msg.data.response.resourcePath.split('/').length >= 3;
      })
      .map(msg => {
        const response = msg.data.response;
        return {
          operation: response.code.split('.').pop(),
          resource: response.resourcePath.split('/')[1],
          resourceId: response.resourcePath.split('/')[2],
          date: (new Date()).toISOString()
        };
      })
      .flatMap(event => {
        return this.hasSynchronized(event.resource)
          .map((hasSinchronized: boolean) => ({
            hasSinchronized,
            event
          }));
      })
      .filter(resEvent => resEvent.hasSinchronized)
      .flatMap(({ event }) => {
        console.log(event);
        return this.processSyncChange(event.operation, event.resource, event.resourceId)
          .catch(() => Observable.empty())
          .map(() => event);
      })
      .subscribe((event: any) => {
        if (event.resource) {
          this.syncChangeSubject.next(event.resource);

          let syncSub = this.syncCollection
            .save(event.resource, { updatedAt: event.date })
            .subscribe(() => { syncSub.unsubscribe(); });
        }
      });
  }

  /**
   * @public
   * Start the synchronization timeout process
   */
  startSync() {
    if (!this.useLocalStorage || this.syncSubscription)
      return;

    this.syncSubscription = Observable.of('')
      .flatMap(() => this.getSyncInfo().delay(SYNC_TIMEOUT))
      .repeat()
      .subscribe(() => { });
  }

  /**
   * @public
   * Stop the synchronization timeout process
   */
  stopSync() {
    if (!this.useLocalStorage || !this.syncSubscription)
      return;

    console.log('Stoping synchronization');
    this.syncSubscription.unsubscribe();
    this.syncSubscription = null;
  }

  /**
   * @private
   * Retrieves resources available for sync changes
   */
  private getSyncInfo() {
    if (!this.useLocalStorage || AppConfiguration.currentConfig.offlineMode)
      return Observable.create((o: any) => o.complete());

    console.log('Starting synchronization');
    return super.get().map((res) => {
      this.syncCollection.list().subscribe((syncRes) => {
        if (syncRes && syncRes.length) {
          if (res.data) {
            Object.keys(res.data).forEach((key) => {
              if (res.data[key] && res.data[key].hasOwnProperty('updatedAt')) {
                const lastServerSyncDate = new Date(res.data[key].updatedAt);

                const syncResItem = syncRes.find((sr: any) => sr.key === key && sr.value && sr.value.hasOwnProperty('updatedAt'));
                if (syncResItem) {
                  const lastLocalSyncDate = new Date(syncResItem.value.updatedAt);

                  if (lastLocalSyncDate.getTime() < lastServerSyncDate.getTime()) {
                    const subscription = this.syncResource(key, lastLocalSyncDate);
                    if (subscription) {
                      subscription.subscribe(() => { });
                    }
                  }
                }
              }
            });
          } else {
            console.log('Invalid sync info from server');
          }
        } else {
          console.log('No previous data sync, backend query needed');
        }
      }, (error: any) => {
        console.log('Error getting local sync collection', error);
      });
    }, (error: any) => {
      console.log('Error getting sync info', error);
    });
  }

  /**
   * @private
   * Request and process the changes for a resource since a given date
   * @param resource Resource name
   * @param lastSyncDate Last date of synchronization
   */
  private syncResource(resource: string, lastSyncDate: Date): Observable<any> | undefined {
    if (!this.useLocalStorage || AppConfiguration.currentConfig.offlineMode) {
      return;
    }

    const resourceService = (<ResourcesProvider>this.injector.get(ResourcesProvider)).getResourceToken(resource);

    console.log(`Synchronizing ${resource}`);
    return this.retrieveAllChanges(resource, lastSyncDate)
      .flatMap((data: Array<any>) => {
        return data.map((change) => {
          if (change && change.operation) {
            return this.processSyncChange(change.operation, resource, change.resourceId, resourceService);
          } else {
            return Observable.empty();
          }
        }).reduce((acc, curr) => {
          return acc.flatMap(() => curr);
        }).map(() => {
          return data.length && data[data.length - 1].hasOwnProperty('updatedAt')
            ? data[data.length - 1].updatedAt
            : (new Date()).toISOString();
        });
      })
      .catch((error) => {
        console.log(`Error getting sync info for resource ${resource}`, error);
        if (error && error.status === 404) {
          console.log('Sync info not found, downloading all info');
          return resourceService.listAllFromBackend(true).map(() => (new Date()).toISOString());
        }
        return Observable.empty();
      })
      .flatMap((updatedAt: string) => {
        this.syncChangeSubject.next(resource);
        return this.syncCollection
          .save(resource, { updatedAt })
          .flatMap(() => {
            return Observable.of(updatedAt);
          });
      });
  }

  /**
   * @private
   * Retrieves all changes for a resource since a given date
   * @param resource Resource name
   * @param lastSyncDate Last date of synchronization
   * @param page Current page of total data
   */
  private retrieveAllChanges(resource: string, lastSyncDate: Date, page: number = 1): Observable<any> {
    return Observable.defer(
      () => super.get(undefined, {
        resource,
        lastSyncAt: lastSyncDate.toISOString(),
        page
      })
        .flatMap(({ data, _links }) => {
          const items = Observable.of(data);
          const nextData = (_links && ((page + 1) <= Math.ceil(_links.total / BACKEND_DATA_LIMIT)))
            ? this.retrieveAllChanges(resource, lastSyncDate, page + 1)
            : Observable.empty();

          return Observable.concat(items, nextData);
        })
    );
  }

  /**
   * @private
   * Process a single synchronization change
   * @param operation Operation type (save/delete)
   * @param resource Name of the resource
   * @param resourceId Id of the resource
   * @param resourceService Service associated with the resource
   */
  private processSyncChange(operation: string, resource: string,
    resourceId: string, resourceService?: PersistentCRUDService): Observable<any> {
    const service = !resourceService
      ? (<ResourcesProvider>this.injector.get(ResourcesProvider)).getResourceToken(resource)
      : resourceService;
    switch (operation.toLowerCase()) {
      case 'save':
        return service.getByIdFromBackend(resourceId).catch(() => Observable.empty());
      case 'delete':
        return service.removeFromLocalStorage(resourceId, {});
      default:
        return Observable.empty();
    }
  }

  /**
   * @public
   * Sync all data for the resource
   * @param resource Resource name
   */
  syncFromBeggining(resource: string): Observable<any> {
    const resourceService = (<ResourcesProvider>this.injector.get(ResourcesProvider)).getResourceToken(resource);
    return resourceService.listAllFromBackend(false).flatMap((data) => {
      return this.syncCollection.save(resource, { updatedAt: (new Date()).toISOString() })
        .flatMap(() => {
          return Observable.of(data);
        });
    });
  }

  /**
   * @public
   * Indicates if the use of local storage is enabled
   */
  canUseLocalStorage(): boolean {
    return this.useLocalStorage;
  }

  /**
   * @public
   * Indicates if this resource has been
   * sinchronized previously
   * @param resource Resource name
   */
  hasSynchronized(resource: string): Observable<boolean> {
    return !this.useLocalStorage
      ? Observable.of(false)
      : this.syncCollection
        .getById(resource)
        .flatMap((syncRes) => Observable.of(!!syncRes && syncRes.hasOwnProperty('updatedAt')));
  }

  /**
   * @public
   * Synchronize all operations made in offline mode
   */
  syncOfflineOperations() {
    if (!this.useOfflineOperations || AppConfiguration.currentConfig.offlineMode)
      return;

    console.log('Synchronizing offline data');
    this.offlineCollection.list()
      .subscribe((operations: Array<any>) => {
        let obs = Observable.of('');
        operations.sort((o1, o2) => new Date(o1.value.date) < new Date(o2.value.date) ? -1 : 1);
        operations.forEach((operation) => {
          obs = obs.flatMap(() => {
            return this.offlineCollection.getById(operation.key)
              .flatMap((value) => this.syncOfflineOperation(operation.key, value));
          });
        });
        obs.subscribe(() => {
          console.log('Offline synchronization finished');
        }, () => {
          console.log('Offline synchronization finished with errors');
        });
      });
  }

  private syncOfflineOperation(key: string, value: ISyncOfflineOperation): Observable<any> {
    let resourceIdObservable: Observable<any> = Observable.empty();

    switch (value.operation) {
      case OfflineOperation.SAVE:
        resourceIdObservable = this.syncOfflineSave(key, value);
        break;

      case OfflineOperation.UPDATE:
        resourceIdObservable = this.syncOfflineUpdate(key, value);
        break;

      case OfflineOperation.DELETE:
        resourceIdObservable = this.syncOfflineDelete(key, value);
        break;
    }

    if (resourceIdObservable != Observable.empty()) {
      return resourceIdObservable
        .catch((err) => {
          console.log('Error synchronizing offline resource:', value.resource, err);
          return Observable.throw(err);
        })
        .flatMap((resourceId: string) => {
          return this.offlineCollection.removeById(key)
            .flatMap(() => {
              this.syncChangeSubject.next(value.resource);
              return Observable.of(resourceId);
            });
        });
    }

    return Observable.empty();
  }

  private syncOfflineSave(key: string, saveOperation: ISyncOfflineOperation): Observable<any> {
    const resourceService = (<ResourcesProvider>this.injector.get(ResourcesProvider)).getResourceToken(saveOperation.resource);
    return resourceService.save(saveOperation.model)
      .flatMap((apiData) => {
        return ((saveOperation.resourceId.startsWith('loc_'))
          ? resourceService.collection.removeById(saveOperation.resourceId)
            .flatMap(() => this.updateLocalIdReferences(key, apiData.data._id, saveOperation.resourceId))
          : Observable.of(''))
          .catch((err) => {
            console.log('error synchronizing save for resource:', saveOperation.resourceId, err);
            return Observable.empty();
          })
          .flatMap(() => {
            return Observable.of(saveOperation.resourceId);
          });
      })
      .catch((err) => {
        if (err.status === 400) {
          // Dependent resource does not exists then discard operation
          return Observable.of(saveOperation.resourceId);
        }
        return Observable.throw(err);
      });
  }

  private syncOfflineUpdate(key: string, updateOperation: ISyncOfflineOperation): Observable<any> {
    const resourceService = (<ResourcesProvider>this.injector.get(ResourcesProvider)).getResourceToken(updateOperation.resource);
    return resourceService.save(Object.assign({}, updateOperation.model, { changedLocally: true, updatedAt: updateOperation.date }))
      .catch((err) => {
        console.log('error synchronizing update for resource:', updateOperation.resourceId, err);
        if (err.status === 409) {
          return resourceService.collection.save(updateOperation.resourceId, err.data.data);
        } else if (err.status === 404) {
          // Resource does not exists then discard operation
          return Observable.of(updateOperation.resourceId);
        }
        return Observable.empty();
      })
      .flatMap(() => {
        return Observable.of(updateOperation.resourceId);
      });
  }

  private syncOfflineDelete(key: string, deleteOperation: ISyncOfflineOperation): Observable<any> {
    const resourceService = (<ResourcesProvider>this.injector.get(ResourcesProvider)).getResourceToken(deleteOperation.resource);
    return resourceService.remove(deleteOperation.resourceId, { changedLocally: true, updatedAt: deleteOperation.date })
      .catch((err) => {
        console.log('error synchronizing deletion for resource:', deleteOperation.resourceId, err);
        if (err.status === 409) {
          return resourceService.collection.save(deleteOperation.resourceId, err.data.data);
        } else if (err.status === 404) {
          // Resource does not exists then discard operation
          return Observable.of(deleteOperation.resourceId);
        }
        return Observable.empty();
      })
      .flatMap(() => {
        return Observable.of(deleteOperation.resourceId);
      });
  }

  /**
   * Update all the id references in the offline operations
   * @param newId Id retrieved from the server
   * @param oldId Id generated locally
   */
  private updateLocalIdReferences(resourceId: string, newId: string, oldId: string): Observable<any> {
    return this.offlineCollection.list()
      .flatMap((operations: Array<any>) => {
        return Observable.forkJoin(
          operations
            .filter((o) => o.key !== resourceId)
            .map((o) => {
              changeValueInObject(o.value.model, newId, oldId);
              if (o.key.startsWith(oldId)) {
                o.value.model._id = newId;
              }
              return this.offlineCollection.save(o.key, o.value);
            })
        ).defaultIfEmpty();
      });
  }

  /**
   * @public
   * Process an offline save operation record
   * @param resource Name of the resource
   * @param data Data associated with the save operation
   */
  processOfflineSave(resource: string, data: any): Observable<any> {
    if (!this.useOfflineOperations || !AppConfiguration.currentConfig.offlineMode) {
      return Observable.empty();
    }

    const resourceService = (<ResourcesProvider>this.injector.get(ResourcesProvider)).getResourceToken(resource);
    return resourceService.collection.saveLocal(data._id, data).flatMap((storeResult) => {
      return this.addOfflineSave(resource, storeResult).flatMap(() => {
        return Observable.of({
          data: resourceService.createModel(Object.assign({}, storeResult.value, {
            _id: storeResult.key
          }))
        });
      });
    });
  }

  private addOfflineSave(resource: string, data: any): Observable<any> {
    const model = Object.assign({}, data.value);
    if (data.isNew) delete model._id;
    return this.offlineCollection.save(`${data.key}_${new Date().getTime()}`, {
      operation: data.isNew ? OfflineOperation.SAVE : OfflineOperation.UPDATE,
      resource,
      resourceId: data.key,
      model,
      date: (new Date()).toISOString()
    });
  }

  /**
   * @public
   * Process an offline delete operation record
   * @param resource Name of the resource
   * @param resourceId Id of the resource
   */
  processOfflineDelete(resource: string, resourceId: string): Observable<any> {
    if (!this.useOfflineOperations || !AppConfiguration.currentConfig.offlineMode) {
      return Observable.empty();
    }

    const resourceService = (<ResourcesProvider>this.injector.get(ResourcesProvider)).getResourceToken(resource);
    return resourceService.removeFromLocalStorage(resourceId, {}).flatMap(() => {
      return this.addOfflineDelete(resource, resourceId);
    });
  }

  private addOfflineDelete(resource: string, resourceId: string): Observable<any> {
    return this.offlineCollection.list()
      .flatMap((operations) => {
        const existingOperations = operations.filter((o: any) => o.key.startsWith(resourceId));
        return Observable.forkJoin(existingOperations.map((o: any) => this.offlineCollection.removeById(o.key)))
          .defaultIfEmpty()
          .flatMap(() => {
            return ((!resourceId.startsWith('loc_'))
              ? this.offlineCollection.save(`${resourceId}_${new Date().getTime()}`, {
                operation: OfflineOperation.DELETE,
                resource,
                resourceId,
                date: (new Date()).toISOString()
              })
              : Observable.of(''))
              .flatMap(() => {
                return Observable.of({
                  data: {
                    _id: resourceId
                  }
                });
              });
          });
      });
  }
}
