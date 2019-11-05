import { сachingAction, setStatus, errorRequstAction } from "../";
import { updateItemStateAction } from "../../routerActions";
import { TASK_CONTROLL_JURNAL_SCHEMA, TASK_SCHEMA } from "../../../../Utils/schema/const";

const middlewareCaching = ({ data, primaryKey, mode, path, type = "GET", pk = null }) => (
    dispatch,
    getState,
    { firebase, getSchema, request, clientDB },
) => {
    if (mode === "jur") {
        const { requestError, status = "online" } = getState().publicReducer;
        if (status === "online") {
            if (type === "POST") {
                const validHashCopy = [{ ...data }];
                const validHash = validHashCopy
                    .map(it => getSchema(TASK_CONTROLL_JURNAL_SCHEMA, it, "no-strict"))
                    .filter(Boolean)[0];
                if (validHash)
                    firebase.db
                        .collection("jurnalWork")
                        .doc()
                        .set(validHash)
                        .then(() => {
                            clientDB.addItem("jurnalWork", validHash);
                            dispatch(сachingAction({ data: validHash, load: true, primaryKey: primaryKey }));
                        })
                        .catch(error => {});
            } else if (type === "GET") {
                firebase.db
                    .collection("jurnalWork")
                    .where("key", "==", primaryKey)
                    .get()
                    .then(querySnapshot => {
                        const { metadata: { fromCache = null } = {}, docs = [] } = querySnapshot;
                        const jurnalWork = [];

                        if (docs.length)
                            docs.forEach(doc => {
                                jurnalWork.push(doc.data());
                            });
                        if (jurnalWork.length) return jurnalWork;
                        else if (fromCache && !jurnalWork.length) throw new Error("Network error");
                        else throw new Error("Bad requst or no data");
                    })
                    .then(jurnal => {
                        const jurnalWorkCopy = jurnal
                            .map(it => getSchema(TASK_CONTROLL_JURNAL_SCHEMA, it))
                            .filter(Boolean);

                        jurnalWorkCopy.forEach(item => {
                            clientDB.updateItem("jurnalWork", item);
                        });

                        if (requestError !== null) dispatch(errorRequstAction(null));
                        dispatch(
                            сachingAction({
                                data: jurnalWorkCopy,
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
        } else {
            const jurnalWork = clientDB.getAllItems("jurnalWork");
            jurnalWork.onsuccess = event => {
                const {
                    target: { result },
                } = event;
                const jurnalWorkCopy = result.map(it => getSchema(TASK_CONTROLL_JURNAL_SCHEMA, it)).filter(Boolean);
                dispatch(сachingAction({ data: jurnalWorkCopy, load: true, path: primaryKey, mode: "offline" }));
            };
        }
    }
};

const middlewareUpdate = ({ id, type, updateProp, updateFild, item, primaryKey = null }) => (
    dispatch,
    getState,
    { firebase, getSchema, request, clientDB },
) => {
    const { status = "online" } = getState().publicReducer;
    if (status === "online") {
        if (type === "tasks")
            firebase.db
                .collection("tasks")
                .where("key", "==", id)
                .get()
                .then(querySnapshot => {
                    if (querySnapshot.docs.length)
                        querySnapshot.docs.forEach(async doc => {
                            await firebase.db
                                .collection("tasks")
                                .doc(doc.id)
                                .update({ [updateFild]: updateProp })
                                .then(() => {
                                    const updaterItem = { ...doc.data(), key: id, [updateFild]: updateProp };
                                    const tasksCopy = [updaterItem]
                                        .map(it => getSchema(TASK_SCHEMA, it, "no-strict"))
                                        .filter(Boolean);
                                    if (tasksCopy) {
                                        dispatch(
                                            updateItemStateAction({
                                                updaterItem: updaterItem,
                                                type: type,
                                                id: id,
                                            }),
                                        );
                                        clientDB.updateItem("jurnalWork", updaterItem);
                                    }
                                })
                                .catch(error => {
                                    if (error.message !== "Network error") return console.error(error.message);
                                    if (status === "offline") return;
                                    dispatch(setStatus("offline"));
                                    dispatch(errorRequstAction(error.message));
                                });
                        });
                })
                .catch(error => {
                    if (error.message !== "Network error") return console.error(error.message);
                    if (status === "offline") return;
                    dispatch(setStatus("offline"));
                    dispatch(errorRequstAction(error.message));
                });
    } else if (status === "offline") {
        const updaterItem = { ...item, key: id, [updateFild]: updateProp };
        const updater = clientDB.updateItem(type, updaterItem);
        updater.onsuccess = event => {
            const {
                target: { result },
            } = event;
            console.log(`Update item ${result} done.`);
            const tasksCopy = [updaterItem].map(it => getSchema(TASK_SCHEMA, it, "no-strict")).filter(Boolean);
            if (tasksCopy)
                dispatch(
                    updateItemStateAction({
                        updaterItem: updaterItem,
                        type: type,
                        id: id,
                        mode: "offline",
                    }),
                );
        };
    }
};

export { middlewareCaching, middlewareUpdate };
