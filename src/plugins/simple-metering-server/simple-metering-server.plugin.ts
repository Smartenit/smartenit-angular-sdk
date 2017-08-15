import { Observable } from "rxjs/Observable";

import { SmartenitPlugin } from "../smartenit-plugin";
import { ITextValue } from "../../interfaces/text-value.interface";
import { INumericValue } from "../../interfaces/numeric-value.interface";
import { DeviceModel } from "../../models/device.model";
import { ActionsService } from "../../resources/actions.service";
import { ConditionsService } from "../../resources/conditions.service";
import { DevicesService } from "../../resources/devices.service";
import { EffectsService } from "../../resources/effects.service";
import { MetricsService } from "../../resources/metrics.service";
import { DatabaseService } from "../../storage/database.service";
import { IWebSocketDeviceMessage } from "../../websockets/websocket-device-message.interface";
import { PluginUtilsService } from "../plugin-utils.service";

import "rxjs/add/observable/of";

export class SimpleMeteringServerPlugin extends SmartenitPlugin implements ITextValue, INumericValue {
  static readonly UNITS: any = {
    '0x00': ['kW', 'kWh'],
    '0x01': ['m3', 'm3/h'],
    '0x02': ['ft3', 'ft3/h'],
    '0x03': ['ccf', 'ccf/h'],
    '0x04': ['US gl', 'US gl/h'],
    '0x05': ['IMP gl', 'IMP gl/h'],
    '0x06': ['BTUs', 'BTU/h'],
    '0x07': ['Liters', 'l/h'],
    '0x08': ['kPA', ''],
    '0x09': ['kPA', ''],
    '0x0A': ['mcf', 'mcf/h'],
    '0x0B': ['', ''],
    '0x0C': ['MJ', 'MJ/s'],
    '0x80': ['kW', 'kWh'],
    '0x81': ['m3', 'm3/h'],
    '0x82': ['ft3', 'ft3/h'],
    '0x83': ['ccf', 'ccf/h'],
    '0x84': ['US gl', 'US gl/h'],
    '0x85': ['IMP gl', 'IMP gl/h'],
    '0x86': ['BTUs', 'BTU/h'],
    '0x87': ['Liters', 'l/h'],
    '0x88': ['kPA', ''],
    '0x89': ['kPA', ''],
    '0x8A': ['mcf', 'mcf/h'],
    '0x8B': ['', ''],
    '0x8C': ['MJ', 'MJ/s']
  };
  static readonly PERIOD_COST_NAME = 'PeriodCost';
  static readonly PERIOD_SUMMATION_NAME = 'PeriodSummation';

  supportsEnergyUsage: boolean = false;
  periodCost: string = '-';
  periodSummation: string = '-';

  onInit() {
    if (this.device && this.device.type) {
      const isRainBee = this.device.model && this.device.model.indexOf('rainbee') > -1;
      //const isSocket = device.type.indexOf('zbmskt1') > -1;

      if (isRainBee) {
        this.state.firstUnit = SimpleMeteringServerPlugin.UNITS['0x04'][0];
        this.state.secondUnit = SimpleMeteringServerPlugin.UNITS['0x04'][1];
      } else {
        this.state.firstUnit = SimpleMeteringServerPlugin.UNITS['0x00'][0];
        this.state.secondUnit = SimpleMeteringServerPlugin.UNITS['0x00'][1];
      }

      this.supportsEnergyUsage = this.device.meta && this.device.meta.hasEnergyManagement;
      if (this.supportsEnergyUsage) {
        this.requestMetrics();
      }
    }

    this.getCache('unit_of_measure').subscribe((units) => {
      if (units && units.length > 1) {
        this.state.firstUnit = units[0];
        this.state.secondUnit = units[1];
      }
    });
  }

