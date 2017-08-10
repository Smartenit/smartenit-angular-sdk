import { Injectable } from '@angular/core';
import { Http } from '@angular/http';
import { Observable } from 'rxjs';

import { AuthService } from "../auth/auth.service";
import { AppConfigurationService } from "../common/app-configuration.service";
import { DataQueryService } from "../common/data-query.service";
import { EventsManagerService } from "../common/events-manager.service";
import { HttpInterceptor } from "../common/http-interceptor.service";
import { IRequestOptions } from "../common/request-options.interface";
import { DatabaseService } from "../storage/database.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";
import { SyncService } from "../storage/sync.service";
import { MetricModel } from "../models/metric.model";

@Injectable()
export class MetricsService extends PersistentCRUDService {
  useCollection = false;

  constructor(
    http: HttpInterceptor, authService: AuthService, public dbService: DatabaseService,
    syncService: SyncService, dataQueryService: DataQueryService, eventsService: EventsManagerService,
    AppConfiguration: AppConfigurationService
  ) {
    super('metrics', http, authService, dbService, syncService, dataQueryService, eventsService, AppConfiguration);
  }

  createModel(data: any): MetricModel {
    return new MetricModel(this, data);
  }

  retrieveMetrics(metricQuery?: {
    name: string, resource?: string, resourceId?: string, minDate?: string, maxDate?: string
  }, options?: IRequestOptions): Observable<Array<MetricModel>> {
    let query: any;

    if (metricQuery) {
      const { name, resource, resourceId, minDate, maxDate } = metricQuery;
      query = { name };

      if (resource) {
        query.resource = resource;
      }

      if (resourceId) {
        query.resourceId = resourceId;
      }

      if (minDate && maxDate) {
        query.createdAt = { $gte : minDate, $lte : maxDate };
      } else if (minDate) {
        query.createdAt = { $gte : minDate };
      } else if (maxDate) {
        query.createdAt = { $lte : minDate };
      }
    }

    return this.listAllFromBackend(false, query, options);
  }
}
