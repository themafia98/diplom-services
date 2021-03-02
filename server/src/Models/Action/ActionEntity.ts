import { ActionProps, EntityActionApi, FileApi, Dbms } from '../../utils/Interfaces/Interfaces.global';
import Instanse from '../../utils/instanse';

abstract class ActionEntity implements EntityActionApi {
  private actionPath: string = '';
  private actionType: string = '';
  private store: FileApi;
  private dbm: Dbms = Instanse.dbm;

  protected constructor(props: ActionProps) {
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
