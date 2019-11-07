import { сachingAction, setStatus, errorRequstAction } from "../";
import { updateItemStateAction } from "../../routerActions";
import { TASK_CONTROLL_JURNAL_SCHEMA, USER_SCHEMA, TASK_SCHEMA } from "../../../../Utils/schema/const";

const middlewareCaching = ({ data, primaryKey, type = "GET", pk = null, store = "" }) => (
    dispatch,
    getState,
    { firebase, getSchema, request, clientDB },
) => {
    const { requestError, status = "online" } = getState().publicReducer;
    if (status === "online" && store) {
        if (type === "POST") {
            const validHashCopy = [{ ...data, modeAdd: "online" }];
            const schema =
                store === "jurnalWork"
                    ? TASK_CONTROLL_JURNAL_SCHEMA
                    : store === "users"
                    ? USER_SCHEMA
                    : store === "tasks"
                    ? TASK_SCHEMA
                    : null;

            const validHash = validHashCopy.map(it => getSchema(schema, it, "no-strict")).filter(Boolean)[0];

            if (validHash)
                firebase.db
                    .collection(store)
                    .doc()
                    .set(validHash)
                    .then(() => {
                        clientDB.addItem(store, validHash);
                        dispatch(сachingAction({ data: validHash, load: true, primaryKey: primaryKey }));
                    })
                    .catch(error => {});
        } else if (type === "GET") {
            firebase.db
                .collection(store)
                .where("key", "==", primaryKey)
                .get()
                .then(querySnapshot => {
                    const { metadata: { fromCache = null } = {}, docs = [] } = querySnapshot;
                    const storeArray = [];

                    if (docs.length)
                        docs.forEach(doc => {
                            storeArray.push(doc.data());
                        });
                    if (storeArray.length) return storeArray;
                    else if (fromCache && !storeArray.length) throw new Error("Network error");
                    else throw new Error("Bad requst or no data");
                })
                .then(array => {
                    const schema =
                        store === "jurnalWork"
                            ? TASK_CONTROLL_JURNAL_SCHEMA
                            : store === "users"
                            ? USER_SCHEMA
                            : store === "tasks"
                            ? TASK_SCHEMA
                            : null;

                    const storeArrayCopy = array.map(it => getSchema(schema, it)).filter(Boolean);

                    storeArrayCopy.forEach(item => {
                        clientDB.updateItem(store, item);
                    });

                    if (requestError !== null) dispatch(errorRequstAction(null));
                    dispatch(
                        сachingAction({
                            data: storeArrayCopy,
                            load: true,
                            primaryKey: primaryKey,
                            pk: pk ? pk : null,
                        }),
                    );
                })
                .catch(error => {
                    if (error.message !== "Network error") return console.error(error.message);
                    if (status === "offline") return;
                    dispatch(setStatus("offline"));
                    dispatch(errorRequstAction(error.message));
                });
        }
    } else if (store) {
        const storeItems = clientDB.getAllItems(store);
        storeItems.onsuccess = event => {
            const {
                target: { result },
            } = event;
            const schema =
                store === "jurnalWork"
                    ? TASK_CONTROLL_JURNAL_SCHEMA
                    : store === "users"
                    ? USER_SCHEMA
                    : store === "tasks"
                    ? TASK_SCHEMA
                    : null;
            const storeArrayCopy = result.map(it => getSchema(schema, it)).filter(Boolean);
            dispatch(сachingAction({ data: storeArrayCopy, load: true, path: primaryKey, mode: "offline" }));
        };
    }
};

const middlewareUpdate = ({
    id,
    type = "UPDATE",
    updateProp = "",
    updateFild = "",
    item = {},
    findStore = "",
    updateStore = findStore,
    multiply = false,
    limitUpdate = 20,
}) => (dispatch, getState, { firebase, getSchema, request, clientDB }) => {
    const { status = "online" } = getState().publicReducer;

    if ((type === "UPDATE", updateStore && status === "online")) {
        const updater = async doc => {
            if (!multiply)
                return await firebase.db
                    .collection(updateStore)
                    .doc(doc.id)
                    .update({ [updateFild]: updateProp });
            else
                return await firebase.db
                    .collection(updateStore)
                    .doc(doc.id)
                    .update({ ...updateProp });
        };

        if (updateStore && findStore)
            firebase.db
                .collection(findStore) // tasks
                .where("key", "==", id)
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.docs.length)
                        querySnapshot.docs.forEach(async (doc, i) => {
                            if (i < limitUpdate) {
                                await updater(doc)
                                    .then(() => {
                                        let updaterItem = null;

                                        if (!multiply)
                                            updaterItem = {
                                                ...doc.data(),
                                                key: id,
                                                [updateFild]: updateProp,
                                                modeAdd: "online",
                                            };
                                        else {
                                            updaterItem = {
                                                ...doc.data(),
                                                key: id,
                                                ...updateProp,
                                                modeAdd: "online",
                                            };
                                        }

                                        const schema =
                                            updateStore === "jurnalWork"
                                                ? TASK_CONTROLL_JURNAL_SCHEMA
                                                : updateStore === "users"
                                                ? USER_SCHEMA
                                                : updateStore === "tasks"
                                                ? TASK_SCHEMA
                                                : null;

                                        const storeCopy = [updaterItem]
                                            .map(it => getSchema(schema, it, "no-strict"))
                                            .filter(Boolean);

                                        if (storeCopy) {
                                            dispatch(
                                                updateItemStateAction({
                                                    updaterItem: updaterItem,
                                                    type: findStore || updateStore,
                                                    id: id,
                                                }),
                                            );

                                            clientDB.updateItem(updateStore, updaterItem); // jurnakWork
                                        }
                                    })
                                    .catch(error => {
                                        if (error.message !== "Network error") return console.error(error.message);
                                        if (status === "offline") return;
                                        dispatch(setStatus("offline"));
                                        dispatch(errorRequstAction(error.message));
                                    });
                            }
                        });
                })
                .catch(error => {
                    if (error.message !== "Network error") return console.error(error.message);
                    if (status === "offline") return;
                    dispatch(setStatus("offline"));
                    dispatch(errorRequstAction(error.message));
                });
    } else if (updateStore && status === "offline") {
        const updaterItem = { ...item, key: id, [updateFild]: updateProp, modeAdd: "offline" };
        const updater = clientDB.updateItem(findStore || updateStore, updaterItem);
        updater.onsuccess = event => {
            const {
                target: { result },
            } = event;
            console.log(`Update item ${result} done.`);
            const schema =
                updateStore === "jurnalWork"
                    ? TASK_CONTROLL_JURNAL_SCHEMA
                    : updateStore === "users"
                    ? USER_SCHEMA
                    : updateStore === "tasks"
                    ? TASK_SCHEMA
                    : null;

            const tasksCopy = [updaterItem].map(it => getSchema(schema, it, "no-strict")).filter(Boolean);

            if (tasksCopy)
                dispatch(
                    updateItemStateAction({
                        updaterItem: updaterItem,
                        type: findStore || updateStore,
                        id: id,
                        mode: "offline",
                    }),
                );
        };
    }
};

export { middlewareCaching, middlewareUpdate };
