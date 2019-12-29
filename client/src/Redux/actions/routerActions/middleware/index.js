import _ from "lodash";
import { USER_SCHEMA, TASK_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from "../../../../Utils/schema/const";
import { saveComponentStateAction, loadFlagAction } from "../";
import { errorRequstAction, setStatus } from "../../publicActions";

export const loadCurrentData = ({
    path = "",
    primaryKey = "uuid",
    typeReq = "",
    storeLoad = "",
    useStore = false,
    methodRequst = "POST",
    methodQuery = "all",
    xhrPath = "/list",
    pathValidStart = "_",
    noCorsClient = false,
    pathValid = path.startsWith(pathValidStart) ? pathValidStart.split("_")[0] || "" : path.split("__")[0]
}) => async (dispatch, getState, { getSchema, request, clientDB }) => {
    const router = getState().router;

    const { requestError, status = "online" } = getState().publicReducer;

    if (router.routeData && router.routeData[pathValid] && router.routeData[pathValid].load) {
        dispatch(loadFlagAction({ path: pathValid, load: false }));
    }
    if (status === "online") {
        const normalizeReqPath = useStore
            ? `/${typeReq}/${storeLoad}${xhrPath}`.trim().replace("//", "/")
            : `/${typeReq}${xhrPath}`.trim().replace("//", "/");
        await request
            .sendRequest(normalizeReqPath, methodRequst, { methodQuery }, true)
            .then(response => {
                const method = response.config && response.config.method ? response.config.method.toUpperCase() : "GET";
                const { data: { response: { [method]: { metadata = [], fromCache = false } } = {} } = {} } = response;
                const storeArray = [];
                metadata.forEach((doc, index) => {
                    if (_.isNumber(index)) storeArray.push(doc);
                });

                if (storeArray.length) return storeArray.filter(it => !_.isEmpty(it));
                else if (fromCache && !storeArray.length) throw new Error("Network error");
            })
            .then(items => {
                const copyStore = [...items];
                const undefiendCopyStore = [];

                if (noCorsClient) {
                    if (requestError !== null) dispatch(errorRequstAction(null));
                    return dispatch(saveComponentStateAction({ [storeLoad]: copyStore, load: true, path: pathValid }));
                }
                // const cursor = clientDB.getCursor(storeLoad);

                dispatch(saveComponentStateAction({ [storeLoad]: copyStore, load: true, path: pathValid }));
                // cursor.onsuccess = async event => {
                //     const {
                //         target: { result: cursor }
                //     } = event;
                //     if (!cursor) return await next(true);

                // const index = copyStore.findIndex(
                //     it =>
                //         (it[primaryKey] || it["key"]) && (it[primaryKey] === cursor.key || it["key"] === cursor.key)
                // );
                // const iEmpty = index === -1;
                // if (copyStore && iEmpty) {
                //     if (cursor.value.modeAdd === "offline") {
                //         const copy = { ...cursor.value, modeAdd: "online" };
                //         cursor.value.modeAdd = "online";
                //         undefiendCopyStore.push({ ...copy });
                //     }
                // }
                // cursor.continue();
                //});

                const next = async (flag = false) => {
                    // const schema =
                    //     storeLoad === "jurnalWork"
                    //         ? TASK_CONTROLL_JURNAL_SCHEMA
                    //         : storeLoad === "users"
                    //         ? USER_SCHEMA
                    //         : storeLoad === "tasks"
                    //         ? TASK_SCHEMA
                    //         : null;

                    // let storeCopyValid = copyStore.map(it => getSchema(schema, it)).filter(Boolean);

                    // storeCopyValid.forEach(it => {
                    //     clientDB.updateItem(storeLoad, it);
                    // });

                    const onAction = async () => {
                        if (requestError !== null) await dispatch(errorRequstAction(null));

                        await dispatch(
                            saveComponentStateAction({ [storeLoad]: copyStore, load: true, path: pathValid })
                        );
                    };

                    if (flag && undefiendCopyStore.length) {
                        //if (firebase) {
                        // const items = firebase.db.collection(storeLoad);
                        //  const batch = firebase.db.batch();
                        // _.uniqBy(undefiendCopyStore, "key" || "uuid").forEach(it => {
                        //     const itRef = items.doc();
                        //     batch.set(itRef, it);
                        // });
                        // await batch.commit();
                        // }
                        // await onAction();
                        await onAction();
                    } else await onAction();
                };
            })
            .catch(error => {
                if (error.status !== 404) {
                    dispatch(setStatus({ statusRequst: "offline" }));
                    dispatch(errorRequstAction(error.message));
                    request.follow(
                        "offline",
                        statusRequst => {
                            if (getState().publicReducer.status !== statusRequst && statusRequst === "online") {
                                request.unfollow();

                                dispatch(setStatus({ statusRequst }));
                                dispatch(errorRequstAction(null));
                                dispatch(loadCurrentData({ path, storeLoad }));
                            }
                        },
                        3000
                    );
                }
            });
    } else {
        if (!noCorsClient) return;

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
