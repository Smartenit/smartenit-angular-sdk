import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { Observable } from "rxjs/Observable";

const CACHE_TIME: number = -1;

export class IASZoneServerPlugin extends SmartenitPlugin {
  private _type: any;
  private _zoneId: number;
  private _cieParent: string;
  private _enrolled: boolean;

  static readonly TYPES: any = {
    '0x0000': {
      type: "Standard CIE",
      alarm1: "System Alarm",
      alarm2: ""
    },
    '0x000d': {
      type: "Motion sensor",
      condition: {
        activeMessage: "Motion",
        idleMessage: "No Motion"
      },
      state: {
        activeMessage: "MOTION",
        idleMessage: "NO MOTION"
      }
    },
    '0x0015': {
      type: "Contact switch",
      condition: {
        activeMessage: "is Open",
        idleMessage: "is Closed"
      },
      state: {
        activeMessage: "OPEN",
        idleMessage: "CLOSED"
      }
    },
    '0x0028': {
      type: "Fire sensor",
      condition: {
        activeMessage: "Fire Detected",
        idleMessage: "No Fire"
      },
      state: {
        activeMessage: "FIRE DETECTED",
        idleMessage: "NO FIRE"
      }
    },
    '0x002a': {
      type: "Water sensor",
      condition: {
        activeMessage: "Leak Detected",
        idleMessage: "No Leak"
      },
      state: {
        activeMessage: "LEAK",
        idleMessage: "NO LEAK"
      },
      bitmask: 3
    },
    '0x002b': {
      type: "Carbon Monoxide (CO) sensor",
      condition: {
        activeMessage: "CO Detected",
        idleMessage: "No CO"
      },
      state: {
        activeMessage: "CO DETECTED",
        idleMessage: "NO CO"
      }
    },
    '0x002c': {
      type: "Personal emergency device",
      condition: {
        activeMessage: "Emergency Detected",
        idleMessage: "No Emergency"
      },
      state: {
        activeMessage: "EMERGENCY",
        idleMessage: "NO EMERGENCY"
      }
    },
    '0x002d': {
      type: "Vibration/Movement sensor",
      condition: {
        activeMessage: "Vibration Detected",
        idleMessage: "No Vibration"
      },
      state: {
        activeMessage: "VIBRATION DETECTED",
        idleMessage: "NO VIBRATION"
      }
    },
    '0x010f': {
      type: "Remote control",
      alarm1: "Panic",
      alarm2: "Emergency"
    },
    '0x0115': {
      type: "Key fob",
      alarm1: "Panic",
      alarm2: "Emergency"
    },
    '0x021d': {
      type: "Keypad",
      alarm1: "Panic",
      alarm2: "Emergency"
    },
    '0x0225': {
      type: "Standard warning device",
      alarm1: "",
      alarm2: ""
    },
    '0x0226': {
      type: "Glass break sensor",
      condition: {
        activeMessage: "Glass Break Detected",
        idleMessage: "No Glass Break"
      },
      state: {
        activeMessage: "GLASS BREAK DETECTED",
        idleMessage: "NO GLASS BREAK"
      }
    },
    '0x0229': {
      type: "Security repeater",
      alarm1: "",
      alarm2: ""
    }
  };

  onInit() {
    this.getCacheZoneValues();
  }

  get type(): any {
    return this._type;
  }

  get cieParent(): string {
    return this._cieParent;
  }

  belongsToPanel(panelHwId: string): boolean {
    return panelHwId === this._cieParent;
  }

  setType(value: any) {
    if (IASZoneServerPlugin.TYPES.hasOwnProperty(value)) {
      this._type = IASZoneServerPlugin.TYPES[value];
      this.setCache('type', this._type, CACHE_TIME);
    }
  }

  getStateMessage(context: any = null) {
    let type = this._type && this._type.state ? this._type.state : { activeMessage: 'Active', idleMessage: 'Idle' };
    return this.isActive() ? type.activeMessage : type.idleMessage;
  }

