import { Observable } from "rxjs/Observable";
import { IStorable } from "../storage/storable.interface";
import { CRUDService } from "./crud.service";
import { IRequestOptions } from "./request-options.interface";

export abstract class Model implements IStorable {
  protected __id: string;
  protected _data: any;

  get _id(): string {
    return this.__id;
  }

  get name(): string {
    return this._data.name || '';
  }

  set _id(value: string) {
    this.__id = value;
  }

  get data(): any {
    return this._data;
  }

  set data(value: any) {
    if (value._id) {
      this._id = value._id;
    }

    if (value && typeof value.toStoreObject === 'function') {
      value = value.toStoreObject();
    }

    let keys = Object.keys(value);

    for (let i = 0; i < keys.length; i++) {
      let key = keys[i];

      if (key != 'data' && key != '_data') {
        Object.defineProperty(this, key, {
          get: () => {
            return this._data[key]
          },
          set: (val: any) => {
            this._data[key] = val;
          }
        });
      }
    }

    this._data = value;
  }

  copy() {
    return this.service.createModel(this._data);
  }

  protected service: CRUDService;

  constructor(service: CRUDService, data: any) {
    this.service = service;
    this.data = data;
  }

  save(options?: IRequestOptions): Observable<any> {
    return this.service.save(this, options).flatMap((saveResponse) => {
      this.data = saveResponse.data;

      return Observable.of(saveResponse);
    });
  }

  addParent(parent: Model): Observable<any> {
    if (!this._data.parents) {
      this._data.parents = {};
    }

    const parentType = parent.service.ResourceName;

    if (!this._data.parents[parentType]) {
      this._data.parents[parentType] = [];
    }

    this._data.parents[parentType].push({ id: parent._id, name: parent.name });

    return this.save();
  }

  removeParent(parent: Model): Observable<any> {
    if (!this._data.parents) {
      return Observable.of(false);
    }
    const parentType = parent.service.ResourceName;

    if (!this._data.parents[parentType]) {
      return Observable.of(false);
    }

    this._data.parents[parentType] = this._data.parents[parentType].filter((item: any) => {
      return item.id != parent._id;
    });

    return this.save({ data: { overwriteParents: true } });
  }

  list(query?: any, options?: IRequestOptions): Observable<any> {
    return this.service.list(query, options);
  }

  remove(): Observable<any> {
    console.log('remove', this);
    return this.service.removeById(this._id);
  }

  toStoreObject() {
    const copy: any = Object.assign({}, this._data);
    return copy;
  }
}