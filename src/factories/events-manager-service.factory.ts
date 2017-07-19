import { XHRBackend, RequestOptions } from '@angular/http';

import { EventsManagerService } from '../common/events-manager.service';

export function EventsManagerServiceFactory() {
    return new EventsManagerService();
}