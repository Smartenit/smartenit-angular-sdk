import { Injectable } from '@angular/core';
import { ProcessorValueHelperService } from './processor-value-helper.service';
import { ActionModel } from '../models/action.model';
import { ConditionModel } from '../models/condition.model';
import { EffectModel } from '../models/effect.model';
import { ControllerModel } from '../models/controller.model';
import { ResponderModel } from '../models/responder.model';
import { DeviceModel } from '../models/device.model';

@Injectable()
export class NaturalLanguageService {
  constructor(
    private processorValueHelperService: ProcessorValueHelperService
  ) { }

  private append(desc: string, value: string, connector?: string) {
    if (value.toString().length > 0) {
      let sep = desc.length > 0 ? (connector ? ' ' + connector + ' ' : ' ') : '';
      return desc + sep + value;
    }

    return desc;
  }

  private plural(value: number) {
    if (this.isNumber(value))
      return value > 1 ? 's' : '';
    return '';
  }

  private parseOffset(offset: number) {
    let desc = '';
    if (this.isNumber(offset) && offset != 0) {
      return this.parseSeconds(Math.abs(offset)) + (offset > 0 ? ' after' : ' before');
    }

    return desc;
  }

  private pluralText(text: string, val: number) {
    if (val > 1) {
      return text + 's';
    }

    return text;
  }

  private parseSeconds(secs: number) {
    let desc = '';

    if (secs < 60) {
      desc = secs + ' ' + this.pluralText('sec', secs);
    } else if (secs >= 60) {
      let remainingSecs = secs % 60;
      let minutes = Math.floor(secs / 60);
      let remainingMinutes = minutes % 60;
      let hours = Math.floor(minutes / 60);

      desc += this.digits(remainingSecs);

      if (hours == 0) {
        if (remainingMinutes > 0 && remainingSecs > 0) {
          return remainingMinutes + ':' + this.digits(remainingSecs) + ' ' + this.pluralText('min', minutes);
        } else if (remainingMinutes > 0 && remainingSecs == 0) {
          return remainingMinutes + ' ' + this.pluralText('min', minutes);
        } else {
          return remainingSecs + ' ' + this.pluralText('sec', remainingSecs);
        }
      } else {
        if (remainingMinutes == 0 && remainingSecs == 0) {
          return hours + ' ' + this.pluralText('hour', hours);
        } else {
          return hours + ':' + this.digits(remainingMinutes) + ':' + this.digits(remainingSecs) + ' ' + this.pluralText('hour', hours);
        }
      }
    }

    return desc;
  }

  private appendText(arr: any) {
    if (arr.length == 1) {
      return arr[0];
    }

    let last = arr.pop();
    return arr.join(', ') + ' and ' + last;
  }

  private rangeToArray(range: string) {
    let res: any = null;
    let sp: any;
    let i: any;

    if (range.indexOf('-') >= 0) {
      sp = range.split('-');
      if (sp.length > 1) {
        res = [];
        for (i = parseInt(sp[0]); i <= parseInt(sp[1]); i++) {
          res.push(i);
        }
      }
    } else if (range.indexOf(',') >= 0) {
      sp = range.split(',');
      if (sp.length > 0) {
        res = [];
        for (i = 0; i < sp.length; i++) {
          res.push(parseInt(sp[i]));
        }
      }
    } else if (this.isNumber(range)) {
      res = [parseInt(range)];
    }

    return res;
  }

  private weekString(week: string) {
    let desc = '';

    if (week == '1-5' || week == '1,2,3,4,5') {
      desc = 'on weekdays';
    } else if (week == '0-6' || week == '0,1,2,3,4,5,6' || week == '1,2,3,4,5,6,7' || week == '1-7' || week == '1,2,3,4,5,6,0') {
      desc = 'every day';
    } else if (week == '6-7' || week == '0,6' || week == '6,7') {
      desc = 'on weekends';
    } else {
      let daysInWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      let arr = this.rangeToArray(week);

      if (arr) {
        desc = this.append(desc, 'on');

        let selectedDays: any = [];
        for (let i = 0; i < arr.length; i++) {
          if (arr[i] < daysInWeek.length) {
            selectedDays.push(daysInWeek[arr[i]]);
          }
        }

        desc = this.append(desc, this.appendText(selectedDays));
      }
    }

    return desc;
  }

  private isNumber(n: any) {
    return !isNaN(parseFloat(n)) && isFinite(n);
  }

  private digits(n: number) {
    return n < 10 ? '0' + n : n;
  }

  private prepend(desc: string, value: string, connector?: string) {
    let sep = desc.length > 0 ? (connector ? ' ' + connector + ' ' : ' ') : '';
    return value + sep + desc;
  }

