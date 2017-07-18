import { Model } from "../common/model";
import { UsersService } from "../resources/users.service";

export class UserModel extends Model {
  constructor(
    protected usersService: UsersService, data: any
  ) {
    super(usersService, data);
  }
}