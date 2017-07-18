const LocalForage = require('localforage');

//import LocalForage from "localforage";
import { Observable } from "rxjs/Observable";
import { IStorageItem } from "./storage-item.interface";
import { Model } from "../common/model";

import 'rxjs/add/observable/fromPromise';

export class DatabaseCollection {
  private _instance: any;

  constructor(public name: string) {
    this._instance = LocalForage.createInstance({
      name: name
    });
  }

  getById(id: string): Observable<any> {
    return Observable.fromPromise(this._instance.getItem(id).then((item: IStorageItem) => {
      if (item && item.ttl && item.ttl < Date.now()) {
        this._instance.removeItem(id).then(() => {
          return Promise.resolve(null);
        });
      } else {
        return Promise.resolve(item && item.value);
      }
    }));
  }

  static generateId(name: string) {
    let buf: any = [];
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    const charLen = chars.length;

    for (let i = 0; i < 24; ++i)
      buf.push(chars[Math.floor(Math.random() * (charLen + 1))]);

    return 'loc_' + buf.join('') + '_' + name;
  }

  save(key: string, value: any, ttl?: number): Observable<any> {
    if (!key || key === undefined || key == null) {
      key = DatabaseCollection.generateId(this.name);
    }

    if (value && typeof value.toStoreObject === 'function') {
      value = value.toStoreObject();
    }

    let storeObject: IStorageItem = { key: key, value: value };

    if (ttl && ttl != -1) {
      storeObject.ttl = Date.now() + (ttl * 1000);
    }

    return this.getById(key).map((element) => {
      let storedItem: any = {};
      if (element) {
        let keys = Object.keys(storeObject);

        for (let i = 0; i < keys.length; i++) {
          let keyValue: string = keys[i];
          storedItem[keyValue] = storeObject[keyValue];
        }
      } else {
        storedItem = value;
      }

      this._instance.setItem(key, storeObject);

      return storedItem;
    });
  }

  saveLocal(key: string, value: any): Observable<any> {
    let isNew = false;

    if (!key || key === undefined || key == null) {
      key = DatabaseCollection.generateId(this.name);
      isNew = true;
    }

    if (value && typeof value.toStoreObject === 'function') {
      value = value.toStoreObject();
    }

    const storeObject: IStorageItem = {
      key: key,
      value: Object.assign({}, value, { _id: key }),
      isNew
    };

    return this.getById(key).map((element) => {
      if (element) {
        storeObject.value = Object.assign({}, element, storeObject.value);
      }

      this._instance.setItem(key, storeObject);

      return storeObject;
    });
  }

  list(): Observable<any> {
    let data: any = [];

    return Observable.fromPromise(this._instance.iterate(function (value: any) {
      data.push(value);
    }).then(() => {
      return data;
    }));
  }

  removeById(id: string): Observable<any> {
    return Observable.fromPromise(this._instance.removeItem(id).then(() => {
      return Promise.resolve();
    }));
  }

  clear() {
    this._instance.clear();
  }
}
