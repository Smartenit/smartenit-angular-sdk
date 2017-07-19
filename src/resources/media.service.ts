import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { APIClientService } from "../common/api-client.service";
import { Observable } from "rxjs/Observable";
import { HttpInterceptor } from "../common/http-interceptor.service";
import { AppConfigurationService } from "../common/app-configuration.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";

@Injectable()
export class MediaService extends APIClientService {
    constructor(
        http: HttpInterceptor, authService: AuthService,
        eventsService: EventsManagerService,
        AppConfiguration: AppConfigurationService
    ) {
        super('media', http, authService, eventsService, AppConfiguration);
    }

    uploadBase64(data: string, fileName: string, resource: string, resourceId: string): Observable<any> {
        return this.post('upload/base64', {
            data: data,
            name: fileName,
            resource: resource,
            resourceId: resourceId
        });
    }

    updateLocalImage(service: PersistentCRUDService, resourceId: string, data: any): Observable<any> {
        if (data && data.data && data.data.url && data.data.version) {
            return service.mergeInCollection(resourceId, { media: { img: data.data.url, v: data.data.version }});
        } else {
            return Observable.of('');
        }
    }
}