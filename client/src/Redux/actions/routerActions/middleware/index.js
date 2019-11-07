import _ from "lodash";
import { USER_SCHEMA, TASK_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from "../../../../Utils/schema/const";
import { saveComponentStateAction, loadFlagAction } from "../";
import { errorRequstAction, setStatus } from "../../publicActions";

export const loadCurrentData = ({
    path = "",
    primaryKey = "uuid",
    storeLoad = "",
    pathValidStart = "_",
    pathValid = path.startsWith(pathValidStart) ? pathValidStart.split("_")[0] || "" : path.split("__")[0],
}) => (dispatch, getState, { firebase, getSchema, request, clientDB }) => {
    const router = getState().router;
    const { requestError, status = "online" } = getState().publicReducer;
    if (router.routeData && router.routeData[pathValid] && router.routeData[pathValid].load)
        dispatch(loadFlagAction({ path: pathValid, load: false }));
    if (status === "online") {
        firebase.db
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
                        target: { result: cursor },
                    } = event;
                    if (!cursor) return await next(true);

                    if (
                        copyStore &&
                        copyStore.findIndex(it => (it[primaryKey] || it["key"]) && it[primaryKey] === cursor.key) === -1
                    ) {
                        if (cursor.value.modeAdd === "offline") {
                            copyStore.push({ ...cursor.value });
                            undefiendCopyStore.push({ ...cursor.value });
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

                    const onAction = () => {
                        if (requestError !== null) dispatch(errorRequstAction(null));

                        dispatch(
                            saveComponentStateAction({ [storeLoad]: storeCopyValid, load: true, path: pathValid }),
                        );
                    };

                    if (flag && undefiendCopyStore.length) {
                        const items = firebase.db.collection(storeLoad);
                        const batch = firebase.db.batch();
                        undefiendCopyStore.forEach(it => {
                            const itRef = items.doc();
                            batch.set(itRef, it);
                        });
                        await batch.commit();
                        onAction();
                    } else onAction();
                };
            })
            .catch(error => {
                dispatch(setStatus("offline"));
                dispatch(errorRequstAction(error.message));
                request.follow(
                    "offline",
                    statusRequst => {
                        if (getState().publicReducer.status !== statusRequst && statusRequst === "online") {
                            request.unfollow();
                            dispatch(setStatus(statusRequst));
                            dispatch(errorRequstAction(null));
                            dispatch(loadCurrentData({ path }));
                        }
                    },
                    3000,
                );
            });
    } else {
        const items = clientDB.getAllItems(storeLoad);
        items.onsuccess = event => {
            const {
                target: { result },
            } = event;
            const itemsCopy = result.map(it => getSchema(USER_SCHEMA, it)).filter(Boolean);
            dispatch(
                saveComponentStateAction({ [pathValid]: itemsCopy, load: true, path: pathValid, mode: "offline" }),
            );
        };
    }
};
