import { Model } from "../common/model";
import { ScenesService } from "../resources/scenes.service";
import { WebSocketsService } from "../websockets/websockets.service";
import { IWebSocketDeviceMessage } from "../websockets/websocket-device-message.interface";
import { Observable } from 'rxjs/Observable';
import { Subject } from 'rxjs/Subject';
import { Subscription } from "rxjs/Subscription";

export class SceneModel extends Model {
  private _onSceneData: Subject<any>;

  activate() {
    this.scenesService.post(this._id + '/activate').subscribe(() => { });
  }

  deactivate() {
    this.scenesService.post(this._id + '/deactivate').subscribe(() => { });
  }

  get enabled(): boolean {
    return this._data.enabled;
  }

  set enabled(value: boolean) {
    this._data.enabled = value;
  }

  get onSceneData(): Observable<any> {
    return this._onSceneData.asObservable();
  }

  constructor(
    protected scenesService: ScenesService, data: any,
    public webSocketsService: WebSocketsService,
  ) {
    super(scenesService, data);
    this._onSceneData = new Subject<any>();

    this.webSocketsService.onScenesMessage.subscribe((message: IWebSocketDeviceMessage) => {
      if (message.resourceId == this._id && message.data && message.data.response && message.data.response.value && message.data.response.value.enabled !== undefined) {
        this._onSceneData.next({ enabled: message.data.response.value.enabled });
      }
    });
  }
}