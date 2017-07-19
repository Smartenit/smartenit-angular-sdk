import { SmartenitPlugin } from "../smartenit-plugin";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { Observable } from "rxjs/Observable";
import { Subject } from "rxjs/Subject";
import { ActionModel } from "../../models/action.model";
import { ConditionModel } from "../../models/condition.model";
import { DeviceModel } from "../../models/device.model";

const INIT_ZONES_LEN = 8;
const INIT_ZONES: any = [
  { name: 'Zone 1', isOn: false, enabled: true, index: 0, currentTime: 0 },
  { name: 'Zone 2', isOn: false, enabled: true, index: 1, currentTime: 0 },
  { name: 'Zone 3', isOn: false, enabled: true, index: 2, currentTime: 0 },
  { name: 'Zone 4', isOn: false, enabled: true, index: 3, currentTime: 0 },
  { name: 'Zone 5', isOn: false, enabled: true, index: 4, currentTime: 0 },
  { name: 'Zone 6', isOn: false, enabled: true, index: 5, currentTime: 0 },
  { name: 'Zone 7', isOn: false, enabled: true, index: 6, currentTime: 0 },
  { name: 'Zone 8', isOn: false, enabled: true, index: 7, currentTime: 0 },
  { name: 'Zone 9', isOn: false, enabled: true, index: 8, currentTime: 0 },
  { name: 'Zone 10', isOn: false, enabled: true, index: 9, currentTime: 0 },
  { name: 'Zone 11', isOn: false, enabled: true, index: 10, currentTime: 0 },
  { name: 'Zone 12', isOn: false, enabled: true, index: 11, currentTime: 0 },
  { name: 'Zone 13', isOn: false, enabled: true, index: 12, currentTime: 0 },
  { name: 'Zone 14', isOn: false, enabled: true, index: 13, currentTime: 0 },
  { name: 'Zone 15', isOn: false, enabled: true, index: 14, currentTime: 0 },
  { name: 'Zone 16', isOn: false, enabled: true, index: 15, currentTime: 0 }
];

const INIT_PROGRAMS: any = [
  { name: 'Default', isOn: false, timers: [], index: 0 },
  { name: 'Program A', isOn: false, timers: [], index: 1 },
  { name: 'Program B', isOn: false, timers: [], index: 2 },
  { name: 'Program C', isOn: false, timers: [], index: 3 },
  { name: 'Program D', isOn: false, timers: [], index: 4 }
];

const INIT_PERCENT_ADJUST: number = 0;
const INIT_IS_ENABLED: boolean = false;
const CACHE_TIME: number = 3600;

export class OnOffArrayServerPlugin extends SmartenitPlugin {
  private _zones: any = INIT_ZONES;
  private _programs: any = INIT_PROGRAMS;
  private _percentAdjust: number = INIT_PERCENT_ADJUST;
  private _isEnabled: boolean = INIT_IS_ENABLED;
  private _zonesLen: number = INIT_ZONES_LEN;

  private days: any = [
    { value: 1, name: 'Monday', shortName: 'Mon', enabled: false },
    { value: 2, name: 'Tuesday', shortName: 'Tue', enabled: false },
    { value: 3, name: 'Wednesday', shortName: 'Wed', enabled: false },
    { value: 4, name: 'Thursday', shortName: 'Thu', enabled: false },
    { value: 5, name: 'Friday', shortName: 'Fri', enabled: false },
    { value: 6, name: 'Saturday', shortName: 'Sat', enabled: false },
    { value: 0, name: 'Sunday', shortName: 'Sun', enabled: false }
  ];

  get isEnabled(): boolean {
    return this._isEnabled;
  }

  get currentRunningProgram(): any {
    return this._programs.find((item: any, index: number) => {
      return item.isOn === true;
    });
  }

  get percentAdjust(): number {
    return this._percentAdjust;
  }

  get zones(): any {
    return this._zones;
  }

  get programs(): any {
    return this._programs;
  }

  get zonesLen(): any {
    return this._zonesLen;
  }

  protected _onRainDelayChange: Subject<boolean> = new Subject<boolean>();
  get onRainDelayChange(): Observable<boolean> {
    return this._onRainDelayChange.asObservable();
  }

  onInit() {
    this.getCacheValuesWithDefaults(true);
  }

  getZoneName(zoneIdx: number) {
    this.device.executeMethod(this.componentId, this.processorName, 'GetName', { ZoneID: zoneIdx + 1 });
  }

