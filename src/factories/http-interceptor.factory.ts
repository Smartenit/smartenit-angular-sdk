import { XHRBackend, RequestOptions, Http } from '@angular/http';
import { HttpInterceptor } from '../common/http-interceptor.service';
import { EventsManagerService } from '../common/events-manager.service';

export function HttpInterceptorFactory(
    backend: XHRBackend,
    options: RequestOptions,
    http: Http,
    eventsManagerService: EventsManagerService) {
    return new HttpInterceptor(backend, options, http, eventsManagerService);
}