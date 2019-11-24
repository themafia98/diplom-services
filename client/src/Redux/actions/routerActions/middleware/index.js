import _ from "lodash";
import { USER_SCHEMA, TASK_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from "../../../../Utils/schema/const";
import { saveComponentStateAction, loadFlagAction } from "../";
import { errorRequstAction, setStatus } from "../../publicActions";

export const loadCurrentData = ({
    path = "",
    primaryKey = "uuid",
    storeLoad = "",
    pathValidStart = "_",
    shouldUpdate = false,
    pathValid = path.startsWith(pathValidStart) ? pathValidStart.split("_")[0] || "" : path.split("__")[0]
}) => async (dispatch, getState, { firebase, getSchema, request, clientDB }) => {
    const router = getState().router;
    const { requestError, status = "online" } = getState().publicReducer;

    if (router.routeData && router.routeData[pathValid] && router.routeData[pathValid].load) {
        dispatch(loadFlagAction({ path: pathValid, load: false }));
    }
    if (status === "online") {
        await firebase.db
            .collection(storeLoad)
            .get()
            .then(querySnapshot => {
                const { metadata: { fromCache = null } = {} } = querySnapshot;
                const storeArray = [];
                querySnapshot.forEach(doc => {
                    storeArray.push(doc.data());
                });

                if (storeArray.length) return storeArray.filter(it => !_.isEmpty(it));
                else if (fromCache && !storeArray.length) throw new Error("Network error");
                else throw new Error("Bad requst or no data");
            })
            .then(items => {
                const copyStore = [...items];
                const undefiendCopyStore = [];
                const cursor = clientDB.getCursor(storeLoad);

                cursor.onsuccess = async event => {
                    const {
                        target: { result: cursor }
                    } = event;
                    if (!cursor) return await next(true);

                    const index = copyStore.findIndex(
                        it =>
                            (it[primaryKey] || it["key"]) && (it[primaryKey] === cursor.key || it["key"] === cursor.key)
                    );
                    const iEmpty = index === -1;
                    if (copyStore && iEmpty) {
                        if (cursor.value.modeAdd === "offline") {
                            const copy = { ...cursor.value, modeAdd: "online" };
                            cursor.value.modeAdd = "online";
                            undefiendCopyStore.push({ ...copy });
                        }
                    }
                    cursor.continue();
                };

                const next = async (flag = false) => {
                    const schema =
                        storeLoad === "jurnalWork"
                            ? TASK_CONTROLL_JURNAL_SCHEMA
                            : storeLoad === "users"
                            ? USER_SCHEMA
                            : storeLoad === "tasks"
                            ? TASK_SCHEMA
                            : null;

                    let storeCopyValid = copyStore.map(it => getSchema(schema, it)).filter(Boolean);

                    storeCopyValid.forEach(it => {
                        clientDB.updateItem(storeLoad, it);
                    });

                    const onAction = async () => {
                        if (requestError !== null) await dispatch(errorRequstAction(null));

                        await dispatch(
                            saveComponentStateAction({ [storeLoad]: storeCopyValid, load: true, path: pathValid })
                        );
                    };

                    if (flag && undefiendCopyStore.length) {
                        const items = firebase.db.collection(storeLoad);
                        const batch = firebase.db.batch();
                        _.uniqBy(undefiendCopyStore, "key" || "uuid").forEach(it => {
                            const itRef = items.doc();
                            batch.set(itRef, it);
                        });
                        await batch.commit();
                        await onAction();
                    } else await onAction();
                };
            })
            .catch(error => {
                dispatch(setStatus({ statusRequst: "offline" }));
                dispatch(errorRequstAction(error.message));
                request.follow(
                    "offline",
                    statusRequst => {
                        debugger;
                        if (getState().publicReducer.status !== statusRequst && statusRequst === "online") {
                            request.unfollow();
                            debugger;
                            dispatch(setStatus({ statusRequst }));
                            dispatch(errorRequstAction(null));
                            dispatch(loadCurrentData({ path, storeLoad }));
                        }
                    },
                    3000
                );
            });
    } else {
        const items = clientDB.getAllItems(storeLoad);
        items.onsuccess = event => {
            const {
                target: { result }
            } = event;
            const schema =
                storeLoad === "jurnalWork"
                    ? TASK_CONTROLL_JURNAL_SCHEMA
                    : storeLoad === "users"
                    ? USER_SCHEMA
                    : storeLoad === "tasks"
                    ? TASK_SCHEMA
                    : null;

            const itemsCopy = result.map(it => getSchema(schema, it)).filter(Boolean);
            dispatch(
                saveComponentStateAction({ [storeLoad]: itemsCopy, load: true, path: pathValid, mode: "offline" })
            );
        };
    }
};