  setZoneName(zoneIndex: number, zoneName: string) {
    this.device.executeMethod(this.componentId, this.processorName, 'SetName', {
      ZoneID: zoneIndex + 1,
      ZoneName: zoneName
    });

    if (this.device && (this.device.meta === undefined || this.device.meta === null)) {
      this.device.meta = {};
    }
    this.device.meta.zoneNames = this.zones.map((zone: any) => {
      return (zoneIndex === zone.index) ? zoneName : zone.name;
    });
    this.device.save().subscribe();

    this.getZoneName(zoneIndex);
  }

  readMode(delay: boolean = false) {
    if (delay === true) {
      setTimeout(() => {
        this.device.getAttribute(this.componentId, this.processorName, 'Mode')
          .subscribe(() => {
          });
      }, 500);
    } else {
      this.device.getAttribute(this.componentId, this.processorName, 'Mode')
        .subscribe(() => {
        });
    }
  }

  private getCacheValuesWithDefaults(useDefaultValues: boolean = false) {
    let cacheValues = [
      this.getCache('zones'),
      this.getCache('percentAdjust'),
      this.getCache('programs'),
      this.getCache('isEnabled'),
      this.getCache('zonesLen'),
      this.getCache()
    ];

    Observable.forkJoin(cacheValues).subscribe((array) => {
      if (array && array[0] != null) {
        this._zones = array[0];
      } else if (useDefaultValues) {
        this._zones = INIT_ZONES;
      }

      if (array && array[1] != null) {
        this._percentAdjust = array[1];
      } else if (useDefaultValues) {
        this._percentAdjust = INIT_PERCENT_ADJUST;
      }

      if (array && array[2] != null) {
        this._programs = array[2];
      } else if (useDefaultValues) {
        this._programs = INIT_PROGRAMS;
      }

      if (array && array[3] != null) {
        this._isEnabled = array[3];
      } else if (useDefaultValues) {
        this._isEnabled = INIT_IS_ENABLED;
      }

      if (array && array[4] != null) {
        this._zonesLen = array[4];
      } else if (useDefaultValues) {
        this._zonesLen = INIT_ZONES_LEN;
      }

      if (array && array[5] != null) {
        this.state = array[5];
      } else if (useDefaultValues) {
        this.state = {};
      }

      this._onUpdate.next({
        zones: this.zones,
        programs: this.programs,
        state: this.state,
        isEnabled: this.isEnabled,
        percentAdjust: this.percentAdjust
      });
    });
  }

  getState(cachedState: boolean = false, delay: boolean = false) {
    if (cachedState) {
      this.getCacheValuesWithDefaults();
    }

    if (delay === true) {
      setTimeout(() => {
        this.device.getAttribute(this.componentId, this.processorName, 'State').subscribe();
        this.getArraySize();
      }, 500);
    } else {
      this.device.getAttribute(this.componentId, this.processorName, 'State').subscribe();
      this.getArraySize();
    }
  }

  getArraySize() {
    if (this.device && this.device.meta && this.device.meta.arraySize) {
      this.updateArraySize(this.device.meta.arraySize);
    } else {
      this.device.getAttribute(this.componentId, this.processorName, 'ArraySize').subscribe((response) => {
        if (response && response.apiCache && response.data && response.data.length && response.data[0].v) {
          const value = response.data[0].v.value;
          this.updateArraySize(value);
          this.setArraySize(value);
        }
      });
    }
  }

  setArraySize(arraySize: any) {
    if (!this.device || !this.device.meta || !this.device.meta.arraySize) {
      if (this.device && (this.device.meta === undefined || this.device.meta === null)) {
        this.device.meta = {};
      }
      this.device.meta.arraySize = arraySize;
      this.device.save().subscribe();
    }
  }

  updateArraySize(arraySize: any) {
    this._zonesLen = arraySize;
    this.setCache('zonesLen', this._zonesLen, CACHE_TIME);
    this._onUpdate.next({ zonesLen: this._zonesLen });
  }

  getZoneNames() {
    if (this.device && this.device.meta && this.device.meta.zoneNames) {
      this._zones = this._zones.map((zone: any) => {
        return Object.assign({}, zone, {
          name: this.device.meta.zoneNames[zone.index] || zone.name
        });
      });
      this._onUpdate.next({ zones: this.zones });
    } else {
      this._zones.forEach((zone: any, idx: number) => {
        this.getZoneName(idx);
      });
    }
  }