  get zoneId(): number {
    return this._zoneId;
  }

  isActive(): boolean {
    return ((this.state && this.state.alarm1 && this.state.alarm1.value)
      || (this.state && this.state.alarm2 && this.state.alarm2.value));
  }

  isEnrolled(): boolean {
    return this._enrolled;
  }

  updatedAt(): Date {
    return this.state && this.state.sensed_at ? this.state.sensed_at : new Date();
  }

  private parseStatus(status: number) {
    let _status: number = 0xffff & status;
    let mask: number = 0x0001;
    let rsp: any = {
      alarm1: {
        value: _status & mask,
        string: _status & mask ? "opened/alarmed" : "closed/not alarmed"
      },
      alarm2: {
        value: (_status >> 1) & mask,
        string: (_status >> 1) & mask ? "opened/alarmed" : "closed/not alarmed"
      },
      tamper: {
        value: (_status >> 2) & mask,
        string: (_status >> 2) & mask ? "Tampered" : "Not tampered"
      },
      battery: {
        value: (_status >> 3) & mask,
        string: (_status >> 3) & mask ? "Low battery" : "Battery Ok"
      },
      trouble: {
        value: (_status >> 6) & mask,
        string: (_status >> 6) & mask ? "Trouble/Failure" : "OK"
      },
      ac_main: {
        value: (_status >> 7) & mask,
        string: (_status >> 7) & mask ? "AC/Mains fault" : "AC/Mains OK"
      },
      test: {
        value: (_status >> 8) & mask,
        string: (_status >> 8) & mask ? "Sensor is in test mode" : "Sensor is in operation mode"
      },
      battery_defect: {
        value: (_status >> 9) & mask,
        string: (_status >> 9) & mask ? "Sensor detects a defective battery" : "Sensor battery is functioning normally"
      },
      sensed_at: new Date()
    };

    return rsp;
  }

  getStatusPayload(): any {
    return ['ZoneStatusChangeNotification'];
  }

  getStatus(context?: string, force?: boolean, asObservable?: boolean, payload?: any) {
    super.getStatus(context, true, asObservable, payload);
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const attribute = message && message.attributeOrMethod;

    const response = message && message.data && message.data.response;
    const value = response && response.value;

    if (attribute === 'ZoneStatus') {
      this.state = this.parseStatus(parseInt(response.value));
      this.saveState(this.state, CACHE_TIME);
      this._onUpdate.next({ state: this.state });

    } else if (attribute === 'ZoneStatusChangeNotification') {
      this.state = this.parseStatus(parseInt(response.value['ZoneStatus']));
      this.saveState(this.state, CACHE_TIME);
      this._onUpdate.next({ state: this.state });

    } else if (attribute === 'ZoneType' && IASZoneServerPlugin.TYPES.hasOwnProperty(response.value)) {
      this._type = IASZoneServerPlugin.TYPES[response.value];
      this.setCache('type', this._type, CACHE_TIME);
      this._onUpdate.next({ type: this._type });
    } else if (attribute === 'ZoneID') {
      this._zoneId = response.value;
      this.setCache('zoneId', this._zoneId, CACHE_TIME);
      this._onUpdate.next({ zoneId: this._zoneId });
    } else if (attribute === 'IAS_CIE_Address') {
      this._cieParent = 'IASACE-' + response.value.replace(/0x/g, '').toLowerCase();
      this.setCache('cieParent', this._cieParent, CACHE_TIME);
      this._onUpdate.next({ cieParent: this._cieParent });
    } else if (attribute === 'ZoneState') {
      this._enrolled = response.value === "0x01" ? true : false;
      this.setCache('enrolled', this._enrolled, CACHE_TIME);
      this._onUpdate.next({ enrolled: this._enrolled });
    }

    return this.state;
  }