  requestMetrics() {
    const commonQuery: any = {
      resource: 'devices',
      resourceId: this.device._id
    };
    const commonOptions: any = {
      limit: 1,
      sort: /*['-value.timestamp']*/['-createdAt']
    };

    Observable.forkJoin([
      this.metricsService.retrieveMetrics(Object.assign({}, commonQuery, {
        name: SimpleMeteringServerPlugin.PERIOD_SUMMATION_NAME
      }), commonOptions),
      this.metricsService.retrieveMetrics(Object.assign({}, commonQuery, {
        name: SimpleMeteringServerPlugin.PERIOD_COST_NAME
      }), commonOptions)
    ]).subscribe(dataSeries => {
      const periodSummationData = dataSeries[0];
      const periodCostData = dataSeries[1];

      if (periodSummationData.length > 0) {
        this.periodSummation = periodSummationData[0].innerValue;
      }
      if (periodCostData.length > 0) {
        this.periodCost = periodCostData[0].innerValue;
      }

      this._onUpdate.next({});
    });
  }

  getFirstUnit(): string {
    return this.state.firstUnit;
  }

  getSecondUnit(): string {
    return this.state.secondUnit;
  }

  getCurrentSummation(): string {
    return this.state.currentSummation || '-';
  }

  getInstantaneousDemand(): string {
    return this.state.instantaneousPower || '-';
  }

  getPeriodCost(): string {
    return this.periodCost || '-';
  }

  getPeriodSummation(): string {
    return this.periodSummation || '-';
  }

  getUnit(attribute?: string): string {
    let response: string = '';

    switch (attribute) {
      case 'InstantaneousDemandValue':
        response = this.getFirstUnit();
        break;
      case 'CurrentSummationDeliveredValue':
        response = this.getSecondUnit();
        break;
    }

    return response;
  }

  getValue(attribute?: string): number {
    let response: number = 0;

    switch (attribute) {
      case 'CurrentSummationDeliveredValue':
        response = Number(this.state.currentSummation);
        break;
      case 'InstantaneousDemandValue':
        response = Number(this.state.instantaneousPower);
        break;
    }

    return response;
  }

  setValue(value: number, attribute?: string, subscribe?: boolean): any {
    // Do nothing becase values are read only

    if (subscribe) {
      return Observable.of(true);
    }

    return true;
  }

  getConditionAttribute(): string {
    // return this by default but client can choose the attribute from JSON
    return 'CurrentSummationDeliveredValue';
  }

  getEffectAttribute(): string | null {
    return null;
  }

  getEffectMethod(context?: any): string | null {
    return null;
  }

  getTextValue(context?: string): string {
    if (context && context == 'displayCurrentSummationOnly') {
      return this.getCurrentSummation() + this.getSecondUnit();
    } else {
      return (this.supportsEnergyUsage)
        ? `{{CURRENCY}}${this.getPeriodCost()} / ${this.getPeriodSummation()}${this.getSecondUnit()} / ${this.getInstantaneousDemand()}${this.getFirstUnit()}`
        : `${this.getCurrentSummation()}${this.getSecondUnit()} / ${this.getInstantaneousDemand()}${this.getFirstUnit()}`;
    }
  }

  getStatusPayload(): any {
    return ['CurrentSummationDeliveredValue', 'InstantaneousDemandValue', 'UnitofMeasure'];
  }

  processMessage(message: IWebSocketDeviceMessage): any {
    const response = message && message.data && message.data.response;
    const attribute = message && message.attributeOrMethod;

    if (attribute === 'CurrentSummationDeliveredValue') {
      this.state.currentSummation = response.value;

      this._onUpdate.next({ state: this.state });
    } else if (attribute === 'InstantaneousDemandValue') {
      this.state.instantaneousPower = response.value;
      this._onUpdate.next({ state: this.state });
    } else if (attribute === 'UnitofMeasure') {
      let units = this.parseUnits(response.value);

      this.setCache('unit_of_measure', units, 3600);

      this.state.firstUnit = units[0];
      this.state.secondUnit = units[1];

      this._onUpdate.next({ state: this.state });
    }

    return this.state;
  }

  private parseUnits(unitCode: string): Array<string> {
    if (SimpleMeteringServerPlugin.UNITS.hasOwnProperty(unitCode)) {
      return SimpleMeteringServerPlugin.UNITS[unitCode];
    }

    return ['', ''];
  }
}