  private ordinal(number: number) {
    let desc = '';

    if (number % 10 == 1) {
      desc = 'st';
    } else if (number % 10 == 2) {
      desc = 'nd';
    } else if (number % 10 == 3) {
      desc = 'rd';
    } else {
      desc = 'th';
    }

    return number + desc;
  }

  private monthString(monthIndex: number) {
    let mL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    return mL[monthIndex];
  }

  private bitmaskToString(bitmask: number) {
    return (bitmask >>> 0).toString(2);
  }

  private getConnectorByType(type: any) {
    type = type.toLowerCase();

    const isDetects =
      type.indexOf('motion') > -1 ||
      type.indexOf('leak') > -1 ||
      type.indexOf('smoke') > -1 ||
      type.indexOf('fire') > -1 ||
      type.indexOf('water') > -1 ||
      type.indexOf('vibration') > -1 ||
      type.indexOf('carbon') > -1 ||
      type.indexOf('glass') > -1;

    const isIs =
      type.indexOf('contact') > -1 ||
      type.indexOf('remote') > -1 ||
      type.indexOf('key fob') > -1 ||
      type.indexOf('keypad') > -1 ||
      type.indexOf('personal') > -1 ||
      type.indexOf('standard warning') > -1;

    if (isDetects) {
      return 'detects';

    } else if (isIs) {
      return 'is';
    }

    return 'matches';
  }

  private getDeviceStateFromType(type: string, isActive: boolean) {
    type = type.toLowerCase();

    if (type.indexOf('motion') > -1) {
      return isActive ? 'Motion' : 'No Motion';

    } else if (type.indexOf('leak') > -1) {
      return isActive ? 'Leak' : 'No Leak';

    } else if (type.indexOf('smoke') > -1) {
      return isActive ? 'Smoke' : 'No Smoke';

    } else if (type.indexOf('fire') > -1) {
      return isActive ? 'Fire' : 'No Fire';

    } else if (type.indexOf('water') > -1) {
      return isActive ? 'Water' : 'No Water';

    } else if (type.indexOf('vibration') > -1) {
      return isActive ? 'Vibration' : 'No Vibration';

    } else if (type.indexOf('carbon') > -1) {
      return isActive ? 'CO' : 'No CO';

    } else if (type.indexOf('glass') > -1) {
      return isActive ? 'Glass break' : 'No Glass break';

    } else if (type.indexOf('contact') > -1) {
      return isActive ? 'Open' : 'Closed';

    } else if (type.indexOf('standard warning') > -1) {
      return 'warning';

    } else if (type.indexOf('personal') > -1) {
      return 'emergency';

    } else if (type.indexOf('remote') > -1) {
      return 'emergency';

    } else if (type.indexOf('key fob') > -1) {
      return 'emergency';

    } else if (type.indexOf('keypad') > -1) {
      return 'emergency';
    }

    return '';
  }

  private getDeviceIdFromPath(path: string = '') {
    // /devices/582a1bddad04460fe3ac527a/comps/1/procs/OnOff/methods/On

    let split = path.split('/');
    if (split.length > 2 && split[1] == 'devices') {
      return split[2];
    }

    return null;
  }

  private getComponentName(item: any) {
    if (item.componentName && item.componentName.length > 0) {
      return item.componentName;
    }
  }

  private getMethodFromPath(pathStr: any, onlyParameter: any) {
    const METHODS_DIR = '/methods/';
    const position = onlyParameter ? 1 : 0;
    const path = pathStr || '';
    const hasMethodsDir = path.indexOf(METHODS_DIR) > -1;
    let method;

    if (hasMethodsDir) {
      method = path
        .split(METHODS_DIR)[1]
        .split('.')[position];
    }

    if (method) {
      method = method.replace(/([A-Z])/g, ' $1').trim();
    }

    return method;
  }

  private getDeviceName(resource: any) {
    if (resource.path && resource.parents && Array.isArray(resource.parents.devices)) {
      let deviceId = this.getDeviceIdFromPath(resource.path);

      if (deviceId) {
        for (let i = 0; i < resource.parents.devices.length; i++) {
          let parent = resource.parents.devices[i];

          if (parent.id.toString() == deviceId) {
            return parent.name;
          }
        }
      }
    }

    return null;
  }

  private parseAttributeName(path: string) {
    let attributeName = 'attribute';

    // /devices/582a1bddad04460fe3ac527a/comps/1/procs/OnOff/attrs/On

    let arr = path.split('/');

    if (arr.length >= 8 && arr[7] == 'attrs') {
      if (arr[8].indexOf('.') >= 0) {
        let sp = arr[8].split('.');
        attributeName = sp[0];
      } else {
        attributeName = arr[8];
      }

      attributeName = attributeName.replace(/([A-Z])/g, ' $1').trim();
    }

    return attributeName;
  }

