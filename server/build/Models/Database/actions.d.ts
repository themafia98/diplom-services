import { schemaConfig } from "../../Utils/Types";
declare namespace DatabaseActions {
    const routeDatabaseActions: () => (operation: Object, method: string, configSchema: schemaConfig, callback: Function, lengthActions: number) => Promise<any>;
}
export default DatabaseActions;
