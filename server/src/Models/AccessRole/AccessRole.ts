import getAccessConfig from '../../core/Access/Access.config';
import { JsonConfig, UserRole, User, AccessConfig } from '../../Utils/Interfaces';
import { MenuConfig, Role } from '../../Utils/Types';
import { ObjectId } from 'mongodb';
import { ACTIONS_ACCESS } from '../../app.constant';

class AccessRole implements UserRole {
  private readonly uid: Readonly<ObjectId>;
  private readonly menuList: Readonly<Array<MenuConfig>>;
  private readonly accessRole: Readonly<Role>;
  private accessConfig: Array<AccessConfig>;

  constructor(user: User, config: JsonConfig) {
    this.menuList = config.menu;
    this.accessRole = user.role;
    this.uid = user._id;
    this.accessConfig = getAccessConfig(this.accessRole);
  }

  get userId() {
    return this.uid;
  }

  get config() {
    return this.accessConfig;
  }

  get menu() {
    return this.menuList.filter((module: MenuConfig) => {
      return this.accessConfig.some((config) => {
        const isCurrentModule = config.name === module.EUID || config.name === module.PARENT_CODE;

        return isCurrentModule && config.access;
      });
    });
  }

  static getAvailableActions(
    moduleName: string = '',
    accessConfig: Array<AccessConfig>,
  ): Array<string | void | object> | null {
    const moduleConfig: AccessConfig | Array<AccessConfig> | null = moduleName
      ? accessConfig.find((it) => it.name.includes(moduleName)) || null
      : null;

    return moduleConfig === null ? [ACTIONS_ACCESS.LIMITED_VIEW] : moduleConfig.actions;
  }
}

export default AccessRole;