  private parseAttributeCondition(attr: string, val: any, deviceName: string, connector: string, processorName: string) {
    let desc = '';
    const attrStr = attr.toLowerCase();

    if (attrStr == 'on off') {
      if (parseInt(val) == 1 || val == 'on' || val == true) {
        desc = deviceName + ' is On';
      } else {
        desc = deviceName + ' is Off';
      }

    } else if (attrStr === 'lock state') {
      if (parseInt(val) == 1 || val == 'locked' || val == true) {
        desc = deviceName + ' is Locked';
      } else {
        desc = deviceName + ' is Unlocked';
      }

    } else if (attrStr == 'current level') {
      desc = deviceName + ' state ' + connector + ' ' + val + '%';

    } else if (attrStr == 'measured value' && processorName === 'RelativeHumidityMeasurementServer') {
      desc = deviceName + ' Humidity ' + connector + ' ' + val + '%';

    } else if (attrStr == 'measured value' && processorName === 'TemperatureMeasurementServer') {
      desc = deviceName + ' Temperature ' + connector + ' ' + val + '°C';

    } else if (attrStr === 'current summation delivered value') {
      desc = deviceName + ' Energy ' + connector + ' ' + val + ' kWh';

    } else if (attrStr === 'instantaneous demand value') {
      desc = deviceName + ' Power ' + connector + ' ' + val + ' kW';

    } else if (attrStr === 'voltage') {
      desc = deviceName + ' Voltage ' + connector + ' ' + val + '-Volts';

    } else if (attrStr === 'current') {
      desc = deviceName + ' Current ' + connector + ' ' + val + '-Amps';

    } else if (attrStr === 'frequency') {
      desc = deviceName + ' Frequency ' + connector + ' ' + val + '-Hz';

    } else if (attrStr === 'active power') {
      desc = deviceName + ' Power ' + connector + ' ' + val + '-Watts';

    } else if (attrStr === 'battery percentage remaining') {
      desc = deviceName + ' battery ' + connector + ' ' + val + '%';

    } else if (attrStr === 'local temperature') {
      desc = deviceName + ' Temperature ' + connector + ' ' + val + '°C';

    } else if (attrStr === 'system mode') {
      const idx = parseInt(val);
      const modes = ['Off', 'Auto', undefined, 'Cool', 'Heat'];
      const mode = modes[idx] || '';
      desc = deviceName + ' mode is set to ' + mode;

    } else if (attrStr === 'fan mode') {
      const idx = parseInt(val);
      const modes = ['Off', 'Low', 'Medium', 'High', 'On', 'Auto', 'Smart']
      const mode = modes[idx] || '';
      desc = deviceName + ' fan is set to ' + mode;

    } else if (attrStr === 'zone status') {
      if (val === 'emergency') {
        desc = 'Emergency button is pressed on ' + deviceName;

      } else if (val === 'warning') {
        desc = deviceName + ' sends Alert ';

      } else {
        desc = deviceName + ' ' + connector + ' ' + val;
      }

    } else if (attrStr.indexOf('setpoint') > -1) {
      if (attrStr.indexOf('heat') > -1) {
        desc = deviceName + ' heating setpoint ' + connector + ' ' + val + 'ºC';
      } else {
        desc = deviceName + ' cooling setpoint ' + connector + ' ' + val + 'ºC';
      }

    } else if (processorName === 'OnOffClient') {
      desc = 'Button ' + val + ' is Pressed on ' + deviceName;

    } else if (processorName === 'IASWDClient') {
      desc = 'Button is Pressed on ' + deviceName;

    } else {
      desc = attr + ' in ' + deviceName + ' ' + connector + ' ' + val;
    }

    return desc;
  }

  private getMultipleComponentsName(device: any, deviceId: any, processorName: any, componentId: any, parents: any) {
    let deviceName = '';

    if (device) {
      deviceName = device.name ? device.name : 'device ' + device._id;

      if (device.components) {
        let components = [];

        for (let i = 0; i < device.components.length; i++) {
          let component = device.components[i];
          if (component && component.processors) {
            for (let j = 0; j < component.processors.length; j++) {
              let processor = component.processors[j];

              if (processor && processor.name == processorName) {
                components.push(component);
              }
            }
          }
        }

        if (components.length > 1) {
          let component = components.find((it) => {
            return it.id == componentId;
          });

          if (component) {
            deviceName = deviceName + ' ' + component.name;
          }
        }
      }
    } else if (parents && parents.devices) {
      let parentDevice = parents.devices.find((item: any) => {
        return deviceId == item.id;
      });

      if (parentDevice && parentDevice.name) {
        deviceName = parentDevice.name;
      } else {
        deviceName = 'device ' + deviceId;
      }
    } else if (deviceId) {
      deviceName = 'device ' + deviceId;
    }

    return deviceName;
  }