  turnOnProgram(programIndex: number) {
    const program = this.programs[programIndex] || {};

    this._programs = this._programs.map((item: any, index: number) => {
      item.isOn = false;
      return item;
    });

    if (this._programs[programIndex]) {
      this._programs[programIndex].isOn = true;
    }

    this._onUpdate.next({ programs: this.programs });

    const method = 'ProgramOn';
    const payload = { ProgramID: programIndex };

    this.device.executeMethod(this.componentId, this.processorName, method, payload, false);
    this.readMode(true);
    this.getState();
  }

  turnOffProgram(programIndex: number) {
    const program = this.programs[programIndex] || {};

    this._programs = this._programs.map((item: any, index: number) => {
      item.isOn = false;
      return item;
    });

    if (this._programs[programIndex]) {
      this._programs[programIndex].isOn = true;
    }

    this._onUpdate.next({ programs: this.programs });

    const method = 'ProgramOff';
    const payload = { ProgramID: programIndex };

    this.device.executeMethod(this.componentId, this.processorName, method, payload, false)
    this.readMode(true);
    this.getState();
  }

  toggleProgram(programIndex: number) {
    const program = this.programs[programIndex] || {};

    this._programs = this._programs.map((item: any, index: number) => {
      if (index! - programIndex) {
        item.isOn = false;
      }
      return item;
    });

    if (this._programs[programIndex]) {
      this._programs[programIndex].isOn = !this._programs[programIndex].isOn;
    }

    this._onUpdate.next({ programs: this.programs });

    const method = program.isOn ? 'ProgramOn' : 'ProgramOff';
    const payload = { ProgramID: programIndex };

    this.device.executeMethod(this.componentId, this.processorName, method, payload, false);
    if (method === 'ProgramOn') {
      this.getCurrentRunningTimer();
      // this.device.getStatus(this.componentId, this.processorName, {}, 'cached=false');
    } else {
      this._programs = this._programs.map((item: any, index: number) => {
        item.isOn = false;
        return item;
      });
      this._zones = this._zones.map((item: any, index: number) => {
        item.isOn = false;
        return item;
      });
    }
  }

  toggleZone(zoneIndex: number) {
    const zone = this._zones[zoneIndex] || {};

    if (this._zones[zoneIndex]) {
      this._zones[zoneIndex].isOn = !this._zones[zoneIndex].isOn;
    }

    const method = zone.isOn ? 'On' : 'Off';
    const payload = { ZoneID: zoneIndex + 1 };

    this.device.executeMethod(this.componentId, this.processorName, method, payload, false);
    if (method === 'On') {
      this.getCurrentRunningTimer();
      // this.device.getStatus(this.componentId, this.processorName, {}, 'cached=false');
    } else {
      this._programs = this._programs.map((item: any, index: number) => {
        item.isOn = false;
        return item;
      });
      this._zones = this._zones.map((item: any, index: number) => {
        item.isOn = false;
        return item;
      });
    }
  }

  getProgramTimers(programIndex: number) {
    const method = 'GetTimers';
    const payload = { TimerBankID: programIndex };

    // this.setProgramInMode(programIndex).subscribe(() => {
    this.device.executeMethod(this.componentId, this.processorName, method, payload, false);
    this.getState();
    // });
  }

  getCurrentRunningTimer() {
    const method = 'GetTimers';
    const payload = { TimerBankID: 5 };

    this.device.executeMethod(this.componentId, this.processorName, method, payload);
  }

  setProgramTimers(programIndex: number, timerValues: any) {
    const programName = this._programs[programIndex].name;
    const method = 'SetTimers';

    const timerValuesSecs = timerValues.map((timer: any) => {
      return parseInt(timer) * 60;
    });

    const payload = {
      TimerBankID: programIndex,
      ArrayOfTimerValues: timerValuesSecs
    };

    this.device.executeMethod(this.componentId, this.processorName, method, payload, false);
    this.getProgramTimers(programIndex);
  }

  toggleDeviceEnable() {
    if (this._isEnabled) {
      this.disableDevice();
    } else {
      this.enableDevice();
    }
  }

  disableDevice() {
    if (this.state.mode === undefined) {
      this._onUpdate.next({ isEnabled: false });
      return Observable.of(false);
    }

    const newMode = this.inhibitOn(this.state.mode);

    const params = { value: newMode };

    this.device.setAttribute(this.componentId, this.processorName, 'Mode', params).subscribe(() => {
      this.readMode(true);
    });
  }

  enableDevice() {
    if (this.state.mode === undefined) {
      this._onUpdate.next({ isEnabled: false });
      return Observable.of(false);
    }

    const newMode = this.inhibitOff(this.state.mode);

    const params = { value: newMode };

    this.device.setAttribute(this.componentId, this.processorName, 'Mode', params).subscribe(() => {
      this.readMode(true);
    });
  }

