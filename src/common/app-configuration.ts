import { ISmartenitConfig } from "../smartenit-config.interface";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

export const BACKEND_DATA_LIMIT = 25;

export class AppConfiguration {
  private static _currentConfig: ISmartenitConfig;
  private static _initialConfig: ISmartenitConfig;
  private static _onConfigChange: Subject<any> = new Subject<any>();
  private static initialAPIUrl: string;

  static get onConfigChange(): Observable<any> {
    return AppConfiguration._onConfigChange.asObservable();
  }

  static restoreInitialConfiguration() {
    AppConfiguration._currentConfig = Object.assign({}, AppConfiguration._initialConfig);
    AppConfiguration.setAPIURL(AppConfiguration._currentConfig.apiURL);
  }

  static set initialConfig(config: ISmartenitConfig) {
    if (!config.currentAPIVersion) {
      config.currentAPIVersion = 'v2';
    }

    AppConfiguration._initialConfig = Object.assign({}, config);
    AppConfiguration._currentConfig = Object.assign({}, config);
  }

  public static get currentConfig(): ISmartenitConfig {
    return AppConfiguration._currentConfig;
  }

  public static get currentAPIURL(): string {
    return AppConfiguration._currentConfig.apiURL;
  }

  public static set useLocalConnection(value: boolean) {
    AppConfiguration._currentConfig.useLocalConnection = value;
  }

  public static get useLocalConnection(): boolean {
    return AppConfiguration._currentConfig.useLocalConnection || false;
  }

  public static setAPIURL(apiURL: string) {
    console.log('API URL set to: ' + apiURL);
    AppConfiguration._currentConfig.apiURL = apiURL;

    AppConfiguration._onConfigChange.next({ config: AppConfiguration._currentConfig });
  }

  public static setCurrentGateway(gateway: any) {
    AppConfiguration._currentConfig.currentGateway = gateway;
  }
}