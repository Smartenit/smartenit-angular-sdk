import { Injectable } from '@angular/core';

import * as localforage from "localforage";
import { DatabaseCollection } from "./database-collection";

@Injectable()
export class DatabaseService {
    private _instances: any = {};

    constructor() {
        localforage.config({
            name: 'smartenit',
            driver: localforage.WEBSQL,
            version: 1.1,
        });
    }

    clear(excludedInstances?: [string]) {
        const instanceKeys = Object.keys(this._instances);

        for (let i = 0; i < instanceKeys.length; i++) {
            const key = instanceKeys[i];
            if (excludedInstances && excludedInstances.length > 0 && excludedInstances.indexOf(key) < 0) {
                this._instances[key].clear();
            }
        }
    }

    getCollection(collectionName: string): DatabaseCollection {
        let instance: any;

        if (this._instances.hasOwnProperty(collectionName)) {
            return this._instances[collectionName];
        }

        if (!instance) {
            instance = new DatabaseCollection(collectionName);
            this._instances[collectionName] = instance;
        }

        return instance;
    }
}
