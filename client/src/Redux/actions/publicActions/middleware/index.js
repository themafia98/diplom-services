import _ from "lodash";
import { сachingAction, setStatus, errorRequstAction } from "../";
import { updateItemStateAction } from "../../routerActions";
import { TASK_CONTROLL_JURNAL_SCHEMA, USER_SCHEMA, TASK_SCHEMA } from "../../../../Models/Schema/const";

const middlewareCaching = (props) => (dispatch, getState, schema, Request, clientDB) => {
    const { data, primaryKey, type = "GET", pk = null, store = "", actionType = "default" } = props;
    const { requestError, status = "online" } = getState().publicReducer;

};

const middlewareUpdate = (props) => async (dispatch, getState, { schema, Request, clientDB }) => {

    const {
        id = "",
        key = "",
        type = "UPDATE",
        updateField = "",
        item = {},
        updateItem,
        store = {},
        actionType = "default"
    } = props;

    const router = getState().router;
    const { requestError, status = "online" } = getState().publicReducer;

    if (status === "online") {

        switch (type) {

            case "UPDATE": {
                try {
                    const path = actionType === "update_many" ? `/${store}/update/many` : `/${store}/update/single`;
                    const rest = new Request();

                    const body = { queryParams: { id, key }, updateItem, updateField };

                    const res = await rest.sendRequest(path, "POST", body, true);

                    if (!res || res.status !== 200) throw new Error("Bad update");

                    const updaterItem = { ...res["data"]["response"]["metadata"] };

                    const schemTemplate =
                        store === "jurnalWork"
                            ? TASK_CONTROLL_JURNAL_SCHEMA
                            : store === "users"
                                ? USER_SCHEMA
                                : store === "tasks"
                                    ? TASK_SCHEMA
                                    : null;


                    const storeCopy = [updaterItem]
                        .map(it => schema.getSchema(schemTemplate, it))
                        .filter(Boolean);

                    if (storeCopy) {
                        dispatch(
                            updateItemStateAction({
                                updaterItem: updaterItem,
                                type,
                                id,
                            })
                        );

                        clientDB.updateItem(store, updaterItem); // jurnakWork
                        break;

                    }
                } catch (error) {
                    console.error(error);
                    dispatch(errorRequstAction(error.message));
                    break;
                }
            }


            case "DELETE": { break; }

            default: { break; }
        }

    }
}

export { middlewareCaching, middlewareUpdate };