  private setDeviceConditionDescription(condition: any, connector: string, val: string, device?: DeviceModel) {
    let description = '';

    if (condition.path && condition.type == 'device-state') {
      let attr = this.parseAttributeName(condition.path);
      const methodParam = this.getMethodFromPath(condition.path, true);
      const deviceId = this.getDeviceIdFromPath(condition.path);
      const processorName = this.getDeviceProcessorFromPath(condition.path);
      const componentId = this.getDeviceComponentFromPath(condition.path);

      attr = attr === 'attribute' && methodParam ? methodParam : attr;

      if (deviceId && device) {
        const deviceName = this.getMultipleComponentsName(device, deviceId, processorName, componentId, condition.parents);

        const supportedConnector =
          'is equal to' === connector ||
          'is above' === connector ||
          'is below' === connector ||
          'is' === connector ||
          'detects' === connector;

        if (supportedConnector) {
          if (processorName) {
            description = this.append(description, 'when ' + this.parseAttributeCondition(attr, val, deviceName, connector, processorName));
          }

        } else {
          description = this.append(description, 'when ' + attr + ' in ' + deviceName + ' ' + connector + ' ' + val);
        }
      }
    }

    return description;
  }

  private parseCrontab(crontab: string, sunTime?: boolean, timezone?: string, hasFromTo?: boolean) {
    let desc = '';
    let parts = crontab.split(' ');

    if (parts.length >= 5) {
      let minutes = <any>parts[0];
      let hours = <any>parts[1];
      let date = parts[2];
      let month = parts[3];
      let week = parts[4];

      let offsetTime = this.calcTimezone(timezone);
      let innerDate: any;

      if (date == '*' && week == '*') {
        if (minutes != '*' || hours != '*') {
          const { hrsUtc, minsUtc } = this.convertHoursMinutesToUtc(hours, minutes, offsetTime);
          const hrs = this.getRegularHourFormat(hrsUtc);
          const amPm = this.getAmPmByHour(hrsUtc);
          desc = this.append(desc, 'every day at ' + hrs + ':' + this.digits(minsUtc) + ' ' + amPm);

          if (month != '*') {
            desc = this.append(desc, 'during ' + this.monthString(parseInt(month)));
          }

          return desc;
        }
      }

      if (!sunTime) {
        if (minutes != '*' && hours != '*' && !hasFromTo) {
          const { hrsUtc, minsUtc } = this.convertHoursMinutesToUtc(hours, minutes, offsetTime);
          const hrs = this.getRegularHourFormat(hrsUtc);
          const amPm = this.getAmPmByHour(hrsUtc);

          if (parseInt(hours) != 0) {
            desc = this.append(desc, 'at ' + hrs + ':' + this.digits(minsUtc) + ' ' + amPm);
          }

        } else if (hours == '*' && minutes == '0' && !hasFromTo) {
          desc = desc.length > 0 ? this.append(desc, 'every hour') : this.append(desc, 'hourly');

        } else if (hours == '*' && minutes != '*' && !hasFromTo) {
          innerDate = new Date(parseInt(minutes) * 60 * 1000);
          innerDate.setTime(innerDate.getTime() + offsetTime);

          minutes = innerDate.getUTCMinutes();

          desc = this.append(desc, 'every ' + (parseInt(minutes) != 1 ? minutes + ' ' : '') + this.pluralText('minute', parseInt(minutes)));
        }
      }

      if (week != '*' && date.indexOf('/2') < 0) {
        let weekStr = this.weekString(week);
        desc = this.prepend(desc, weekStr);

      } else if (week === '*' && date.indexOf('/2') < 0) {
        desc = this.prepend(desc, 'every day');
      }

      if (date === '1-31/2') {
        desc = this.prepend(desc, 'on odd dates, ');

      } else if (date === '0-30/2') {
        desc = this.prepend(desc, 'on even dates, ');

      } else if (date !== '*') {
        desc = this.append(desc, 'each ' + this.ordinal(parseInt(date)) + (month == '*' ? ' day of the month' : ''));
      }

      if (month != '*') {
        desc = this.append(desc, 'during ' + this.monthString(parseInt(month)));
      }
    }

    return desc;
  }

  private convertHoursMinutesToUtc(hours: any, minutes: any, offsetTime: any) {
    const innerDate = new Date((parseInt(hours) * 60 * 60 + parseInt(minutes) * 60) * 1000);
    innerDate.setTime(innerDate.getTime() + offsetTime);
    const hrsUtc = innerDate.getUTCHours();

    return {
      hrsUtc: innerDate.getUTCHours(),
      minsUtc: innerDate.getUTCMinutes()
    };
  }

  private getRegularHourFormat(hourUtc: number) {
    if (hourUtc >= 12) {
      hourUtc = hourUtc - 12;
    }
    if (hourUtc === 0) {
      hourUtc = 12;
    }
    return hourUtc;
  }

  private getAmPmByHour(hour: number) {
    let dd = 'AM';
    if (hour >= 12) {
      dd = 'PM';
    }
    return dd;
  }

