import { SmartenitPlugin } from '../smartenit-plugin';
import { IIASACEServer } from '../../interfaces/iasace.interface';
import { IASZoneServerPlugin } from '../iaszone-server/iaszone-server.plugin';
import { IWebSocketDeviceMessage } from '../../websockets/websocket-device-message.interface';
import { Observable } from "rxjs/Observable";
import { Subscription } from 'rxjs/Subscription';

const CACHE_TIME: number = 3600;

export class IASACEServerPlugin extends SmartenitPlugin implements IIASACEServer {

  onInit() {
    this.getCachedValues();
    this.getStatus();
  }

  /*
    *AlarmStatus*
    0x00 No alarm
    0x01 Burglar
    0x02 Fire
    0x03 Emergency
    0x04 Police Panic
    0x05 Fire Panic
    0x06 Emergency Panic (i.e., medical issue)

    *AudibleNotification*
    0x00 Mute (i.e., no audible notification)
    0x01 Default sound
    0x80-0xff Manufacturer specific
  */
  _armResponse: any;
  _alarmStatus: any;
  _bypassedZoneList: any = [];
  _zones: any = [];

  setEmergency(type: string) {
    let method: string | null = null;
    switch (type) {
      case 'emergency':
        method = 'Emergency';
        break;
      case 'fire':
        method = 'Fire';
        break;
      case 'panic':
        method = 'Panic';
        break;
    }

    if (method) {
      this.device.executeMethod(this.componentId, this.processorName, method, {}, true);
    }
  }

  /*  
    *ArmMode*
    0x00 Disarm
    0x01 Arm Day/Home Zones Only // ARM stay
    0x02 Arm Night/Sleep Zones Only // ARM stay
    0x03 Arm All Zones // ARM away
  */
  arm(mode: number): void {
    this.executeMethod(this.componentId, this.processorName, 'Arm', { "ArmMode": mode, "ArmDisarmCode": "1234", "ZoneID": 1 }, true, null, 'cached=false');
  }

  disarm(): void {
    this.executeMethod(this.componentId, this.processorName, 'Arm', { "ArmMode": 0, "ArmDisarmCode": "1234", "ZoneID": 1 }, true, null, 'cached=false');
  }

  getZoneInformation(zoneId: number): void {
    this.executeMethod(this.componentId, this.processorName, 'GetZoneInformation', { "ZoneID": zoneId }, true);
  }

  /**
   * Bypass command
   * @param ZoneIDArray Contains the id of the index of each Zone
   *  in the CIE's zone table eg. [1,3,3,4]
   * @param ArmDisarmCode Should be between four and eight
   *  alphanumeric characters in length.
   */
  bypass(ZoneIDArray = [], ArmDisarmCode: string = ''): void {
    const method = 'Bypass';
    const payload = { ZoneIDArray, ArmDisarmCode };
    const requestStatus = true;
    this.executeMethod(this.componentId, this.processorName, method, payload, requestStatus);
  }

  bypassZone(zoneId: number, armDisarmCode: string = ''): void {
    let uniqueArray = [];
    const zoneIdx = this._bypassedZoneList.indexOf(zoneId);

    if (zoneIdx > -1) {
      uniqueArray = this._bypassedZoneList.filter((zone: any, idx: number) => idx !== zoneIdx);
    } else {
      uniqueArray = [zoneId].concat(this._bypassedZoneList);
    }

    this.bypass(uniqueArray, armDisarmCode);
  }

  getZones(): any {
    if (this.device && this.device.meta && this.device.meta.zones) {
      return this.device.meta.zones;
    }

    return [];
  }

  getBypassedZoneList(): void {
    const method = 'GetBypassedZoneList';
    const payload = {};
    const requestStatus = true;
    this.executeMethod(this.componentId, this.processorName, method, payload, requestStatus);
  }

  getEffectOptions(): any {
    return [];
  }

  getEffectAttribute(): string | null {
    return null;
  }

  getEffectMethod(context?: any): string | null {
    return null;
  }

  getConditionOptions(): any {
    return [];
  }

  getConditionAttribute(): string | null {
    return null;
  }

  getCachedValues(subscribe?: boolean): any {
    let cacheValues = [
      this.getCache('ArmResponse'),
      this.getCache('AlarmStatus'),
      this.getCache('ZoneIDArray'),
      this.getCache()
    ];

    const observable = Observable.forkJoin(cacheValues).flatMap((array) => {
      if (array && array[0] != null) {
        this._armResponse = array[0];
      }

      if (array && array[1] != null) {
        this._alarmStatus = array[1];
      }

      if (array && array[2] != null) {
        this._bypassedZoneList = array[2];
      }

      this._zones = this.device && this.device.meta && this.device.meta.zones ? this.device.meta.zones : [];

      if (array && array[3] != null) {
        this.state = array[3];
      }

      if (this.state != null) {
        this.device.cached = true;
      }

      this._onUpdate.next({
        state: this.state,
        armResponse: this._armResponse,
        alarmStatus: this._alarmStatus,
        bypassedZoneList: this._bypassedZoneList,
        zones: this._zones
      });

      return Observable.of(this.state);
    });

    if (subscribe === true) {
      return observable;
    }

    let subscription: Subscription = observable.subscribe(() => subscription.unsubscribe());
  }

  /*
    *PanelStatus*
    0x00 Panel disarmed (all zones disarmed) and ready to arm
    0x01 Armed stay
    0x02 Armed night
    0x03 Armed away
    0x04 Exit delay
    0x05 Entry delay
    0x06 Not ready to arm
    0x07 In alarm
    0x08 Arming Stay
    0x09 Arming Night
    0x0a Arming Away
  */

