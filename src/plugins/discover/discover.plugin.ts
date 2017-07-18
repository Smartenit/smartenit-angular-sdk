import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { Observable } from "rxjs/Observable";

export class DiscoverPlugin extends SmartenitPlugin {
  private interval: any;
  private iteration: number;
  private progress: number;
  private discovering: boolean;
  private discoverTime: number;

  onInit() {
    if (this.state != null &&
      this.state.discovering &&
      this.state.hasOwnProperty('discoverTime') &&
      this.state.hasOwnProperty('iteration')
    ) {
      this.startInterval(this.state.discoverTime, this.state.iteration);
    }
  }

  startDiscovery(discoverTime: number = 254): void {
    this.reset();

    const payload = { duration: discoverTime };
    this.discovering = true;

    this.startInterval(discoverTime);

    this.executeMethod(this.componentId, this.processorName, 'discover', payload);
  }

  private startInterval(discoverTime: number, currentIteration?: number) {
    clearInterval(this.interval);

    if (currentIteration !== undefined) {
      if (currentIteration >= discoverTime) {
        this.reset();
        return;
      }
      this.iteration = currentIteration;
    }

    this.discoverTime = discoverTime;

    this.interval = setInterval(() => {
      this.progress = Math.floor(this.iteration++ / this.discoverTime * 100);
      this.saveState({
        progress: this.progress,
        discovering: this.discovering,
        discoverTime: this.discoverTime,
        iteration: this.iteration
      }, this.discoverTime - this.iteration);

      this._onUpdate.next({ progress: this.progress });

      if (this.iteration >= this.discoverTime) {
        clearInterval(this.interval);
        this.reset();
      }
    }, 1000);
  }

  getProgress(): number {
    return this.progress;
  }

  stopDiscovery(): void {
    this.reset();

    const payload = { duration: 0 };
    this.executeMethod(this.componentId, this.processorName, 'discover', payload);
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    return this.state;
  }

  private reset() {
    this.iteration = 1;
    this.progress = 0;
    clearInterval(this.interval);
    this.discovering = false;

    this.saveState({ progress: this.progress, discovering: this.discovering, iteration: this.iteration });
  }
}