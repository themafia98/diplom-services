import getAccessConfig from '../../core/Access/Access.config';
import { JsonConfig, UserRole, User } from '../../Utils/Interfaces';
import { MenuConfig, Role } from '../../Utils/Types';
import { ObjectId } from 'mongodb';

class AccessRole implements UserRole {
  private uid: Readonly<ObjectId>;
  private menuList: Readonly<Array<MenuConfig>>;
  private accessRole: Readonly<Role>;

  constructor(user: User, config: JsonConfig) {
    this.menuList = config.menu;
    this.accessRole = user.role;
    this.uid = user._id;
  }

  get userId() {
    return this.uid;
  }

  get menu() {
    const accessConfig = getAccessConfig(this.accessRole);
    return this.menuList.filter((module: MenuConfig) => {
      return accessConfig.some((config) => {
        const isCurrentModule = config.name === module.EUID || config.name === module.PARENT_CODE;

        return isCurrentModule && config.access;
      });
    });
  }
}

export default AccessRole;
