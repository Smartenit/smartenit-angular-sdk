export interface IStorageItem {
  key: string;
  value: any;
  ttl?: number;
  [key: string]: any;
}
