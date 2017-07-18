import { SmartenitPlugin } from "../smartenit-plugin";
import { ILockedUnlocked } from "../../interfaces/locked-unlocked.interface";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { Observable } from "rxjs/Observable";
import { Subscription } from "rxjs/Subscription";

import "rxjs/add/observable/forkJoin";

const CACHE_TIME: number = 12 * 60 * 60;

export class DoorLockPlugin extends SmartenitPlugin implements ILockedUnlocked {
  _lastUpdate: number = 0;

  lock(): void {
    return this.executeMethod(this.componentId, this.processorName, 'LockDoor', { Code: "" });
  }

  unlock(): void {
    return this.executeMethod(this.componentId, this.processorName, 'UnlockDoor', { Code: "" });
  }

  getLastUpdateTimestamp(): number {
    return this._lastUpdate;
  }

  isLocked(): boolean {
    return this.state === true;
  }

  isUnlocked(): boolean {
    return this.state === false;
  }

  getEffectOptions(): any {
    return [{
      name: 'Lock',
      value: {
        method: 'LockDoor'
      }
    },
    {
      name: 'Unlock',
      value: {
        method: 'UnlockDoor'
      }
    }];
  }

  getEffectAttribute(): string | null {
    return null;
  }

  getEffectMethod(context?: any): string | null {
    return null;
  }

  getConditionOptions(): any {
    return [{
      name: 'Is Locked',
      value: 1
    },
    {
      name: 'Is Unlocked',
      value: 2
    }];
  }

  getCachedValues(subscribe?: boolean): any {
    let cacheValues = [
      this.getCache('lastUpdate'),
      this.getCache()
    ];

    const observable = Observable.forkJoin(cacheValues).flatMap((array) => {
      if (array && array[0] != null) {
        this._lastUpdate = array[0];
      }

      if (array && array[1] != null) {
        this.state = array[1];
      }

      if (this.state != null) {
        this.device.cached = true;
      }

      this._onUpdate.next({
        lastUpdate: this._lastUpdate,
        state: this.state
      });

      return Observable.of(this.state);
    });

    if (subscribe === true) {
      return observable;
    }

    let subscription: Subscription = observable.subscribe(() => subscription.unsubscribe());
  }

  getConditionAttribute(): string {
    return 'LockState';
  }

  getStatusPayload(): any {
    return ['LockState'];
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const attribute = message && message.attributeOrMethod;

    if (attribute === 'state' || attribute === 'LockState') {
      const response = message && message.data && message.data.response;

      this.state = parseInt(response.value) === 1;

      this._lastUpdate = parseInt(response.timestamp);

      this.setCache('lastUpdate', this._lastUpdate, CACHE_TIME);

      this._onUpdate.next({ state: this.state, lastUpdate: this._lastUpdate });
    }

    return this.state;
  }
}