  private inhibitOn(mode: any) {
    const ihibitMask = 1 << 8;
    return mode | ihibitMask;
  }

  private inhibitOff(mode: any) {
    const ihibitMask = 1 << 8;
    return mode & ~ihibitMask;
  }

  private setProgramInMode(programIndex: number): Observable<any> {
    if (this.state.mode === undefined) {
      return Observable.of(true);
    }

    const newMode = this.setProgramId(this.state.mode, programIndex);
    const params = { value: newMode };

    return this.device.setAttribute(this.componentId, this.processorName, 'Mode', params);
  }

  private setProgramId(mode: any, programIndex: number): any {
    const timerMask = 287;
    const shiftLeft = programIndex << 5;
    const cleanedMode = mode & timerMask;
    const newMode = cleanedMode | shiftLeft;

    return newMode;
  }

  private getProgramIdFromMode(mode: any) {
    const shiftRight = mode >> 5;
    return shiftRight & 7;
  }

  private getDeviceisEnabled(mode: any) {
    return mode & 256 ? true : false;
  }

  private getPercentAdjust(mode: any) {
    return (mode & 31) * 10;
  }

  processZonesResponse(bitmask: any, zones: any) {
    return zones.map((zone: any, idx: number) => {
      let shiftRight = 1 << idx;

      if (bitmask & shiftRight) {
        zone.isOn = true;
      } else {
        zone.isOn = false;
      }

      return zone;
    });
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const attribute = message && message.attributeOrMethod;
    const response = message && message.data && message.data.response;

    if (attribute) {

      if (attribute.toLowerCase() === 'state') {
        const bitmask = response.value;
        this._zones = this.processZonesResponse(bitmask, this.zones);

        this.setCache('zones', this._zones, CACHE_TIME);

        this._onUpdate.next({ zones: this.zones });
      } else if (attribute === 'GetNameResponse') {
        const zoneID = response.value.ZoneID;
        const zoneIndex = zoneID - 1;
        const zoneName = response.value.ZoneName;

        if (zoneName == null) {
          if (this.device && this.device.meta && this.device.meta.zoneNames && this.device.meta.zoneNames[zoneIndex]) {
            this._zones[zoneIndex].name = this.device.meta.zoneNames[zoneIndex];
          } else {
            this._zones[zoneIndex].name = 'Zone ' + zoneID;
          }
        } else {
          this._zones[zoneIndex].name = zoneName;
        }

        this.setCache('zones', this._zones, CACHE_TIME);

        this._onUpdate.next({ zones: this.zones });
      } else if (attribute == 'GetTimersResponse') {
        const programId = response.value.TimerBankID;

        if (programId != 5) {
          const timersInSecs = response.value.ArrayOfTimerValues;
          const timersInMins = timersInSecs && timersInSecs.map((timer: any) => {
            return Math.round(timer / 60);
          });
          this._programs[programId].timers = Array.isArray(timersInSecs) && timersInSecs.length > 0 ?
            timersInMins :
            this._programs[programId].timers;

          this.setCache('programs', this._programs, CACHE_TIME);
          this._onUpdate.next({ programs: this.programs });
        } else {
          const currentTimers: any = response.value.ArrayOfTimerValues;

          if (currentTimers && currentTimers.length > 0) {
            for (let i = 0; i < currentTimers.length; i++) {
              let timer = currentTimers[i];

              if (timer > 0) {
                this._zones[i].currentTime = timer;
                this.setCache('zones', this._zones, CACHE_TIME);

                break;
              }
            }
          }
        }
      } else if (attribute.toLowerCase() === 'mode') {
        let mode: any = response.value;

        const programIndex = this.getProgramIdFromMode(mode);

        this._percentAdjust = this.getPercentAdjust(mode);
        this._isEnabled = this.getDeviceisEnabled(mode);

        this.state = {
          mode: mode
        };

        this._programs = this._programs.map((item: any, index: number) => {
          item.isOn = index == programIndex;
          return item;
        });

        this.setCache('programs', this.programs, CACHE_TIME);
        this.setCache('percentAdjust', this.percentAdjust, CACHE_TIME);
        this.setCache('isEnabled', this.isEnabled, CACHE_TIME);

        this._onUpdate.next({
          programs: this.programs,
          state: this.state,
          isEnabled: this.isEnabled,
          percentAdjust: this.percentAdjust
        });
      } else if (attribute.toLowerCase() === 'arraysize') {
        this.updateArraySize(response.value);
        this.setArraySize(response.value);
      }
    }

    return this.state;
  }

