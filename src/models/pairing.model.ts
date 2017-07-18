import { Model } from "../common/model";
import { PairingsService } from "../resources/pairings.service";
import { WebSocketsService } from "../websockets/websockets.service";
import { IWebSocketDeviceMessage } from "../websockets/websocket-device-message.interface";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";

export class PairingModel extends Model {
  private _onPairingData: Subject<any>;
  private _onPairingStatus: Subject<any>;
  private _onPairingRemove: Subject<any>;

  retry() {
    this.pairingsService.post(this._id + '/retry').subscribe(() => { });
  }

  tryRemove(): Observable<any> {
    return this.pairingsService.post(this._id + '/remove', { ownerId: this.ownerId });
  }

  get target(): any {
    return this._data.target;
  }

  set target(value: any) {
    this._data.target = value;
  }

  get source(): any {
    return this._data.source;
  }

  set source(value: any) {
    this._data.source = value;
  }

  get pathId(): string {
    return this._data.pathId;
  }

  set pathId(value: string) {
    this._data.pathId = value;
  }

  get description(): string {
    return this._data.description;
  }

  set description(value: string) {
    this._data.description = value;
  }

  get state(): any {
    return this._data.state;
  }

  get ownerId(): any {
    return this._data.ownerId;
  }

  get onPairData(): Observable<any> {
    return this._onPairingData.asObservable();
  }

  get onPairStatus(): Observable<any> {
    return this._onPairingStatus.asObservable();
  }

  get onPairRemove(): Observable<any> {
    return this._onPairingRemove.asObservable();
  }

  constructor(
    protected pairingsService: PairingsService, data: any,
    public webSocketsService: WebSocketsService,
  ) {
    super(pairingsService, data);
    this._onPairingData = new Subject<any>();
    this._onPairingStatus = new Subject<any>();
    this._onPairingRemove = new Subject<any>();

    this.webSocketsService.onPairingsMessage.subscribe((message: IWebSocketDeviceMessage) => {
      if (message.resourceId == this._id && message.data && message.data.response
        && message.data.response.value) {
        // This line always overrides pairing.state value
        this._data.state = message.data.response.value;
        this._onPairingData.next({ data: message.data.response.value });
        if (message.componentId && message.componentId === 'remove') {
          message.data.response.value['pairId'] = this._id;
          this._onPairingRemove.next({ data: message.data.response.value });
        } else {
          this._onPairingStatus.next({ data: message.data.response.value });
        }
      }
    });
  }
}