  private parseDelay(delay: number) {
    if (this.isNumber(delay)) {
      if (delay < 60) {
        return delay + ' secs';
      } else if (delay >= 60) {
        return this.parseSeconds(delay);
      }
    }
  }

  private getDeviceMethodFromPath(path: string) {
    // /devices/582a1bddad04460fe3ac527a/comps/1/procs/OnOff/methods/On

    let split = path.split('/');
    if (split.length >= 8 && split[1] == 'devices' && split[7] == 'methods') {
      return split[8];
    }

    return null;
  }

  private getDeviceAttributeFromPath(path: string) {
    // /devices/582a1bddad04460fe3ac527a/comps/1/procs/OnOff/methods/On

    let split = path.split('/');
    if (split.length >= 8 && split[1] == 'devices' && split[7] == 'attrs') {
      return split[8];
    }

    return null;
  }

  private parseDuration(duration: any) {
    // console.log("Duration: ",duration);
    var hours: Number = Math.floor(duration / 3600);
    duration %= 3600;
    var minutes: Number = Math.floor(duration / 60);
    var seconds: Number = duration % 60;
    var desc: string = " for ";

    if (hours > 0) {
      desc += String(hours) + (hours > 1 ? ' hrs' : " hr");
    }
    if (minutes > 0) {
      desc += (hours > 0 ? " " : "") + String(minutes) + (minutes > 1 ? ' mins' : " min");
    }
    if (seconds > 0) {
      if (hours > 0 || minutes > 0) {
        desc += " ";
      }
      desc += String(seconds) + (seconds > 1 ? ' secs' : " sec");
    }
    if ((seconds == 0) && (hours == 0) && (minutes == 0)) {
      desc = "";
    }

    return desc;
  }

  private parseMethod(method: string, deviceName: string, value: any) {
    let desc: any;

    let lowerCaseMethod = method.toLowerCase();

    if (lowerCaseMethod.indexOf('on') == 0 || lowerCaseMethod.indexOf('off') == 0 ||
        lowerCaseMethod.indexOf('programon') == 0 || lowerCaseMethod.indexOf('programoff') == 0) {
      desc = 'turn ' + method.replace('Program', '') + ' ' + deviceName;
    } else if (lowerCaseMethod.indexOf('toggle') == 0) {
      desc = method + ' ' + deviceName;
    } else if (lowerCaseMethod.indexOf('movetolevel') == 0 && value.value != null) {
      desc = 'set ' + deviceName + ' to ' + value.value + '%';
    } else if (lowerCaseMethod.indexOf('unlockdoor') == 0) {
      desc = 'Unlock ' + deviceName;
    } else if (lowerCaseMethod.indexOf('lockdoor') == 0) {
      desc = 'Lock ' + deviceName;
    } else if (lowerCaseMethod.indexOf('startwarning') == 0) {
      // console.log("start warning value is:", value);
      if (value.Mode == 0) {
        desc = 'Stop warning on ' + deviceName;
      } else {
        desc = 'Start warning on ' + deviceName + this.parseDuration(value.Duration);
      }
    } else if (lowerCaseMethod.indexOf('sendemail') == 0) {
      desc = 'Send Email';
    } else if (lowerCaseMethod.indexOf('notification') > -1) {
      desc = 'Send Push Notification';
    }
    else {
      desc = 'execute ' + method + ' on ' + deviceName;
    }

    return desc;
  }

  private parseAttribute(attribute: string, deviceName: string, value: any) {
    let desc;
    const valueStr = value && value.value;

    let lowerCaseAttribute = attribute.toLowerCase();

    if (lowerCaseAttribute.indexOf('onoff') == 0) {
      desc = 'turn ' + (valueStr ? 'On' : 'Off') + ' ' + deviceName;
    } else if (lowerCaseAttribute.indexOf('currentlevel') == 0) {
      desc = 'set ' + deviceName + ' to ' + valueStr + '%';
    } else if (lowerCaseAttribute.indexOf('systemmode') == 0) {
      // console.log('is system mode');
      desc = 'set ' + deviceName + ' to ';
      if (valueStr == 0) desc += "off";
      else if (valueStr == 1) desc += "auto";
      else if (valueStr == 3) desc += "cool";
      else if (valueStr == 4) desc += "heat";
    } else if (lowerCaseAttribute.indexOf('setpoint') > -1) {
      // console.log('is set points');
      if (lowerCaseAttribute.indexOf('heat') > -1) {
        desc = 'set ' + deviceName + ' heating setpoint to ' + valueStr + 'ºC';
      } else {
        desc = 'set ' + deviceName + ' cooling setpoint to ' + valueStr + 'ºC';
      }
    } /*else if (lowerCaseAttribute.indexOf('fanmode') == 0 && valueStr) {
      desc = 'set ' + deviceName + ' to ';
      if(valueStr == 0) desc += "off";
      else if(valueStr == 1) desc += "auto";
      else if(valueStr == 3) desc += "cool";
      else if(valueStr == 4) desc += "heat";
    }*/
    else {
      desc = 'set ' + attribute + ' to ' + valueStr + ' on ' + deviceName;
    }

    return desc;
  }

