import { DeviceModel } from "../models/device.model";
import { Subject } from 'rxjs/Subject';
import { Observable } from 'rxjs/Observable';
import { Subscription } from "rxjs/Subscription";
import { IWebSocketDeviceMessage } from "../websockets/websocket-device-message.interface";
import { ISmartenitPluginMessage } from "./smartenit-plugin-message.interface";
import { DatabaseService } from "../storage/database.service";
import { DevicesService } from "../resources/devices.service";
import { ActionsService } from "../resources/actions.service";
import { ConditionsService } from "../resources/conditions.service";
import { EffectsService } from "../resources/effects.service";
import { PluginUtilsService } from "./plugin-utils.service";

export abstract class SmartenitPlugin {
  private _name: string;
  private _device: DeviceModel;
  private _componentId: string;
  private _processorName: string;
  private _state: any;
  private _stateTTL: number;

  get stateTTL(): number {
    return this._stateTTL;
  }

  set stateTTL(value: number) {
    this._stateTTL = value;
  }

  get name(): string {
    return this._name;
  }

  get device(): DeviceModel {
    return this._device;
  }

  get componentId(): string {
    return this._componentId;
  }

  get processorName(): string {
    return this._processorName;
  }

  get state(): any {
    return this._state;
  }

  set state(value: any) {
    this._state = value;
  }

  saveState(state: any, ttl?: number) {
    this._state = state;

    if (ttl === undefined) {
      ttl = this.stateTTL;
    }

    this.setCache('state', this._state, ttl);
  }

  private _onData: Subject<ISmartenitPluginMessage>;

  get onData(): Observable<ISmartenitPluginMessage> {
    return this._onData.asObservable();
  }

  protected _onUpdate: Subject<any>;

  get onUpdate(): Observable<any> {
    return this._onUpdate.asObservable();
  }

  getStatus(context?: string, force?: boolean, subscribe?: boolean, payload?: any): void {
    if (payload && Object.keys(payload).length > 0) {
      payload = Object.assign(this.getStatusPayload(), payload);
    } else {
      payload = this.getStatusPayload();
    }

    if (force === true) {
      this._device.getStatus(this._componentId, this._processorName, payload)
    } else {
      this.getCachedValues(true).subscribe((cachedState: any) => {
        if (cachedState == null || cachedState == undefined) {
          this._device.getStatus(this._componentId, this._processorName, payload);
        }
      });
    }
  }

  getStatusPayload(): any {
    return {};
  }

  getCachedValues(subscribe?: boolean): any {
    const observable = this.getCache().map((cachedState: any) => {
      if (cachedState != null) {
        this.state = cachedState;

        this.device.cached = true;

        this._onUpdate.next({
          state: this.state
        });
      }

      return cachedState;
    });

    if (subscribe === true) {
      return observable;
    }

    let subscription: Subscription = observable.subscribe(() => subscription.unsubscribe());
  }

  private parseCachePath(path: string): any {
    if (path) {
      const parts = path.split('-');
      return { componentId: parts[0], processorName: parts[1], attributeOrMethod: parts[3] };
    }

    return null;
  }

  constructor(
    name: string,
    componentId: string,
    processorName: string,
    device: DeviceModel,
    public dbService: DatabaseService,
    public devicesService: DevicesService,
    public actionsService: ActionsService,
    public conditionsService: ConditionsService,
    public effectsService: EffectsService,
    public pluginUtilsService: PluginUtilsService
  ) {
    this._name = name;
    this._device = device;
    this._componentId = componentId;
    this._processorName = processorName;
    this._onUpdate = new Subject<any>();
    this._state = {};
    this._stateTTL = 10 * 60;

    device.onDeviceData
      .subscribe((message: IWebSocketDeviceMessage) => {
        this.processDeviceMessage(message);

        if (message && message.componentId === this._componentId && message.processorName === this._processorName) {
          this.saveState(this.processMessage(message));
        }
      });

    // handle api cache
    device.onDeviceResponse.subscribe((response: any) => {
      if (response && response.response && response.response.apiCache == true) {
        const { componentId, processorName, attributeOrMethod } = this.parseCachePath(response.key);

        if (componentId != undefined && processorName != undefined && attributeOrMethod != undefined) {
          if (response.response.data) {
            // sort cache based on timestamp for consistency
            let responseData = response.response.data;

            responseData.sort((a: any, b: any) => {
              return a && a.v ? a.v.timestamp - b.v.timestamp : 0;
            });

            for (var i = 0; i < responseData.length; i++) {
              let singleResponse = responseData[i];

              if (singleResponse && singleResponse.v && singleResponse.attr) {
                let message: IWebSocketDeviceMessage = {
                  data: { response: singleResponse.v },
                  resource: 'devices',
                  resourceId: this.device._id,
                  componentId: componentId,
                  processorName: processorName,
                  attributeOrMethod: singleResponse.attr
                };

                // trigger local message to websocket to follow same process
                device.webSocketsService.proxyMessage(message);
              }
            }
          }
        }
      }
    });

    // Get cached state
    this.getCachedValues(true).subscribe((cachedState: any) => {
      if (cachedState !== undefined && cachedState != null) {
        this._state = cachedState;
      }

      this.onInit();
    }, () => {
      this.onInit();
    })
  }

  abstract processMessage(data: IWebSocketDeviceMessage): any;

  processDeviceMessage(data: IWebSocketDeviceMessage): any {

  }

  getRawValue(value: any, attribute?: string, method?: string): any {
    return value;
  }

  getProcessedValue(value: any, attribute?: string, method?: string): any {
    return value;
  }

  /**
   * Executed when the plugin has loaded cache information if available
   */
  onInit() {

  }

  getCacheKey(category: string = ''): string {
    return [this._device._id, this._componentId, this._processorName, category].join('_');
  }

  setCache(category: string, data: any, ttl?: number, subscribe?: boolean): any {
    const observable = this.dbService.getCollection('devices_cache').save(this.getCacheKey(category), data, ttl);

    if (subscribe === true) {
      return observable;
    }

    return observable.subscribe(() => {
    });
  }

  getCache(category: string = 'state'): Observable<any> {
    return this.dbService.getCollection('devices_cache').getById(this.getCacheKey(category));
  }

  executeMethod(
    componentId: string, processorName: string, method: string, payload: any, requestStatus?: boolean, payloadStatus?: any, query?: string
  ) {
    if (requestStatus == undefined) {
      requestStatus = true;
    }

    if (requestStatus && payloadStatus == undefined) {
      payloadStatus = this.getStatusPayload();
    }

    this._device.executeMethod(componentId, processorName, method, payload, requestStatus, payloadStatus, query);
  }

  setAttributeWithSubscribeOption(
    componentId: string, processorName: string, attribute: string, payload: any,
    subscribe: boolean, readAttribute?: boolean
  ) {
    const observable = this._device.setAttribute(componentId, processorName, attribute, payload, readAttribute);

    if (subscribe === true) {
      return observable;
    }

    let subscription: Subscription = observable.subscribe(() => subscription.unsubscribe());
  }


  getAttributeWithSubscribeOption(
    componentId: string, processorName: string, attribute: string, payload: any,
    subscribe: boolean, query?: string
  ) {
    const observable = this._device.getAttribute(componentId, processorName, attribute, payload, query);

    if (subscribe === true) {
      return observable;
    }

    let subscription: Subscription = observable.subscribe(() => subscription.unsubscribe());
  }
}