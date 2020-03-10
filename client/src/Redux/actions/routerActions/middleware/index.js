import _ from "lodash";
import { USER_SCHEMA, TASK_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from "../../../../Models/Schema/const";
import { saveComponentStateAction, loadFlagAction } from "../";
import { errorRequstAction, setStatus } from "../../publicActions";

export const loadCurrentData = ({
    path = "",
    startPath = "",
    storeLoad = "",
    useStore = false,
    methodRequst = "POST",
    methodQuery = "all",
    xhrPath = "list",
    noCorsClient = false
}) => async (dispatch, getState, { schema, Request, clientDB }) => {
    const primaryKey = "uuid";
    const pathValid = path.includes("_") ? path.split("_")[0] : path.split("__")[0];
    const router = getState().router;

    const { requestError, status = "online" } = getState().publicReducer;

    if (router.routeData && router.routeData[pathValid] && router.routeData[pathValid].load) {
        dispatch(loadFlagAction({ path: pathValid, load: false }));
    }
    if (status === "online") {
        const normalizeReqPath = useStore
            ? `/${startPath}/${storeLoad}/${xhrPath}`.trim().replace("//", "/")
            : `/${startPath}/${xhrPath}`.trim().replace("//", "/");

        try {
            const request = new Request();
            const res = await request.sendRequest(normalizeReqPath, methodRequst, { methodQuery }, true);

            const { data: { response: { metadata = [], fromCache = false } = {} } = {} } = res || {};
            let items = [];

            metadata.forEach((doc, index) => _.isNumber(index) && items.push(doc));

            if (items.length) items = items.filter(it => !_.isEmpty(it));
            else if (fromCache && !items.length) throw new Error("Network error");

            const copyStore = [...items];
            const undefiendCopyStore = [];

            if (noCorsClient && _.isNull(requestError)) {
                dispatch(saveComponentStateAction({ [storeLoad]: copyStore, load: true, path: pathValid }));
            }

            if (!_.isNull(requestError)) dispatch(errorRequstAction(null));

            if (storeLoad === "news") {
                const data = { [storeLoad]: copyStore, load: true, path: pathValid };
                await dispatch(saveComponentStateAction(data));
            } else {
                const cursor = clientDB.getCursor(storeLoad);

                cursor.onsuccess = async event => {
                    const { target: { result: cursor } = {} } = event;

                    if (!cursor) return await next(true);

                    const index = copyStore.findIndex(it => {
                        const isKey = it[primaryKey] || it["key"];
                        const isValid = it[primaryKey] === cursor.key || it["key"] === cursor.key;

                        return isKey && isValid;
                    });
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
            }

            const next = async (flag = false) => {
                const templateSchema =
                    storeLoad === "jurnalworks"
                        ? TASK_CONTROLL_JURNAL_SCHEMA
                        : storeLoad === "users"
                            ? USER_SCHEMA
                            : storeLoad === "tasks"
                                ? TASK_SCHEMA
                                : null;

                let storeCopyValid = copyStore.map(it => schema.getSchema(templateSchema, it)).filter(Boolean);
                storeCopyValid.forEach(it => clientDB.updateItem(storeLoad, it));

                if (requestError !== null) await dispatch(errorRequstAction(null));

                const data = { [storeLoad]: copyStore, load: true, path: pathValid };
                await dispatch(saveComponentStateAction(data));
            };
        } catch (error) {
            console.error(error);
            if (error.status === 400) {
                const errorRequest = new Request();
                dispatch(setStatus({ statusRequst: "offline" }));
                dispatch(errorRequstAction(error.message));
                errorRequest.follow(
                    "offline",
                    statusRequst => {
                        if (getState().publicReducer.status !== statusRequst && statusRequst === "online") {
                            errorRequest.unfollow();

                            dispatch(setStatus({ statusRequst }));
                            dispatch(errorRequstAction(null));
                            dispatch(loadCurrentData({ path, storeLoad }));
                        }
                    },
                    3000
                );
            } else dispatch(errorRequstAction(error.message));
        }
    } else {
        if (!noCorsClient) return;

        const items = clientDB.getAllItems(storeLoad);
        items.onsuccess = event => {
            const {
                target: { result }
            } = event;
            const schemaTemplate =
                storeLoad === "jurnalworks"
                    ? TASK_CONTROLL_JURNAL_SCHEMA
                    : storeLoad === "users"
                        ? USER_SCHEMA
                        : storeLoad === "tasks"
                            ? TASK_SCHEMA
                            : null;

            const itemsCopy = result.map(it => schema.getSchema(schemaTemplate, it)).filter(Boolean);
            const data = saveComponentStateAction({
                [storeLoad]: itemsCopy,
                load: true,
                path: pathValid,
                mode: "offline"
            });
            dispatch(data);
        };
    }
};
