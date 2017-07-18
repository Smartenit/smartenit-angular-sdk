import { Injectable, Inject } from '@angular/core';
import { StorageService } from '../storage/storage.service';
import { DatabaseService } from '../storage/database.service';
import { WebSocketsService } from '../websockets/websockets.service';
import { ISmartenitConfig } from "../smartenit-config.interface";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { AppConfiguration } from "../common/app-configuration";
import { EventsManagerService } from "../common/events-manager.service";

const TOKEN_AHEAD_EXPIRATION = 60; // seconds

@Injectable()
export class AuthService {
    clientSecret: string;
    clientId: string;
    webSocketsService: WebSocketsService;

    private refresTokenTimer: any = -1;
    private _tokenWillExpire: Subject<any>;

    get tokenWillExpire(): Observable<any> {
        return this._tokenWillExpire.asObservable();
    }

    constructor(
        private storage: StorageService,
        private database: DatabaseService,
        private eventsManagerService: EventsManagerService
    ) {
        this._tokenWillExpire = new Subject<any>();

        if (AppConfiguration.currentConfig.clientId) {
            this.setClientId(AppConfiguration.currentConfig.clientId);
        }

        if (AppConfiguration.currentConfig.clientSecret) {
            this.setClientSecret(AppConfiguration.currentConfig.clientSecret);
        }
    }

    setWebSocketsService(webSocketsService: WebSocketsService) {
        this.webSocketsService = webSocketsService;
    }

    logout() {
        if (this.webSocketsService && this.webSocketsService.isConnected) {
            this.webSocketsService.disconnect();
        }

        this.storage.clear();
        this.database.clear(['local_gateways']);

        this.eventsManagerService.trigger(EventsManagerService.ON_USER_SIGN_OUT);
    }

    isLoggedIn() {
        const loggedIn = this.getAccessToken() !== null && this.getUser() !== null;

        if (loggedIn && this.refresTokenTimer == -1) {
            const accessTokenRegistration = this.storage.get('ATR');
            const storedTokenLifetime = this.storage.get('ATL');
            if (accessTokenRegistration && storedTokenLifetime) {
                let tokenCreation = parseInt(accessTokenRegistration.toString());
                tokenCreation = Math.floor((Date.now() - tokenCreation) / 1000);

                let tokenLifetime: number = parseInt(storedTokenLifetime.toString());

                if (tokenCreation > tokenLifetime) {
                    this._tokenWillExpire.next(true);
                } else {
                    tokenLifetime = tokenLifetime - tokenCreation;

                    this.startRefreshTokenTimeout(tokenLifetime);
                }
            }
        }

        return loggedIn;
    }

    getAccessToken() {
        return this.storage.get('AT');
    }

    getRefreshToken() {
        return this.storage.get('RT');
    }

    setClientId(clientId: string) {
        this.clientId = clientId;
    }

    setClientSecret(clientSecret: string) {
        this.clientSecret = clientSecret;
    }

    getClientId() {
        return this.clientId;
    }

    getClientSecret() {
        return this.clientSecret;
    }

    private startRefreshTokenTimeout(ttl: number) {
        const checkExpiration = ttl < TOKEN_AHEAD_EXPIRATION ? ttl : ttl - TOKEN_AHEAD_EXPIRATION;

        if (this.refresTokenTimer) {
            clearTimeout(this.refresTokenTimer);
        }

        this.refresTokenTimer = setTimeout(() => {
            this._tokenWillExpire.next(true);
        }, checkExpiration * 1000);
    }

    getNewAccessTokenFromRefreshToken() {
        this._tokenWillExpire.next(true);
    }

    setAccessToken(accessToken: string, ttl: number) {
        this.startRefreshTokenTimeout(ttl);

        this.storage.set({ key: 'ATR', value: Date.now() });
        this.storage.set({ key: 'ATL', value: ttl });

        return this.storage.set({ key: 'AT', value: accessToken, ttl: ttl });
    }

    setRefreshToken(refreshToken: string) {
        if (refreshToken) {
            return this.storage.set({ key: 'RT', value: refreshToken });
        }
    }

    getUser() {
        return this.storage.get('US');
    }

    setUser(user: any) {
        return this.storage.set({ key: 'US', value: user });
    }

    setAccount(account: any) {
        return this.storage.set({ key: 'AC', value: account });
    }

    getAccount() {
        return this.storage.get('AC');
    }
}
