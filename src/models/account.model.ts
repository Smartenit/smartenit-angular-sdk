import { AccountsService } from "../resources/accounts.service";
import { Model } from "../common/model";

export class AccountModel extends Model {
  get name(): string {
    return this._data.name;
  }

  set name(value: string) {
    this._data.name = value;
  }

  get settings(): any {
    return this._data.settings;
  }

  set settings(value: any) {
    this._data.settings = value;
  }

  constructor(protected actionsService: AccountsService, data: any) {
    super(actionsService, data);
  }
}