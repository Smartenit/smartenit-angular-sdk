import { Injectable } from '@angular/core';
import { IStorageItem } from './storage-item.interface';

@Injectable()
export class StorageService {
    get(key: string): Object | null {
        const itemString: any = localStorage.getItem(key);
        let item: IStorageItem;

        try {
            item = JSON.parse(itemString) as IStorageItem;

            if (item) {
                if (item.hasOwnProperty('ttl') && item.ttl !== undefined) {
                    if (item.ttl >= Date.now()) {
                        return item.value;
                    }
                } else {
                    return item.value;
                }
            }
        } catch (err) {
            console.log(err);
        }

        return null;
    }

    set(item: IStorageItem) {
        let storedValue: any = { value: item.value };

        if (item.ttl !== undefined) {
            storedValue.ttl = Date.now() + (item.ttl * 1000);
        }

        return localStorage.setItem(item.key, JSON.stringify(storedValue));
    }

    remove(item: IStorageItem) {
        return localStorage.removeItem(item.key);
    }

    clear() {
        return localStorage.clear();
    }
}
