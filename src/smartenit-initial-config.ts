import { ISmartenitConfig } from './smartenit-config.interface';
import { InjectionToken } from '@angular/core';

export let INITIAL_CONFIG = new InjectionToken<ISmartenitConfig>('app.config');