import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { APIClientService } from "../common/api-client.service";
import { Observable } from "rxjs/Observable";
import { HttpInterceptor } from "../common/http-interceptor.service";

@Injectable()
export class MediaService extends APIClientService {
    constructor(http: HttpInterceptor, authService: AuthService, eventsService: EventsManagerService) {
        super('media', http, authService, eventsService);
    }

    uploadBase64(data: string, fileName: string, resource: string, resourceId: string): Observable<any> {
        return this.post('upload/base64', {
            data: data,
            name: fileName,
            resource: resource,
            resourceId: resourceId
        });
    }
}