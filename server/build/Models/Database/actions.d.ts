import { schemaConfig } from "../../Utils/types";
declare namespace DatabaseActions {
    const routeDatabaseActions: (operation: Object, method: string, configSchema: schemaConfig, callback: Function) => Promise<any>;
}
export default DatabaseActions;