  /*
    *ArmNotification*:
    0x00 All Zones Disarmed
    0x01 Only Day/Home Zones Armed
    0x02 Only Night/Sleep Zones Armed
    0x03 All Zones Armed
    0x04 Invalid Arm/Disarm Code
    0x05 Not ready to arm*
    0x06 Already disarmed
  */

  // { "AlarmStatus" : "0x01", "AudibleNotification" : "0x01", "PanelStatus" : "0x03", "SecondsRemaining" : 0 }

  processMessage(message: IWebSocketDeviceMessage): any {
    const attributeOrMethod = message && message.attributeOrMethod;
    const response = message && message.data && message.data.response;

    if (attributeOrMethod === 'GetPanelStatusResponse' ||
      attributeOrMethod === 'PanelStatusChanged') {
      this.state = parseInt(response.value.PanelStatus);
      this._alarmStatus = parseInt(response.value.AlarmStatus);
      this.setCache('AlarmStatus', this._alarmStatus, CACHE_TIME);
      this._onUpdate.next({ state: this.state, alarmStatus: this._alarmStatus });

    } else if (attributeOrMethod == 'ArmResponse') {
      this._armResponse = response.value.ArmNotification;
      this.setCache('ArmResponse', this._armResponse, CACHE_TIME);
      this._onUpdate.next({ armResponse: this._armResponse });

    } else if (attributeOrMethod === 'SetBypassedZoneList') {
      this._bypassedZoneList = response.value.ZoneIDArray;
      this.updateZonesBypassed(this._bypassedZoneList);
      this.setCache('ZoneIDArray', this._bypassedZoneList, CACHE_TIME);
      this._onUpdate.next({ bypassedZoneList: this._bypassedZoneList });

    } else if (attributeOrMethod === 'BypassResponse') {
      //this.executeMethod(this.componentId, this.processorName, 'GetBypassedZoneList', {});

    } else if (attributeOrMethod === 'ZoneMap') {
      this.parseZoneMap(response.value);

    }

    return this.state;
  }

  getStatusPayload(): any {
    return ['GetPanelStatusResponse', 'SetBypassedZoneList', 'ZoneMap', 'PanelStatusChanged'];
  }

  getStatus(context?: string, force?: boolean, asObservable?: boolean, payload?: any) {
    super.getStatus(context, true, asObservable, payload);
  }

  arraysOfNumbersAreEqual(array1 = [], array2 = []) {
    if (array1.length !== array2.length) {
      return false;
    }

    array1.sort();
    array2.sort();

    let i = 0;
    for (; i < array2.length; i += 1) {
      if (parseInt(array1[i]) !== parseInt(array2[i])) {
        return false;
      }
    }

    return true;
  }

  parseZoneMap(response: any) {
    let zonesMap: any = [];
    Object.keys(response).sort().forEach(key => {
      zonesMap.push(response[key]);
    });

    zonesMap = zonesMap.filter((zone: any) => {
      return zone.hasOwnProperty('ZoneID') && zone.hasOwnProperty('IEEEaddress') && zone.hasOwnProperty('ZoneType');
    });

    let requestDevices: boolean = false;
    zonesMap = zonesMap.map((zone: any) => {
      let zoneMap: any = {
        zoneId: zone["ZoneID"],
        hwId: zone["IEEEaddress"].replace(/0x/g, '').toLowerCase(),
        zoneType: zone["ZoneType"].toLowerCase(),
        bypassed: this._bypassedZoneList.indexOf(zone["ZoneID"]) > -1
      };

      let currentZone: any = this._zones.find((oldZone: any) => {
        return oldZone.deviceId && oldZone.zoneId == zoneMap.zoneId && oldZone.hwId == zoneMap.hwId;
      });

      requestDevices = requestDevices || (currentZone ? false : true);
      zoneMap.name = currentZone ? currentZone.name : 'unknown';
      zoneMap.deviceId = currentZone ? currentZone.deviceId : 'unknown';

      return zoneMap;
    });

    if (this._zones.length != zonesMap.length && zonesMap.length > 0) {
      requestDevices = true;
    }

    this._zones = zonesMap;

    const unkownDeviceIds = this._zones.map((zone: any) => zone.hwId);

    if (!requestDevices || unkownDeviceIds.length === 0) {
      return;
    }

    // Get deviceId by HardwareId
    // TODO (jjescof): Pagination issue
    const query = { 'hwId': { '$in': unkownDeviceIds } };
    this.devicesService.list(query)
      .flatMap(response => Observable.of(response.data))
      .flatMap(devices => {
        return Observable.of(devices)
          .map(devices => {
            return devices.map((device: any) => {
              return { deviceId: device._id, hwId: device.hwId, name: device.name };
            });
          });
      })
      .flatMap(devices => {
        devices.forEach((device: any) => {
          let zoneIndex: number = this._zones.findIndex((zone: any) => {
            return zone.hwId == device.hwId;
          });

          if (zoneIndex > -1) {
            const zone = this._zones[zoneIndex];
            const newZone = Object.assign({}, zone, { name: device.name, deviceId: device.deviceId });
            this._zones[zoneIndex] = newZone;
          }
        });

        this.device.meta = this.device.meta || {};
        this.device.meta.zones = this._zones;
        return this.device.save();
      })
      .subscribe(() => {
        // TODO (jjescof) zoneStatus is reading from the iaszone directly, should it be parsed here?
        this._onUpdate.next({
          zones: this._zones
        });
      });
  }

  updateZonesBypassed(bypassList: any) {
    this._zones.forEach((zone: any) => {
      zone.bypassed = bypassList.indexOf(zone.zoneId) > -1;
    });

    this.device.meta = this.device.meta || {};
    this.device.meta.zones = this._zones;
    this.device.save();

    this._onUpdate.next({
      zones: this._zones
    });
  }
}