  getNearestCondition(): Observable<any> {
    let programsIdxs = this.programs.map((p: any, idx: number) => {
      return idx;
    });

    const query = {
      'meta.deviceId': this.device._id,
      'meta.programId': { $in: programsIdxs }
    };

    return this.conditionsService.list(query, { fields: ['meta', 'description'] })
      .map(response => {
        let conditions = response.data;
        let description = this.nearestConditionDescriptionHelper(conditions);
        return description;
      });
  }

  getCrontabFromValue(value: any): any {
    const crontabStr = value[ConditionModel.CRONTAB] || '';
    const crontab = crontabStr.split(' ');
    let date = new Date();

    const minutes = parseInt(crontab[0]);
    const hours = parseInt(crontab[1]);

    date.setUTCMinutes(minutes);
    date.setUTCHours(hours);

    const minutesUtc = date.getMinutes();
    const hoursUtc = date.getHours();

    const day = parseInt(crontab[2]);

    let monthsValues = ['*'];

    const daysStr = crontab[4] || '';

    let daysValues = daysStr.split(',').reduce((prev: any, next: any) => {
      return next === '*' ? prev : prev.concat(next);
    }, []);

    let values = Object.assign({}, daysValues);

    daysValues = this.days.map((day: any) => {
      let enabledDay = values.find((dayValue: any) => {
        return parseInt(dayValue) === day.value;
      });

      day.enabled = false;
      if (enabledDay) {
        day.enabled = true;
      }
      return day;
    });

    return {
      minutes: minutesUtc,
      hours: hoursUtc,
      day: day,
      months: monthsValues,
      days: daysValues
    };
  }

  private nearestConditionDescriptionHelper(conditions: any) {
    let currentDate = new Date();
    const currentTime = +currentDate;
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const day = currentDate.getDate();
    // TODO get this from config
    const sunriseHour = 6;
    const sunsetHour = 18;
    let nearestDiff = Infinity;
    let date: any;
    let value: any;
    let description: any;

    conditions && conditions.forEach((condition: any) => {
      if (condition.type === ConditionModel.TIME_DEFAULT) {
        value = this.getCrontabFromValue(condition.value);
        date = new Date(year, month, day, value.hours, value.minutes);

      } else if (value === ConditionModel.TIME_SUNRISE) {
        date = new Date(year, month, day, sunriseHour);
      } else {
        date = new Date(year, month, day, sunsetHour);
      }

      let diff = +date - currentTime;
      if (diff > 0 && diff < nearestDiff) {
        nearestDiff = diff;
        description = condition.description;
      }
    });

    return description;
  }