  private getCacheZoneValues() {
    let cacheValues = [
      this.getCache('zoneId'),
      this.getCache('type'),
      this.getCache('cieParent'),
      this.getCache('enrolled'),
      this.getCache()
    ];

    Observable.forkJoin(cacheValues).subscribe((array) => {
      if (array && array[0] != null) {
        this._zoneId = array[0];
      } else {
        this._zoneId = 0;
      }

      if (array && array[1] != null) {
        this._type = array[1];
      } else {
        this._type = {};
      }

      if (array && array[2] != null) {
        this._cieParent = array[2];
      } else {
        this._cieParent = "";
      }

      if (array && array[3] != null) {
        this._enrolled = array[3];
      } else {
        this._enrolled = false;
      }

      if (array && array[4] != null) {
        this.state = array[4];
      } else {
        this.state = {};
      }

      this._onUpdate.next({
        zoneId: this._zoneId,
        type: this._type,
        cieParent: this._cieParent,
        enrolled: this._enrolled,
        state: this.state,
      });
    });
  }

  getZoneType(asObservable?: boolean) {
    if (asObservable) {
      const payload = {};
      const query = 'timeout=3';
      return this.getAttributeWithSubscribeOption(
        this.componentId,
        this.processorName,
        'ZoneType', payload, true, query
      );
    } else {
      this.getAttributeWithSubscribeOption(this.componentId, this.processorName, 'ZoneType', {}, false);
    }
  }

  getZoneId(asObservable?: boolean) {
    if (asObservable) {
      const payload = {};
      const query = 'timeout=3';
      return this.getAttributeWithSubscribeOption(
        this.componentId,
        this.processorName,
        'ZoneID', payload, true, query
      );
    } else {
      this.getAttributeWithSubscribeOption(this.componentId, this.processorName, 'ZoneID', {}, false);
    }
  }

  getZoneStatus(asObservable?: boolean) {
    // const attribute = 'ZoneStatus';
    const attribute = 'ZoneStatusChangeNotification';
    if (asObservable) {
      const payload = {};
      const query = 'timeout=3';
      return this.getAttributeWithSubscribeOption(
        this.componentId,
        this.processorName,
        attribute, payload, true, query
      );
    } else {
      this.getAttributeWithSubscribeOption(
        this.componentId,
        this.processorName,
        attribute, {}, false
      );
    }
  }

  getCIE(asObservable?: boolean) {
    if (asObservable) {
      const payload = {};
      const query = 'timeout=3';
      return this.getAttributeWithSubscribeOption(
        this.componentId,
        this.processorName,
        'IAS_CIE_Address', payload, true, query
      );
    } else {
      this.getAttributeWithSubscribeOption(this.componentId, this.processorName, 'IAS_CIE_Address', {}, false);
    }
  }

  getEnrolledState(asObservable?: boolean) {
    if (asObservable) {
      const payload = {};
      const query = 'timeout=3';
      return this.getAttributeWithSubscribeOption(
        this.componentId,
        this.processorName,
        'ZoneState', payload, true, query
      );
    } else {
      this.getAttributeWithSubscribeOption(this.componentId, this.processorName, 'ZoneState', {}, false);
    }
  }

  getConditionOptions(context: any | null = null): any {
    if (context && context.deviceType) {
      this.setType(context.deviceType);
    }

    return [
      {
        name: this._type && this._type.condition && this._type.condition.activeMessage ? this._type.condition.activeMessage : 'Alarmed',
        method: {
          name: 'ZoneStatusChangeNotification',
          attribute: 'ZoneStatus',
        },
        value: { '#bitmask': 3 }
      },
      {
        name: this._type && this._type.condition && this._type.condition.idleMessage ? this._type.condition.idleMessage : 'Idle',
        method: {
          name: 'ZoneStatusChangeNotification',
          attribute: 'ZoneStatus',
        },
        value: { '#bitmask': 3, '#expected': 0 }
      }
    ];
  }

  getConditionAttribute(): any {
    return null;
  }


}