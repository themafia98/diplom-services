import getAccessConfig from '../../core/Access/Access.config';
import { JsonConfig, UserRole, User, AccessConfig } from '../../Utils/Interfaces';
import { MenuConfig, Role } from '../../Utils/Types';
import { ObjectId } from 'mongodb';

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

  get menu() {
    return this.menuList.filter((module: MenuConfig) => {
      return this.accessConfig.some((config) => {
        const isCurrentModule = config.name === module.EUID || config.name === module.PARENT_CODE;

        return isCurrentModule && config.access;
      });
    });
  }

  public getAvailableActions(moduleName: string = ''): Array<string | void | object> | null {
    const moduleConfig: AccessConfig | Array<AccessConfig> | null = moduleName
      ? this.accessConfig.find((it) => it.name === moduleName) || null
      : null;

    return moduleConfig === null
      ? this.accessConfig.map((it: AccessConfig) => ({ name: it.name, actions: it.actions }))
      : moduleConfig.actions;
  }
}

export default AccessRole;
