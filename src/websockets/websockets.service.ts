import { Injectable, Inject, EventEmitter } from '@angular/core';
import { Http } from '@angular/http';

import { APIClientService } from '../common/api-client.service';
import { AuthService } from "../auth/auth.service";
import { EventsManagerService } from "../common/events-manager.service";
import { Oauth2Service } from "../resources/oauth-2.service";
import { ISmartenitConfig } from "../smartenit-config.interface";
import { IWebSocketDeviceMessage } from "./websocket-device-message.interface";
import { Observable } from 'rxjs/Observable';
import { Subject } from "rxjs/Subject";
import { HttpInterceptor } from "../common/http-interceptor.service";

declare let Paho: any;

const MAX_RETRIES = 5;

@Injectable()
export class WebSocketsService extends APIClientService {
  private _isConnected: boolean;
  private client: any;
  private reconnectionAttempts: number;

  private _onConnectionLost: Subject<any>;
  private _onConnect: Subject<any>;
  private _onConnectError: Subject<any>;
  private _onSubscribe: Subject<any>;
  private _onDeviceMessage: Subject<any>;
  private _onEventsMessage: Subject<any>;
  private _onScenesMessage: Subject<any>;
  private _onPairingsMessage: Subject<any>;
  private _onReady: Subject<any>;

  private _clientDisconnect: boolean = false;

  get onConnectionLost(): Observable<any> {
    return this._onConnectionLost.asObservable();
  }

  get onConnect(): Observable<any> {
    return this._onConnect.asObservable();
  }

  get onConnectError(): Observable<any> {
    return this._onConnectError.asObservable();
  }

  get onSubscribe(): Observable<any> {
    return this._onSubscribe.asObservable();
  }

  get onDeviceMessage(): Observable<any> {
    return this._onDeviceMessage.asObservable();
  }

  get onScenesMessage(): Observable<any> {
    return this._onScenesMessage.asObservable();
  }

  get onPairingsMessage(): Observable<any> {
    return this._onPairingsMessage.asObservable();
  }

  get onEventsMessage(): Observable<any> {
    return this._onEventsMessage.asObservable();
  }

  get onReady(): Observable<any> {
    return this._onReady.asObservable();
  }

  constructor(http: HttpInterceptor, authService: AuthService, public oauthService: Oauth2Service, public eventsService: EventsManagerService) {
    super('websockets', http, authService, eventsService);
    this._isConnected = false;

    this._onDeviceMessage = new Subject();
    this._onEventsMessage = new Subject();
    this._onScenesMessage = new Subject();
    this._onPairingsMessage = new Subject();
    this._onConnectionLost = new Subject();
    this._onConnect = new Subject();
    this._onConnectError = new Subject();
    this._onSubscribe = new Subject();
    this._onReady = new Subject();
    this.reconnectionAttempts = 0;

    this.eventsManagerService.onTokenRefreshed.subscribe((success) => {
      if (success) {
        this.disconnect(true);
      }
    });

    this.authService.setWebSocketsService(this)
  }

  get isConnected(): boolean {
    return this._isConnected;
  }

  connect() {
    this._clientDisconnect = false;
    if (!this.isConnected) {
      let subscription = this.post('auth').subscribe((authResponse) => {
        this.connectToMQTTBroker(authResponse.hostUrl, authResponse.clientId, authResponse.topics);
        subscription.unsubscribe();
      });
    } else {
      console.error('WebSockets: already connected');
    }
  }

  disconnect(retryable: boolean = false) {
    this._clientDisconnect = !retryable;
    if (this.client && this.isConnected) {
      this.client.disconnect();
    }
  }

  send(topic: string, message: any) {
    if (!this.client || !this.isConnected) {
      throw new Error('WebSockets: not connected connected');
    }

    let messageObject: any = new Paho.MQTT.Message(JSON.stringify(message));
    messageObject.destinationName = topic;
    this.client.send(messageObject);
  }

  private parseMessage(message: any) {
    let payload = {};

    if (message.payloadString && message.payloadString.length > 0) {
      try {
        payload = JSON.parse(message.payloadString);
      } catch (e) {
        console.error('Error parsing JSON payload from MQTT broker');
      }
    }

    const topic = message.destinationName;

    let split = topic.split('/');

    if (split && split.length >= 3) {
      let parsedMessage: IWebSocketDeviceMessage = {
        resource: split[3],
        resourceId: split[4],
        data: payload
      };

      if (split.length >= 5) {
        parsedMessage.componentId = split[5];
      }

      if (split.length >= 6) {
        parsedMessage.processorName = split[6];
      }

      if (split.length >= 7) {
        parsedMessage.attributeOrMethod = split[7];
      }

      return parsedMessage;
    }

    return null;
  }

  proxyMessage(message: IWebSocketDeviceMessage | null): void {
    if (message) {
      switch (message.resource) {
        case 'devices':
          this._onDeviceMessage.next(message);
          break;
        case 'events':
          this._onEventsMessage.next(message);
          break;
        case 'scenes':
          this._onScenesMessage.next(message);
          break;
        case 'pairings':
          this._onPairingsMessage.next(message);
          break;
      }
    }
  }

  private connectToMQTTBroker(hostUrl: string, clientId: string, topics: string[]) {
    this._isConnected = false;

    this.client = new Paho.MQTT.Client(hostUrl, clientId);

    this.client.onConnectionLost = (responseObject: Object) => {
      this._isConnected = false;
      this._onConnectionLost.next(responseObject);

      if (!this._clientDisconnect) {
        if (this.reconnectionAttempts < MAX_RETRIES) {
          this.reconnectionAttempts++;
          setTimeout(() => {
            this.connect();
          }, 1000);
        }
      }
    };

    this.client.onMessageArrived = (message: any) => {
      const parsedMessage = this.parseMessage(message);

      this.proxyMessage(parsedMessage);
    };

    this.client.connect({
      useSSL: true,
      timeout: 3,
      mqttVersion: 4,
      keepAliveInterval: 1700,
      onSuccess: () => {
        this._isConnected = true;
        this._onConnect.next({});
        this.reconnectionAttempts = 0;

        for (let i = 0; i < topics.length; i++) {
          let topic = topics[i];
          this.client.subscribe(topic, {
            onSuccess: () => {
              this._onSubscribe.next(topic);

              if (i >= topics.length - 1) {
                this._onReady.next({});
              }
            }
          });
        }
      },
      onFailure: (error: any) => {
        this._isConnected = false;

        this._onConnectError.next(error);

        if (this.reconnectionAttempts < MAX_RETRIES) {
          this.reconnectionAttempts++;
          setTimeout(() => {
            this.connect();
          }, 1000);
        }
      }
    });
  }
}