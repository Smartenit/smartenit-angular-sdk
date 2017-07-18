import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { DataQueryService } from "../common/data-query.service";
import { Observable } from "rxjs/Observable";
import { DatabaseService } from "../storage/database.service";
import { PersistentCRUDService } from "../storage/persistent-crud.service";
import { SyncService } from "../storage/sync.service";
import { UserModel } from "../models/user.model";
import { HttpInterceptor } from "../common/http-interceptor.service";

@Injectable()
export class UsersService extends PersistentCRUDService {
  constructor(
    http: HttpInterceptor, authService: AuthService, public dbService: DatabaseService,
    syncService: SyncService, dataQueryService: DataQueryService, eventsService: EventsManagerService
  ) {
    super('users', http, authService, dbService, syncService, dataQueryService, eventsService);
  }

  recoverPassword(username: string): Observable<any> {
    return this.post('recover_password', { username: username });
  }

  createModel(data: any): UserModel {
    return new UserModel(this, data);
  }

  createClient(userId: string, platform: string, token: string): Observable<any> {
    return this.post(`${userId}/clients`, {platform: platform, token: token});
  }

  deleteClient(userId: string, clientId: string) {
    return this.remove(`${userId}/clients/${clientId}`);
  }
}