import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from "rxjs/Subscription";
import { DevicesService } from "../resources/devices.service";
import { DatabaseService } from "../storage/database.service";
import { WebSocketsService } from "../websockets/websockets.service";
import { IWebSocketDeviceMessage } from "../websockets/websocket-device-message.interface";
import { PluginFactoryService } from "../plugins/plugin-factory.service";
import { SmartenitPlugin } from "../plugins/smartenit-plugin";
import { Model } from "../common/model";
import { DeviceState } from "./device-state.enum";

export class DeviceModel extends Model {
  private _plugins: any;
  private _type: string;
  private _model: string;
  private _processors: any;
  private _online: boolean;
  private _cachedData: boolean;
  private _onlineTimeout: any;
  private _ownerId: string;
  private _parents: any;
  private _state: string;

  private static _requests: any = {};
  private static _totalRequestCount: number = 0;

  private _deviceRequests: any = null;
  private firstRequest: boolean = true;

  private queueInterval: any;
  private deviceSocketSubscription: Subscription;

  get processors(): any {
    return this._processors;
  }

  get model(): string {
    return this._model;
  }

  get meta(): any {
    return this._data.meta;
  }

  set meta(value: any) {
    this._data.meta = value;
  }

  get type(): string {
    return this._type;
  }

  get plugins(): any {
    return this._plugins;
  }

  get domain(): any {
    return this._data.domain;
  }

  get hwId(): boolean {
    return this._data.hwId;
  }

  get online(): boolean {
    return this._online;
  }

  get cached(): boolean {
    return this._cachedData;
  }

  set cached(value: boolean) {
    this._cachedData = value;

    this._onDeviceOnlineState.next({ cached: this._cachedData, online: this._online });
  }

  get ownerId(): string {
    return this._ownerId;
  }

  get parents(): any {
    return this._parents;
  }

  private _onDeviceData: Subject<IWebSocketDeviceMessage>;

  get onDeviceData(): Observable<IWebSocketDeviceMessage> {
    return this._onDeviceData.asObservable();
  }

  private _onDeviceOnlineState: Subject<any>;

  get onDeviceOnlineState(): Observable<IWebSocketDeviceMessage> {
    return this._onDeviceOnlineState.asObservable();
  }

  private _onDeviceResponse: Subject<any>;

  get onDeviceResponse(): Observable<any> {
    return this._onDeviceResponse.asObservable();
  }

  private static getPluginKey(componentId: string, processorName: string): string {
    return ['comp', componentId, 'proc', processorName].join('_');
  }

  constructor(
    data: any,
    protected devicesService: DevicesService,
    protected dbService: DatabaseService,
    public webSocketsService: WebSocketsService,
    protected pluginFactory: PluginFactoryService
  ) {
    super(devicesService, data);
    this._onDeviceData = new Subject<IWebSocketDeviceMessage>();
    this._onDeviceResponse = new Subject<any>();
    this._onDeviceOnlineState = new Subject<any>();
    this._online = false;
    this._plugins = {};
    this._processors = [];

    this.loadBasicInfo(this, data);
    this.loadPluginsAndProcessors(this, data);

    this.queueInterval = setInterval(() => {
      this.drainQueue();
    }, 2 * 1000);
  }

  loadBasicInfo(deviceInstance: DeviceModel, data: any) {
    if (data && data.hasOwnProperty('_id')) {
      deviceInstance.__id = data._id;
      deviceInstance._type = data.config && data.config.type ? data.config.type : data.type;
      deviceInstance._model = data.config && data.config.model ? data.config.model : null;
      deviceInstance._ownerId = data.ownerId;
      deviceInstance._parents = data.parents;
      deviceInstance._state = data.state;

      this.deviceSocketSubscription = deviceInstance.webSocketsService.onDeviceMessage
        .subscribe((message: IWebSocketDeviceMessage) => {
          if (message.resourceId == deviceInstance._id) {
            deviceInstance._online = true;

            deviceInstance._onDeviceData.next(message);

            deviceInstance._onDeviceOnlineState.next({ cached: deviceInstance.cached, online: deviceInstance.online });

            this.clearOfflineTimeout();
          }
        });
    }
  }

  loadPluginsAndProcessors(deviceInstance: DeviceModel, data: any) {
    deviceInstance._processors = [];
    let plugin: SmartenitPlugin | null = null;

    // Load plugins
    if (data.hasOwnProperty('components')) {
      let pluginKey = '';
      for (let i = 0; i < data.components.length; i++) {
        let component = data.components[i];

        for (let j = 0; j < component.processors.length; j++) {
          let processor = component.processors[j];

          pluginKey = DeviceModel.getPluginKey(component.id, processor.name);

          plugin = deviceInstance.pluginFactory.createPlugin(processor.name, component.id, processor.name, deviceInstance, deviceInstance.devicesService);

          processor.componentId = component.id;
          deviceInstance._processors.push(processor);

          deviceInstance._plugins[pluginKey] = plugin;
        }
      }
    }
  }

  getPlugin(componentId: string, processorName: string): SmartenitPlugin | null {
    const pluginKey: string = DeviceModel.getPluginKey(componentId, processorName);

    if (this._plugins.hasOwnProperty(pluginKey)) {
      return this._plugins[pluginKey];
    }

    return null;
  }

  getStatus(componentId: string, processorName: string, payload?: any, query?: string): void {
    this.executeMethod(componentId, processorName, 'status', payload, false, null, query);
  }

