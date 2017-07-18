import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';

import { IRequestOptions } from './request-options.interface';

@Injectable()
export class DataQueryService {
  filterAndSliceData(data: Array<any>, query: any, options: IRequestOptions): Array<any> {
    return this.sliceData(this.filterData(data, query), options);
  }

  filterData(data: Array<any>, query: any): Array<any> {
    if (!query || Object.keys(query).length === 0)
      return data;

    return data.filter((item) =>
      Object.keys(query).every((key) =>
        this.findInKey(key.indexOf('.') > 0 ? key.split('.') : [key], item, query[key])
      )
    );
  }

  sliceData(data: Array<any>, options: IRequestOptions): Array<any> {
    if (!options || !options.limit) {
      return data;
    }

    const { page = 1, limit = 25 } = options;

    const startIdx = (page - 1) * limit;
    const endIdx = page * limit;

    return data.filter((item, idx) => idx >= startIdx && idx < endIdx);
  }

  findInKey(keys: Array<string>, element: any, val: any): boolean {
    if (keys.length === 1) {
      if (val.hasOwnProperty('$regex')) {
        return this.findRegex(keys[0], element, val);
      } else if (val.hasOwnProperty('$nin')) {
        return !this.findIn(keys[0], element, val);
      } else if (val.hasOwnProperty('$in')) {
        return this.findIn(keys[0], element, val);
      } else if (val.hasOwnProperty('$exists')) {
        return this.findExists(keys[0], element, val);
      } else {
        return this.findEquals(keys[0], element, val);
      }
    }

    var currentKey: any = keys.shift();
    if (!element.hasOwnProperty(currentKey))
      return false;

    if (Array.isArray(element[currentKey])) {
      return element[currentKey].some((elItem: any) =>
        this.findInKey(keys, elItem, val)
      );
    } else {
      return this.findInKey(keys, element[currentKey], val);
    }
  }

  findIn(key: any, element: any, val: any): boolean {
    const values: Array<any> = val.$nin || val.$in;
    if (values != null) {
      if (Array.isArray((element[key]))) {
        return element[key].some((elItem: any) =>
          values.some((valItem) => (valItem.$oid || valItem) === (elItem.$oid || elItem))
        );
      } else {
        return values.some((valItem) => valItem && (valItem.$oid || valItem) === element[key]);
      }
    } else {
      return false;
    }
  }

  findRegex(key: any, element: any, val: any): boolean {
    const values = val.$regex;
    const options = val.$options || '';
    if (values != null) {
      return (new RegExp(values, options)).test(element[key]);
    } else {
      return false;
    }
  }

  findExists(key: any, element: any, val: any): boolean {
    return val.$exists ? element.hasOwnProperty(key) : !element.hasOwnProperty(key);
  }

  findEquals(key: any, element: any, val: any): boolean {
    if (Array.isArray(element)) {
      return element.some((elItem) =>
        elItem.hasOwnProperty(key) && elItem[key] === (val.$oid || val)
      );
    } else {
      return element.hasOwnProperty(key) && element[key] === (val.$oid || val);
    }
  }
}