  getDateDescription(date: Date, todaysDate: Date) {
    let desc = '';

    if (date && date.getHours && date.getMinutes && date.getDate && date.getMonth) {
      desc = 'at ' + date.getHours() + ':' + this.digits(date.getMinutes());

      if (date.getDate() == todaysDate.getDate()) {
        desc += ', Today';
      } else {
        desc += ', ' + this.monthString(date.getMonth()) + ' ' + this.ordinal(date.getDate());
      }
    }

    return desc;
  }

  getConditionDescription(condition: ConditionModel, device?: DeviceModel) {
    let description = '';

    if (condition && condition.value != undefined) {
      let val = condition.value;
      let parsedEqual = false;

      if (val.hasOwnProperty('#crontab')) {
        const hasFromTo = val.hasOwnProperty('#from') || val.hasOwnProperty('#to');

        if (val.hasOwnProperty('#eval') && (val['#eval'] == 'sunset' || val['#eval'] == 'sunrise')) {
          parsedEqual = true;

          if (val.hasOwnProperty('#offset')) {
            const parsedOffset = this.parseOffset(val['#offset']);
            description = this.append(description, parsedOffset);
            description = this.append(description, !parsedOffset ? 'at ' + val['#eval'] : val['#eval']);

          } else {
            description = this.append(description, 'at ' + val['#eval']);
          }

          description = this.prepend(description, this.parseCrontab(val['#crontab'], true, val['#tz'], hasFromTo));
          description = description && description.trim();

        } else {
          description = this.append(description, this.parseCrontab(val['#crontab'], false, val['#tz'], hasFromTo));
        }
      }

      if (condition.path && condition.type == 'device-state') {
        if (typeof val === 'string') {
          description = this.append(description,
            this.setDeviceConditionDescription(condition, 'is equal to', val, device)
          );
        } else if (val.hasOwnProperty('#eq')) {
          description = this.append(description,
            this.setDeviceConditionDescription(condition, 'is equal to', val['#eq'], device)
          );
        }

        if (val.hasOwnProperty('#gt')) {
          description = this.append(description,
            this.setDeviceConditionDescription(condition, 'is above', val['#gt'], device)
          );
        }

        if (val.hasOwnProperty('#gte')) {
          description = this.append(description,
            this.setDeviceConditionDescription(condition, 'is greater or equal to', val['#gte'], device)
          );
        }

        if (val.hasOwnProperty('#lt')) {
          description = this.append(description,
            this.setDeviceConditionDescription(condition, 'is below', val['#lt'], device)
          );
        }

        if (val.hasOwnProperty('#lte')) {
          description = this.append(description,
            this.setDeviceConditionDescription(condition, 'is lower or equal to', val['#lte'], device)
          );
        }

        if (val.hasOwnProperty('#ne')) {
          description = this.append(description,
            this.setDeviceConditionDescription(condition, 'is different from', val['#ne'], device)
          );
        }

        if (val.hasOwnProperty('#regex')) {
          description = this.append(description,
            this.setDeviceConditionDescription(condition, 'matches', '"' + val['#regex'] + '"', device)
          );
        }

        if (val.hasOwnProperty('#bitmask')) {
          let type = val['#type'];
          if (type) {
            const isActive = !val.hasOwnProperty('#expected');
            const connector = this.getConnectorByType(type);
            const deviceState = this.getDeviceStateFromType(type, isActive);

            description = this.append(description,
              this.setDeviceConditionDescription(condition, connector, deviceState, device)
            );

          } else {
            description = this.append(description,
              this.setDeviceConditionDescription(condition, 'is equal to', this.bitmaskToString(val['#bitmask']), device)
            );
          }
        }
      } else {
        if (!parsedEqual && typeof val === 'string') {
          description = this.append(description, 'at ' + val);
        }

        if (!parsedEqual && val.hasOwnProperty('#eq')) {
          const equalValue = val['#eq'];
          const timeZone = val['#tz'];

          if (timeZone) {
            const timeValue = this.parseDateVal(equalValue, timeZone, true, false);
            description = this.append(description, 'at ' + timeValue);

          } else {
            description = this.append(description, 'at ' + equalValue);
          }
        }

        if (val.hasOwnProperty('#random')) {
          description = this.append(description, 'randomly');
        }

        if (val.hasOwnProperty('#interval')) {
          description = this.append(description, this.parseInterval(val['#interval']));
        }

        if (val.hasOwnProperty('#from') && !val.hasOwnProperty('#to')) {
          const fromValueHasDatetime = val['#fromHasDatetime'];
          description = this.append(description, 'starting on ' + this.parseDateVal(val['#from'], val['#tz'], false, fromValueHasDatetime));
        }

        if (val.hasOwnProperty('#from') && val.hasOwnProperty('#to')) {
          const fromValueHasDatetime = val['#fromHasDatetime'];
          const toValueHasDatetime = val['#toHasDatetime'];
          const timeZone = val['#tz'];
          const fromValue = val['#from'];
          const toValue = val['#to'];
          const fromValueOnlyTime = isNaN(Date.parse(fromValue));
          const toValueOnlyTime = isNaN(Date.parse(toValue));
          const from = this.parseDateVal(fromValue, timeZone, fromValueOnlyTime, fromValueHasDatetime);
          const to = this.parseDateVal(toValue, timeZone, toValueOnlyTime, toValueHasDatetime);
          description = this.append(description, 'between ' + from + ' and ' + to);
        }

        if (val.hasOwnProperty('#period')) {
          description = this.append(description, 'every ' + val['#period'] + ' sec' + this.plural(val['#period']));
        }

        if (val.hasOwnProperty('#regex')) {
          description = this.append(description, 'time matches' + ' "' + val['#regex'] + '"');
        }
      }
    }

    // console.log('[SDK getConditionDescription]', condition);
    return description.charAt(0).toUpperCase() + description.substr(1);
  }