  private innerExecuteMethod(componentId: string, processorName: string, method: string, payload?: any, requestStatus?: boolean, statusPayload?: any, query?: string): any {
    let path = [this._id, 'comps', componentId, 'procs', processorName, 'methods', method].join('/');

    if (requestStatus === undefined) {
      requestStatus = true;
    }

    if (method != 'status' && requestStatus) {
      setTimeout(() => {
        this.getStatus(componentId, processorName, statusPayload, 'cached=false');
      }, 500);
    }

    if (query) {
      path += '?' + query;
    }

    return this.devicesService.post(path, payload);
  }

  private drainQueue() {
    if (!this.isReady())
      return;

    if (this._deviceRequests) {
      const keys = Object.keys(this._deviceRequests)

      if (this.firstRequest && this._deviceRequests && keys.length > 0) {
        this.firstRequest = false;

        let firstRequest = this._deviceRequests[keys[0]];

        if (firstRequest) {
          this.drainRequest(firstRequest, keys[0]);
        }
      } else if (this.online && keys.length > 0) {

        for (let i = 0; i < keys.length; i++) {
          let request = this._deviceRequests[keys[i]];
          if (request) {
            this.drainRequest(request, keys[i]);
          }
        }
      }
    }
  }

  private drainRequest(request: Observable<any>, key: any) {
    if (!this.isReady())
      return;

    request.subscribe((response: any) => {
      this._onDeviceResponse.next({ response, key });
    });

    delete this._deviceRequests[key];
  }

  private addToQueue(componentId: string, processorName: string, method: string, payload?: any, requestStatus?: boolean, payloadStatus?: any, query?: string) {
    const path = [componentId, processorName, 'methods', method].join('-');

    if (!this._deviceRequests) {
      this._deviceRequests = {};
    }

    if (this._deviceRequests[path]) {
      this._deviceRequests[path] = this.innerExecuteMethod(componentId, processorName, method, payload, requestStatus, payloadStatus, query);
      this.drainRequest(this._deviceRequests[path], path);
    } else {
      this._deviceRequests[path] = this.innerExecuteMethod(componentId, processorName, method, payload, requestStatus, payloadStatus, query);
    }
  }

  executeMethod(
    componentId: string, processorName: string, method: string, payload?: any, requestStatus?: boolean, payloadStatus?: any, query?: string
  ): void {
    this.startOfflineTimeout();

    const path = [this._id, 'comps', componentId, 'procs', processorName, 'methods', method].join('/');

    if (payload === null) {
      payload = {};
    }

    this.addToQueue(componentId, processorName, method, payload, requestStatus, payloadStatus, query);
    this.drainQueue();
  }

  getAttribute(componentId: string, processorName: string, attribute: string, payload?: any, query?: string): Observable<any> {
    if (!this.isReady())
      return Observable.empty();

    this.startOfflineTimeout();

    let path = [this._id, 'comps', componentId, 'procs', processorName, 'attrs', attribute].join('/');

    if (query) {
      path += '?' + query;
    }

    return this.devicesService.get(path, payload)
      .map((response: any) => {
        this._onDeviceResponse.next({ response: response, key: [componentId, processorName, 'attrs', attribute].join('-') });
        return response;
      });
  }

  setAttribute(componentId: string, processorName: string, attribute: string, value: any, readAttribute?: boolean): Observable<any> {
    if (!this.isReady())
      return Observable.empty();

    this.startOfflineTimeout();

    const path = [this._id, 'comps', componentId, 'procs', processorName, 'attrs', attribute].join('/');

    if (readAttribute === undefined) {
      readAttribute = true;
    }

    if (readAttribute) {
      setTimeout(() => {
        this.getAttribute(componentId, processorName, attribute, null, 'cached=false').subscribe((response) => {
          this._onDeviceResponse.next({ response: response, key: path });
        });
      }, 500);
    }

    return this.devicesService.put(path, value).map((response) => {
      this._onDeviceResponse.next({ response: response, key: path });

      return response;
    })
  }

  getProcessor(name: string): any {
    for (let i = 0; i < this._processors.length; i++) {
      let processor = this._processors[i];
      if (processor && processor.name === name) {
        return processor;
      }
    }

    return null;
  }

  getComponent(id: string): any {
    for (let i = 0; i < this._data.components.length; i++) {
      let component = this._data.components[i];
      if (component && component.id === id) {
        return component;
      }
    }

    return null;
  }

  isChildrenOf(id: string, hwId: string) {
    return this._ownerId === hwId ||
      (this._parents && this._parents.devices && this._parents.devices.some((p: any) => p.id === id));
  }

  isReady() {
    return this._state && (<any>DeviceState)[this._state.toUpperCase()] === DeviceState.READY;
  }

  startOfflineTimeout() {
    if (this._onlineTimeout === null) {
      this._onlineTimeout = setTimeout(() => {
        this._online = false;
        this.firstRequest = true;
        this._onDeviceOnlineState.next({ online: false });
      }, 60 * 10 * 1000);
    }
  }

  clearOfflineTimeout() {
    if (this._onlineTimeout !== null) {
      clearTimeout(this._onlineTimeout);
      this._onlineTimeout = null;
    }
  }

  clearResources() {
    if (this.queueInterval) {
      clearInterval(this.queueInterval);
    }

    if (this.deviceSocketSubscription) {
      this.deviceSocketSubscription.unsubscribe();
    }
  }
}
