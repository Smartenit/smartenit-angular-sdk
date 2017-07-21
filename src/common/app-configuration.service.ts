import { Injectable, Inject } from '@angular/core';
import { ISmartenitConfig } from "../smartenit-config.interface";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { INITIAL_CONFIG } from "../smartenit-initial-config";

export const BACKEND_DATA_LIMIT = 25;

@Injectable()
export class AppConfigurationService {
    private _currentConfig: ISmartenitConfig;
    private _initialConfig: ISmartenitConfig;
    private _onConfigChange: Subject<any> = new Subject<any>();
    private initialAPIUrl: string;

    constructor( @Inject(INITIAL_CONFIG) config: ISmartenitConfig) {
        this.initialConfig = config;
    }

    get onConfigChange(): Observable<any> {
        return this._onConfigChange.asObservable();
    }

    restoreInitialConfiguration() {
        this._currentConfig = Object.assign({}, this._initialConfig);
        this.setAPIURL(this._currentConfig.apiURL);
    }

    set initialConfig(config: ISmartenitConfig) {
        if (!config.currentAPIVersion) {
            config.currentAPIVersion = 'v2';
        }

        this._initialConfig = Object.assign({}, config);
        this._currentConfig = Object.assign({}, config);
    }

    public get currentConfig(): ISmartenitConfig {
        return this._currentConfig;
    }

    public get currentAPIURL(): string {
        return this._currentConfig.apiURL;
    }

    public set useLocalConnection(value: boolean) {
        this._currentConfig.useLocalConnection = value;
    }

    public get useLocalConnection(): boolean {
        return this._currentConfig.useLocalConnection || false;
    }

    public setAPIURL(apiURL: string) {
        console.log('API URL set to: ' + apiURL);
        this._currentConfig.apiURL = apiURL;
        this._currentConfig.apiURLSet = true;

        this._onConfigChange.next({ config: this._currentConfig });
    }

    public setCurrentGateway(gateway: any) {
        this._currentConfig.currentGateway = gateway;
    }
}