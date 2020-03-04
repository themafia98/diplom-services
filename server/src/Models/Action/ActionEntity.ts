import { ActionProps, EntityActionApi, FileApi } from "../../Utils/Interfaces";

abstract class ActionEntity implements EntityActionApi {
    private actionPath: string = "";
    private actionType: string = "";
    private store: FileApi;

    constructor(props: ActionProps) {
        this.actionPath = props.actionPath;
        this.actionType = props.actionType;
        this.store = (props as Record<string, any>).store;
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