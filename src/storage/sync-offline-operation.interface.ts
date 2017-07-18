import { Model } from "../common/model";

export enum OfflineOperation {
  SAVE,
  UPDATE,
  DELETE
}

export interface ISyncOfflineOperation {
  operation: OfflineOperation;
  resource: string;
  resourceId: string;
  model?: any;
  date: string;
}