  createProgramAction(
    programName: string, programId: string, startTimes: any, crontab: any, actionId?: any, effectId?: any
  ): Observable<any> {
    const path = ['', 'devices', this.device._id, 'comps', this.componentId, 'procs', this.processorName].join('/');
    let createdAction: ActionModel;
    let currentTimerValues = this.programs[programId].timers || [];

    // savePrograms(currentTimerValues, programId, programName);

    let action: ActionModel = this.actionsService.createModel({
      name: 'Rainbee program ' + programId + ' action',
      meta: { programId: programId, deviceId: this.device._id },
      expr: { if: [], then: [], else: [], operator: 'OR' }
    });

    // this is an action update
    if (actionId) {
      action._id = actionId;
    }

    let gateway: any;
    const gatewayQuery = { 'components.processors.name': 'TimeServer' };
    const gatewayProjection = { fields: ['name', 'components'], limit: 1 };

    return this.devicesService.list(gatewayQuery, gatewayProjection)
      .flatMap(gatewaysListResponse => {
        let devices = gatewaysListResponse.data;
        gateway = devices[0];

        return action.save();
      })
      .flatMap(actionSaveResponse => {
        createdAction = actionSaveResponse.data;

        if (!createdAction) {
          return Observable.throw(new Error('Error saving action for raindelay'));
        }
        action._id = createdAction._id;

        let gatewayProcessor = gateway.getProcessor('TimeServer');
        let gatewayPath = [
          '',
          'devices', gateway._id,
          'comps', gatewayProcessor.componentId,
          'procs', gatewayProcessor.name,
          'attrs', 'Time'
        ].join('/');

        let conditions: any = [];

        for (let i = 0; i < startTimes.length; i++) {
          let time = startTimes[i];
          let value: any = {};

          value[ConditionModel.CRONTAB] = time.crontab ? time.crontab : crontab;

          if (time.type !== ConditionModel.TIME_DEFAULT) {
            value[ConditionModel.EQ] =
              time.type === ConditionModel.TIME_SUNRISE ?
                ConditionModel.SUNRISE : ConditionModel.SUNSET;
          }

          let meta = { programId: programId, deviceId: this.device._id };
          let condition = this.conditionsService.createModel({
            name: 'RainBee Program ' + programId + ' Condition',
            path: gatewayPath,
            value: value,
            'parents.actions': [{ id: createdAction._id, name: createdAction.name }],
            meta: meta,
            type: time.type
          }
          );

          if (time.id) {
            condition._id = time.id;
          }

          conditions.push(condition.save());
        }

        return Observable.forkJoin(conditions);
      })
      .flatMap((createdConditions: any) => {

        action.expr.if = [];
        for (let i = 0; i < createdConditions.length; i++) {
          let condition = createdConditions[i];
          condition = condition.data;
          if (condition) {
            action.expr.if.push({
              id: condition._id,
              name: condition.name,
              enabled: true
            });
          }
        }

        let effect = this.effectsService.createModel({
          name: 'RainBee Program ' + programId + ' Effect',
          path: path + '/methods/ProgramOn',
          'parents.actions': [{ id: createdAction._id, name: createdAction.name }],
          meta: { programId: programId, deviceId: this.device._id },
          params: {
            ProgramID: programId
          }
        });

        if (effectId) {
          effect._id = effectId;
        }

        return effect.save();
      })
      .flatMap(createdEffect => {
        createdEffect = createdEffect.data;

        if (!createdEffect) {
          Observable.throw(new Error('Error saving effect for raindelay'));
        }

        action.expr.then = [{
          id: createdEffect._id,
          name: createdEffect.name,
          enabled: true
        }];

        return action.save();
      })
      .flatMap(updatedAction => {
        return Observable.of(updatedAction);
      });
  }

  getRainDelayAction(): Observable<any> {
    return this.actionsService.list({ 'meta.rainDelay': true, 'meta.deviceId': this.device._id })
      .map(actionResult => actionResult.data[0]);
  }

  stopRainDelay(): Observable<any> {
    let promises: any = [];
    let actionToRemove: ActionModel;

    this.enableDevice();

    if (this.device && this.device.meta && this.device.meta.rainDelay) {
      var conditionId = this.device.meta.rainDelay.conditionId;
      var effectId = this.device.meta.rainDelay.effectId;
      var effectToDeleteId = this.device.meta.rainDelay.effectToDeleteId;
      var actionId = this.device.meta.rainDelay.actionId;
      if (conditionId && effectToDeleteId && effectId) {
        promises.push(this.conditionsService.createModel({ _id: conditionId }).remove());
        promises.push(this.effectsService.createModel({ _id: effectId }).remove());
        promises.push(this.effectsService.createModel({ _id: effectToDeleteId }).remove());
      }
      actionToRemove = this.actionsService.createModel({ _id: actionId });
    }

    if (!this.device.meta) {
      this.device.meta = {};
    }

    this.device.meta.rainDelay = null;
    promises.push(this.device.save());

    return Observable.forkJoin(promises).flatMap((arrayResponse) => {
      console.log('rain delay delete response', arrayResponse);

      return actionToRemove.remove();
    }).map(res => {
      this._onRainDelayChange.next(false);
      return res;
    });
  }