  calcTimezone(timezone: any) {
    let offsetTime = 0;

    if (timezone && timezone.length > 0) {
      let offset = timezone.split(':');

      if (offset && offset.length > 1) {
        let offsetHours = parseInt(offset[0]);
        let offsetMinutes = parseInt(offset[1]);

        offsetTime = (offsetHours * 60 + offsetMinutes) * 60 * 1000;
      }
    }

    return offsetTime;
  }

  parseDateVal(value: any, timeZone: string, onlyTime?: boolean, dateAndTime?: boolean) {
    let date = '';
    let offsetTime = this.calcTimezone(timeZone);

    var parsedDate = Date.parse(value);

    if (isNaN(parsedDate)) {
      if (value.indexOf(':') >= 0) {
        var parsedTime = value.split(':');
        var dateHours = parseInt(parsedTime[0]);
        var dateMinutes = parseInt(parsedTime[1]);

        let innerDate = new Date((dateHours * 60 + dateMinutes) * 60 * 1000);
        innerDate.setTime(innerDate.getTime() + offsetTime);

        const hrsUtc = innerDate.getUTCHours();
        const minsUtc = innerDate.getUTCMinutes();
        const hrs = this.getRegularHourFormat(hrsUtc);
        const amPm = this.getAmPmByHour(hrsUtc);

        date = hrs + ':' + this.digits(minsUtc) + ' ' + amPm;
      }
    } else {
      let innerDate = new Date(Date.parse(value));
      innerDate.setTime(innerDate.getTime() + offsetTime);

      const hrsUtc = innerDate.getUTCHours();
      const minsUtc = innerDate.getUTCMinutes();
      const hrs = this.getRegularHourFormat(hrsUtc);
      const amPm = this.getAmPmByHour(hrsUtc);

      if (onlyTime) {
        try {
          date = hrs + ':' + this.digits(minsUtc) + ' ' + amPm;
        } catch (err) {
          date = value;
        }
      } else {
        try {
          const monthUtc = innerDate.getUTCMonth();
          const dateUtc = innerDate.getUTCDate();
          const yearUtc = innerDate.getUTCFullYear();
          date = this.monthString(monthUtc) + ' ' + this.ordinal(dateUtc) + ' ' + yearUtc;
        } catch (err) {
          date = value;
        }
      }

      if (dateAndTime && !isNaN(parsedDate)) {
        date = this.append(date, ' at ' + hrs + ':' + this.digits(minsUtc) + ' ' + amPm);
      }
    }

    return date;
  }

  parseInterval(interval: String) {
    const split = interval.split(' ');
    let desc: string = '';

    if (split && split.length >= 3) {
      let days: any = split[0];
      let hours: any = split[1];
      let minutes: any = split[2];

      let hoursDesc = '';
      let minutesDesc = '';
      let secsDesc = '';

      if (days && days != 0) {
        desc = 'repeating every ';
        if (days == 1) {
          hoursDesc = 'day';
        } else {
          hoursDesc = days + ' days';
        }
      }

      if (hours && hours != 0) {
        desc = 'repeating every ';
        if (hours == 1) {
          minutesDesc = 'hour';
        } else {
          minutesDesc = hours + ' hours';
        }
      }

      if (minutes && minutes != 0) {
        desc = 'repeating every ';
        if (minutes == 1) {
          secsDesc = 'minute';
        } else {
          secsDesc = minutes + ' minutes';
        }
      }

      let arr = [hoursDesc, minutesDesc, secsDesc].filter(function (item) {
        return item.length > 0;
      });

      if (arr.length === 1) {
        desc += arr[0] + ',';

      } else if (arr.length === 2) {
        desc += arr.join(' and ') + ',';

      } else if (arr.length === 3) {
        desc += arr[0] + ', ' + arr[1] + ' and ' + arr[2] + ',';
      }
    }

    return desc;
  }

