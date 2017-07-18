import {IWebSocketDeviceMessage} from "../websockets/websocket-device-message.interface";

export interface ISmartenitPluginMessage {
    originalMessage: IWebSocketDeviceMessage;
    state: any
}