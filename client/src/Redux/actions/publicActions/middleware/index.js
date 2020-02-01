import _ from "lodash";
import { сachingAction, setStatus, errorRequstAction } from "../";
import { updateItemStateAction } from "../../routerActions";
import { TASK_CONTROLL_JURNAL_SCHEMA, USER_SCHEMA, TASK_SCHEMA } from "../../../../Models/Schema/const";

const middlewareCaching = (props) => (dispatch, getState, schema, Request, clientDB) => {
    const { data, primaryKey, type = "GET", pk = null, store = "" } = props;
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
        store = {}
    } = props;
    // key: "test"
    // type: "UPDATE"
    // taskStatus: "Выполнен"
    // updateField: "status"
    // item: { editor: Array(1), date: Array(2), comments: Array(0), _id: "5df16c5cccf73419bc1224a8", key: "test", … }
    // store: "tasks"

    // let updaterItem = null;

    //                                         if (!multiply)
    //                                             updaterItem = {
    //                                                 ...doc.data(),
    //                                                 key: id,
    //                                                 [updateFild]: updateProp,
    //                                                 modeAdd: "online"
    //                                             };
    //                                         else {
    //                                             updaterItem = {
    //                                                 ...doc.data(),
    //                                                 key: id,
    //                                                 ...updateProp,
    //                                                 modeAdd: "online"
    //                                             };
    //                                         }

    //                                         const schema =
    //                                             updateStore === "jurnalWork"
    //                                                 ? TASK_CONTROLL_JURNAL_SCHEMA
    //                                                 : updateStore === "users"
    //                                                     ? USER_SCHEMA
    //                                                     : updateStore === "tasks"
    //                                                         ? TASK_SCHEMA
    //                                                         : null;

    //                                         const storeCopy = [updaterItem]
    //                                             .map(it => getSchema(schema, it, "no-strict"))
    //                                             .filter(Boolean);

    //                                         if (storeCopy) {
    //                                             dispatch(
    //                                                 updateItemStateAction({
    //                                                     updaterItem: updaterItem,
    //                                                     type: findStore || updateStore,
    //                                                     id: id
    //                                                 })
    //                                             );

    //                                             clientDB.updateItem(updateStore, updaterItem); // jurnakWork
    //                                         }
    //                                     })
    //                                     .catch(error => {
    //                                         if (error.message !== "Network error") return console.error(error.message);
    //                                         if (status === "offline") return;
    //                                         dispatch(setStatus({ statusRequst: "offline" }));
    //                                         dispatch(errorRequstAction(error.message));
    //                                     });
    //                             }
    //                         });
    //                 })
    //                 .catch(error => {
    //                     if (error.message !== "Network error") return console.error(error.message);
    //                     if (status === "offline") return;
    //                     dispatch(setStatus({ statusRequst: "offline" }));
    //                     dispatch(errorRequstAction(error.message));
    //                 });
    //     } else if (updateStore && status === "offline") {
    //         const updaterItem = { ...item, key: id, [updateFild]: updateProp, modeAdd: "offline" };
    //         const updater = clientDB.updateItem(findStore || updateStore, updaterItem);
    //         updater.onsuccess = event => {


    //             const schema =
    //                 updateStore === "jurnalWork"
    //                     ? TASK_CONTROLL_JURNAL_SCHEMA
    //                     : updateStore === "users"
    //                         ? USER_SCHEMA
    //                         : updateStore === "tasks"
    //                             ? TASK_SCHEMA
    //                             : null;

    //             const tasksCopy = [updaterItem].map(it => getSchema(schema, it, "no-strict")).filter(Boolean);

    //             if (tasksCopy)
    //                 dispatch(
    //                     updateItemStateAction({
    //                         updaterItem: updaterItem,
    //                         type: findStore || updateStore,
    //                         id: id,
    //                         mode: "offline"
    //                     })
    //                 );
    //         };
    //     }
    // } else if (type === "DELETE") {

    console.log(props);

    const router = getState().router;
    const { requestError, status = "online" } = getState().publicReducer;

    if (status === "online") {

        switch (type) {

            case "UPDATE": {
                try {
                    const path = `/${store}/update/single`;
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