  getEffectDescription(effect: EffectModel, device?: DeviceModel) {
    let desc = '';

    let deviceId = this.getDeviceIdFromPath(effect.path);
    let processorName = this.getDeviceProcessorFromPath(effect.path);
    let componentId = this.getDeviceComponentFromPath(effect.path);

    if (effect.delay) {
      desc = this.append(desc, 'after ' + this.parseDelay(effect.delay) + ',');
    }

    if (deviceId) {
      let deviceName = this.getMultipleComponentsName(device, deviceId, processorName, componentId, effect.parents);
      const valueDesc = this.processorValueHelperService.getValueDescription(device, componentId, processorName, effect.params);
      deviceName = (valueDesc) ? deviceName.concat(' ', valueDesc) : deviceName;

      let method = this.getDeviceMethodFromPath(effect.path);
      let attribute = this.getDeviceAttributeFromPath(effect.path);

      if (method) {
        let parsedMethod = this.parseMethod(method, deviceName, effect.params);

        desc = this.append(desc, parsedMethod);
      } else if (attribute) {
        const parsedAttribute = this.parseAttribute(attribute, deviceName, effect.params);

        desc = this.append(desc, parsedAttribute);
      } else {
        desc = this.append(desc, 'execute method');
        desc = this.append(desc, deviceName, 'on');
      }
    }

    // console.log('[SDK getEffectDescription]', effect);
    return desc.charAt(0).toUpperCase() + desc.substr(1);
  }

  getResponderDescription(responder: ResponderModel, device: DeviceModel) {
    let desc = '';

    const deviceId = this.getDeviceIdFromPath(responder.path);
    const processorName = this.getDeviceProcessorFromPath(responder.path);
    const componentId = this.getDeviceComponentFromPath(responder.path);

    if (deviceId) {
      const deviceName = this.getMultipleComponentsName(device, deviceId, processorName, componentId, responder.parents);

      let method = this.getDeviceMethodFromPath(responder.path);
      let attribute = this.getDeviceAttributeFromPath(responder.path);

      if (method) {
        let parsedMethod = this.parseMethod(method, deviceName, responder.params);

        desc = this.append(desc, parsedMethod);
      } else if (attribute) {
        let parsedAttribute = this.parseAttribute(attribute, deviceName, responder.params);

        desc = this.append(desc, parsedAttribute);
      } else {
        desc = this.append(desc, 'execute method');
        desc = this.append(desc, deviceName, 'on');
      }
    }

    return desc.charAt(0).toUpperCase() + desc.substr(1);
  }

  getDeviceComponentFromPath(path: string) {
    // /devices/582a1bddad04460fe3ac527a/comps/1/procs/OnOff/methods/On

    if (path) {
      var split = path.split('/');
      if (split.length >= 8 && split[1] == 'devices' && split[3] == 'comps') {
        return split[4];
      }
    }

    return null;
  }

  getDeviceProcessorFromPath(path: string) {
    // /devices/582a1bddad04460fe3ac527a/comps/1/procs/OnOff/methods/On

    if (path) {
      var split = path.split('/');
      if (split.length >= 7 && split[1] == 'devices' && split[5] == 'procs') {
        return split[6];
      }
    }

    return null;
  }

  getControllerDescription(controller: ControllerModel, device: DeviceModel) {
    let desc = '';

    const deviceId = this.getDeviceIdFromPath(controller.path);
    const processorName = this.getDeviceProcessorFromPath(controller.path);
    const componentId = this.getDeviceComponentFromPath(controller.path);

    if (deviceId) {
      const deviceName = this.getMultipleComponentsName(device, deviceId, processorName, componentId, controller.parents);
      const componentName = this.getComponentName(controller) || 'button';

      if (processorName && processorName.toLowerCase() == 'onoffclient') {
        return 'When ' + deviceName + ' ' + componentName + ' is Pressed';
      }

      return desc;
    }

    return desc.charAt(0).toUpperCase() + desc.substr(1);
  }

  getActionDescription(conditions: [ConditionModel], effects: [EffectModel]) {
    let description: any = { conditions: [], effects: [] };

    for (let i = 0; i < conditions.length; i++) {
      description.conditions.push(conditions[i].description);
    }

    for (let i = 0; i < effects.length; i++) {
      description.effects.push(effects[i].description);
    }

    return description;
  }
}