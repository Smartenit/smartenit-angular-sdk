import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";

export class NotificationServerPlugin extends SmartenitPlugin {
  sendEmail(emails: [string], subject: string, message: string): void {
    return this.executeMethod(this.componentId, this.processorName, 'SendEmail', {
      To: emails,
      Subject: subject,
      Text: message
    });
  }

  getEffectMethod(context?: any): string {
    return 'SendEmail';
  }

  getEffectAttribute(): string | null {
    return null;
  }

  getResponderAttribute(): string | null {
    return null;
  }

  getResponderMethod(): string {
    return 'SendEmail';
  }

  getStatus() {
    // void
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    // void

    return this.state;
  }

  getProcessedValue(value: any, attribute?: string, method?: string): any {
    if (!method) {
      return value;
    }

    let data = {
      To: {
        users: [],
        emails: []
      },
      Subject: value['Subject'],
      Text: value['Text']
    };

    if (method == "SendEmail") {
      data.To.emails = value.To.split(",");
    }

    if (method == "SendPushNotification") {
      data.To.users = value.To;
    }

    return data;
  }
}