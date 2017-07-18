import { Injectable, Inject } from '@angular/core';
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { Http } from '@angular/http';
import { IStorable } from "../storage/storable.interface";
import { APIClientService } from "../common/api-client.service";
import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { DatabaseService } from "../storage/database.service";
import { IRequestOptions } from "./request-options.interface";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { HttpInterceptor } from "../common/http-interceptor.service";

const DEVICE_REFERENCE = 'device_reference';

@Injectable()
export class DeviceReferenceService extends APIClientService {
  protected _data: any = { version: '0.0.0' };
  protected _loaded: boolean = false;
  protected _onLoaded: Subject<any> = new Subject<any>();

  get version(): string {
    return this._data.version;
  }

  get data(): any {
    return this._data;
  }

  get onLoaded(): Observable<any> {
    return this._onLoaded.asObservable();
  }

  get isLoaded(): boolean {
    return this._loaded;
  }

  set data(value: any) {
    this._data = value;
  }

  constructor(
    http: HttpInterceptor,
    authService: AuthService,
    public databaseService: DatabaseService,
    public eventsService: EventsManagerService
  ) {
    super('devices', http, authService, eventsService);
  }

  loadFile() {
    this.loadLocalVersion().subscribe(localVersionResponse => {
      const date = new Date();
      const cacheString = "" + date.getUTCDate() + date.getUTCHours() + date.getUTCMinutes();
      this.get('reference', { v: cacheString }).subscribe(referenceResponse => {
        this.storeLocalVersion(referenceResponse);
      }, (error) => {
        this._loaded = true;
        this._onLoaded.next(true);
        console.log('Error loading reference file, using local version (' + this.version + ')');
      });
    });
  }

  private loadLocalVersion(): Observable<any> {
    return this.databaseService.getCollection(DEVICE_REFERENCE).getById(DEVICE_REFERENCE).map(localVersion => {
      if (localVersion != null) {
        this._data = localVersion;
      }
    });
  }

  private storeLocalVersion(remoteData: any) {
    if (remoteData && remoteData.version && this._data && this._data.version) {
      const remoteVersion = remoteData.version;
      const localVersion = this._data.version;

      if (this.versionCompare(remoteVersion, localVersion) >= 0) {
        this._data = this.resolveGroups(remoteData);
        this._data = this.injectTemplates(remoteData);

        this.databaseService.getCollection(DEVICE_REFERENCE).save(DEVICE_REFERENCE, remoteData).subscribe(storeResult => {
          console.log('Device Reference: current (' + this.version + ') remote (' + remoteVersion + ')');
          this._loaded = true;
          this._onLoaded.next(true);
        });
      } else {
        console.log('Device Reference: current (' + this.version + ') remote (' + remoteVersion + ')');
        this._loaded = true;
        this._onLoaded.next(true);
      }
    }
  }

  resolveGroups(data: any): any {
    const groups = data && data.groups;

    if (groups) {
      for (let group of groups) {
        if (group.hasOwnProperty('models') && group.hasOwnProperty('use')) {
          for (let model of group.models) {
            // Do not override model if present
            if (!data.models.hasOwnProperty(model)) {
              data.models[model] = group.use;
            }
          }
        }
      }
    }

    return data;
  }

  injectTemplates(data: any): any {
    const templates = data && data.templates;

    if (templates) {
      const models = data.models;

      if (models) {
        for (let model in models) {
          for (let contextKey in models[model]) {
            let context = models[model][contextKey];
            if (context.hasOwnProperty('use') && templates.hasOwnProperty(context.use)) {
              data.models[model][contextKey] = Object.assign(context, templates[context.use]);
            }
          }
        }
      }
    }

    return data;
  }

  private isPositiveInteger(x: any) {
    return /^\d+$/.test(x);
  }

  private validateParts(parts: any) {
    for (let i = 0; i < parts.length; ++i) {
      if (!this.isPositiveInteger(parts[i])) {
        return false;
      }
    }
    return true;
  }

  versionCompare(v1: string, v2: string) {
    let v1parts = v1.split('.').map(Number);
    let v2parts = v2.split('.').map(Number);

    if (!this.validateParts(v1parts) || !this.validateParts(v2parts)) {
      return NaN;
    }

    for (let i = 0; i < v1parts.length; ++i) {
      if (v2parts.length === i) {
        return 1;
      }

      if (v1parts[i] === v2parts[i]) {
        continue;
      }
      if (v1parts[i] > v2parts[i]) {
        return 1;
      }
      return -1;
    }

    if (v1parts.length != v2parts.length) {
      return -1;
    }

    return 0;
  }
}