  startRainDelay(delay: any): Observable<any> {
    let obsResponse: Observable<any>;

    const mode = this.state.mode;
    const path = ['', 'devices', this.device._id, 'comps', this.componentId, 'procs', this.processorName].join('/');

    var action = this.actionsService.createModel({
      name: 'RainBee Rain Delay action',
      meta: {
        rainDelay: true,
        deviceId: this.device._id,
        delay: delay
      },
      expr: { if: [], then: [], else: [], operator: 'OR' },
    });

    var time = new Date();

    if (delay !== 'inf') {
      // console.log('setting action.meta for timed');
      time.setTime(time.getTime() + (delay * 60 * 60 * 1000));
      action.meta.startDate = new Date();
      action.meta.endDate = time;
    }

    let createdAction: ActionModel;
    let createdCondition: ConditionModel;
    let createdEffect: any;
    let createdEffectToDeleteAction: any;

    this.disableDevice();

    let gateway: DeviceModel;
    const gatewayQuery: any = { 'components.processors.name': 'TimeServer' };
    const gatewayProjection: any = { fields: ['name', 'components'], limit: 1 };

    let fullResponseL: any = {};
    if (delay === 'inf') {
      // console.log('saving action w/o a timer effect');
      obsResponse = action.save()
        .flatMap((actionsResponse: any) => {
          createdAction = action;
          if (!this.device.meta) {
            this.device.meta = {};
          }
          this.device.meta.rainDelay = {
            delay: 'inf',
            actionId: createdAction._id,
          }
          return this.device.save();
        })
        .flatMap(function (deviceResponse) {
          return Observable.of(deviceResponse);
        });
    } else {
      obsResponse = this.devicesService.list(gatewayQuery, gatewayProjection)
        .flatMap((gatewayResponse: any) => {
          gateway = gatewayResponse.data[0];

          return action.save();
        })
        .flatMap((actionResponse: any) => {
          createdAction = action;

          let timeServerProcessor = gateway.getProcessor('TimeServer');

          let gatewayPath = [
            '',
            'devices', gateway._id,
            'comps', timeServerProcessor.componentId,
            'procs', timeServerProcessor.name,
            'attrs', 'Time'
          ].join('/');

          createdCondition = this.conditionsService.createModel({
            name: 'Gateway triggers Rain Delay Condition',
            'parents.actions': [{ id: createdAction._id, name: createdAction.name }],
            meta: { rainDelay: true },
            path: gatewayPath,
            value: {
              '#crontab': time.getUTCMinutes() + ' ' + time.getUTCHours() + ' * * *'
            },
            type: ConditionModel.TIME_DEFAULT
          });

          return createdCondition.save();
        })
        .flatMap((conditionResponse: any) => {
          action.expr.if.push({
            id: createdCondition._id,
            name: createdCondition.name,
            enabled: true
          });

          // Because we have inhibited the device
          // by the time the effect is running
          // the effect should be set inhibit off
          // to get the device operational again
          let newModeValue = this.inhibitOff(mode);

          createdEffect = this.effectsService.createModel({
            name: 'RainBee Rain Delay Effect',
            path: path + '/methods/setMode',
            'parents.actions': [{ id: createdAction._id, name: createdAction.name }],
            meta: { rainDelay: true },
            params: { Mode: newModeValue }
          });

          return createdEffect.save();
        })
        .flatMap((effectResponse: any) => {
          createdEffectToDeleteAction = this.effectsService.createModel({
            name: 'RainBee Effect to Delete Action',
            path: '/actions/' + createdAction._id,
            'parents.actions': [{ id: createdAction._id, name: createdAction.name }],
            params: { verb: 'delete' }
          });

          return createdEffectToDeleteAction.save();
        })
        .flatMap((deleteEffectResponse: any) => {
          action.expr.then.push({
            id: createdEffect._id,
            name: createdEffect.name,
            enabled: true
          }, {
              id: createdEffectToDeleteAction._id,
              name: createdEffectToDeleteAction.name,
              enabled: true
            });

          return action.save();
        })
        .flatMap((actionUpdateResponse: any) => {
          if (!this.device.meta) {
            this.device.meta = {};
          }
          this.device.meta.rainDelay = {
            delay: time,
            actionId: createdAction._id,
            conditionId: createdCondition._id,
            effectId: createdEffect._id,
            effectToDeleteId: createdEffectToDeleteAction._id
          };

          return this.device.save();
        })
        .flatMap((deviceResponse: any) => {
          return Observable.of(deviceResponse);
        });
    }

    return obsResponse.map(res => {
      this._onRainDelayChange.next(true);
      return res;
    });
  }

  processDeviceMessage(message: IWebSocketDeviceMessage): any {
    const attribute = message && message.attributeOrMethod;
    const response = message && message.data && message.data.response;

    if (attribute === 'OnOff' && message.componentId) {
      const zoneId = parseInt(message.componentId);

      this._zones[zoneId - 1].isOn = response.value === 'On' || response.value === true || response.value === 1;

      this.setCache('zones', this._zones, CACHE_TIME);

      this._onUpdate.next({ zones: this.zones });
    }
  }

  getProgramConditions(): Observable<any> {
    let programsIdxs = this.programs.map((p: any, idx: number) => {
      return idx + '';
    });

    const query = {
      'meta.deviceId': this.device._id,
      'meta.programId': { $in: programsIdxs }
    };

    return this.conditionsService.list(query, { fields: ['meta', 'description'] });
  }

