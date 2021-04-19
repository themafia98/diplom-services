import { ActionProps, EntityActionApi, FileApi, Dbms } from '../../Utils/Interfaces/Interfaces.global';
import instanse from '../../Utils/instanse';

class ActionEntity implements EntityActionApi {
  private actionPath = '';

  private actionType = '';

  private store: FileApi;

  private dbm: Dbms = instanse.dbm;

  constructor(props: ActionProps) {
    this.actionPath = props.actionPath;
    this.actionType = props.actionType;
    this.store = props.store as FileApi;
  }

  public getActionPath(): string {
    return this.actionPath;
  }

  public getActionType(): string {
    return this.actionType;
  }

  public getStore(): FileApi {
    return this.store;
  }

  public getDbm(): Dbms {
    return this.dbm;
  }
}

export default ActionEntity;
