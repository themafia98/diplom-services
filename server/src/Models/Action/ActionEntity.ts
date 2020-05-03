import { ActionProps, EntityActionApi, FileApi } from '../../Utils/Interfaces';

abstract class ActionEntity implements EntityActionApi {
  private actionPath: string = '';
  private actionType: string = '';
  private store: FileApi;

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
}

export default ActionEntity;