  setPercentAdjust(percent: number) {
    this._percentAdjust = percent;

    percent = percent / 10;
    const mode = this.state.mode;
    const percentMask = 480;
    let newMode = mode & percentMask;
    newMode |= percent;
    const params = { value: newMode };

    this.device.setAttribute(this.componentId, this.processorName, 'Mode', params).subscribe(() => {
      this.readMode(true);
    });
  }

  getProgramAutomation(programId: number) {
    let observables: Observable<any>[] = [];

    observables.push(this.actionsService.list({
      'meta.deviceId': this.device._id,
      'meta.programId': programId
    }, { limit: 1 }));
    observables.push(this.conditionsService.list({
      'meta.deviceId': this.device._id,
      'meta.programId': programId
    }));
    observables.push(this.effectsService.list({
      'meta.deviceId': this.device._id,
      'meta.programId': programId
    }, { limit: 1 }));

    return Observable.forkJoin(observables).flatMap((array) => {
      let automation: any = [];

      for (let i = 0; i < array.length; i++) {
        let res: any = array[i];
        if (res && res.data) {
          automation[i] = res.data;
        }
      }

      const response: any = {
        action: automation[0][0],
        conditions: automation[1],
        effect: automation[2][0]
      };

      return Observable.of(response);
    });
  }

  getEffectLabelOptions(context: any) {
    let rsp: any = [];
    let attr: string = '';
    if (context && context.attribute) {
      attr = context.attribute;
    }

    if (attr == 'zones') {
      rsp = this._zones.map((zone: any, index: number) => {
        let name: string = zone.name;
        if (this.device.meta && this.device.meta.zoneNames && this.device.meta.zoneNames.length >= index) {
          name = this.device.meta.zoneNames[index];
        }
        return { name: name, value: String(index + 1), payload: { 'ZoneID': index + 1 } };
      });
      if (this._zonesLen > 0) {
        rsp = rsp.slice(0, this._zonesLen);
      }
    } else if (attr == 'programs') {
      rsp = this._programs.map((program: any, index: number) => {
        let name: string = program.name;
        if (this.device.meta && this.device.meta.programs && this.device.meta.programs.length >= index) {
          name = this.device.meta.programs[index].name;
        }
        return { name: name, value: String(index), payload: { 'ProgramID': index } };
      });
      if (rsp.length > 1) {
        rsp = rsp.slice(1);
      }
    }

    return rsp;
  }

  getEffectValueOptions(context: any) {
    let rsp: any = null;
    let attr: string = '';
    if (context && context.attribute) {
      attr = context.attribute;
    }

    if (attr == 'zones') {
      rsp = [
        { name: 'Turn On', value: 'On' },
        { name: 'Turn Off', value: 'Off' }
      ];
    } else if (attr == 'programs') {
      rsp = [
        { name: 'Turn On', value: 'ProgramOn' },
        { name: 'Turn Off', value: 'ProgramOff' }
      ];
    }

    return rsp;
  }

  getEffectCurrentLabel(context: any, attributeOrMethod: string) {
    if (!context || (!context.hasOwnProperty('ZoneID') && !context.hasOwnProperty('ProgramID')))
      return null;
    const key = context.hasOwnProperty('ZoneID') ? 'ZoneID' : 'ProgramID';
    return context[key];
  }

  getEffectCurrentValue(context: any, attributeOrMethod: string) {
    return attributeOrMethod;
  }

  getEffectMethod(context?: any): string | null {
    if (!context || !context['name']) {
      return null;
    }

    let name = context['name'].toLowerCase();
    let currentMethod = context['method'];

    if (name == 'zones' && ['On', 'Off'].indexOf(currentMethod) > -1) {
      return currentMethod;
    } else if (name == 'programs' && ['ProgramOn', 'ProgramOff'].indexOf(currentMethod) > -1) {
      return currentMethod;
    }

    return null;
  }

  getValueDescription(value: any): string {
    let description = '';

    if (value.ZoneID) {
      const zone = this._zones[value.ZoneID - 1];
      if (zone) {
        description = zone.name;
        if (this.device.meta && this.device.meta.zoneNames && this.device.meta.zoneNames.length >= (value.ZoneID - 1)) {
          description = this.device.meta.zoneNames[(value.ZoneID - 1)];
        }
      }
    } else if (value.ProgramID) {
      const program = this._programs[value.ProgramID];
      if (program) {
        description = program.name;
        if (this.device.meta && this.device.meta.programs && this.device.meta.programs.length >= value.ProgramID) {
          description = this.device.meta.programs[value.ProgramID].name;
        }
      }
    }

    return description;
  }
}
