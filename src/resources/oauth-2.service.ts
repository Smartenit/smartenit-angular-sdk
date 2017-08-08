import { Injectable, Inject } from '@angular/core';
import { Http } from '@angular/http';

import { APIClientService } from '../common/api-client.service';
import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { HttpInterceptor } from "../common/http-interceptor.service";
import { AppConfigurationService } from "../common/app-configuration.service";

import "rxjs/add/operator/do";
import "rxjs/add/observable/empty";

@Injectable()
export class Oauth2Service extends APIClientService {
    constructor(
        http: HttpInterceptor, authService: AuthService, eventsService: EventsManagerService,
        AppConfiguration: AppConfigurationService
    ) {
        super('oauth2', http, authService, eventsService, AppConfiguration);
        authService.tokenWillExpire.subscribe(() => {
            let subscription = this.refreshToken().subscribe(() => {
                subscription.unsubscribe();
            });
        })
    }

    logout() {
        this.authService.logout();
        setTimeout(() => {
            this.eventsManagerService.trigger(EventsManagerService.ON_USER_SIGN_OUT);
        }, 1000);
    }

    login(username: string, password: string): Observable<any> {
        this.authService.clearDB(['local_gateways']);

        const clientId = this.authService.getClientId();
        const clientSecret = this.authService.getClientSecret();

        if (!clientId || !clientSecret) {
            return Observable.throw(new Error('Undefined clientId and clientSecret in AuthService'));
        }

        return this.post('token', {
            grant_type: 'password',
            username: username,
            password: password,
            client_id: clientId,
            client_secret: clientSecret
        }, { credentials: false }).map(response => {
            if (response) {
                this.authService.setAccessToken(response.access_token, response.expires_in);
                this.authService.setRefreshToken(response.refresh_token);
                this.authService.setUser(response.data.user);
                this.authService.setAccount(response.data.account);

                this.eventsManagerService.trigger(EventsManagerService.ON_USER_SIGN_IN, response.data.user);
            }

            return response;
        });
    }

    authenticateClient(clientId: string, clientSecret: string): Observable<any> {
        return this.post('token', {
            grant_type: 'client_credentials',
            client_id: clientId,
            client_secret: clientSecret
        }, { credentials: false }).map(response => {
            if (response) {
                this.authService.setAccessToken(response.access_token, response.expires_in);
            }
        });
    }

    refreshToken(): Observable<any> {
        console.log('Refreshing Token...');

        const refreshToken = <any>this.authService.getRefreshToken();

        if (refreshToken) {

            this.eventsManagerService.trigger(EventsManagerService.ON_TOKEN_REFRESH_START)

            const requestData = {
                grant_type: 'refresh_token',
                refresh_token: refreshToken
            };

            return this.post('token', requestData)
                .do(response => {
                    console.log('[SDK Refresh Token] token refreshed');
                    this.authService.setAccessToken(response.access_token, response.expires_in);
                    this.eventsManagerService.trigger(EventsManagerService.ON_TOKEN_REFRESHED, { status: true, newAccessToken: 'Bearer ' + response.access_token });
                }, error => {
                    this.eventsManagerService.trigger(EventsManagerService.ON_TOKEN_REFRESHED, { status: false });
                    console.log('[SDK refreshToken error] Couldnt refresh token', error);
                    this.eventsManagerService.trigger(EventsManagerService.ON_TOKEN_REFRESH_ERROR, error);
                });
        } else {
            this.eventsManagerService.trigger(EventsManagerService.ON_TOKEN_REFRESH_ERROR);
            console.log('[SDK refreshToken error] Couldnt refresh token');
            return Observable.empty();
        }
    };
}