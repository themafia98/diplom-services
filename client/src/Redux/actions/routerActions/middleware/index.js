import _ from 'lodash';
import moment from 'moment';
import { USER_SCHEMA, TASK_SCHEMA, TASK_CONTROLL_JURNAL_SCHEMA } from '../../../../Models/Schema/const';
import { dataParser } from '../../../../Utils';
import { saveComponentStateAction, loadFlagAction } from '../';
import { errorRequstAction, setStatus } from '../../publicActions';

const loadCurrentData = params => async (dispatch, getState, { schema, Request, clientDB }) => {
  const {
    path = '',
    startPath = '',
    storeLoad = '',
    useStore = false,
    methodRequst = 'POST',
    methodQuery = 'get_all',
    xhrPath = 'list',
    noCorsClient = false,
    sortBy = '',
    options = {},
  } = params;

  let isLocalUpdate = true;
  const primaryKey = 'uuid';
  const pathValid = path.includes('_') ? path.split('_')[0] : path.split('__')[0];
  const router = getState().router;

  const { requestError, status = 'online' } = getState().publicReducer;
  const isExist = router.routeData && router.routeData[pathValid];

  if (isExist && !router.routeData[pathValid].load) {
    dispatch(loadFlagAction({ path: pathValid, load: true }));
  }
  if (status === 'online') {
    const normalizeReqPath = useStore
      ? `/${startPath}/${storeLoad}/${xhrPath}`.trim().replace('//', '/')
      : `/${startPath}/${xhrPath}`.trim().replace('//', '/');

    try {
      const request = new Request();
      const res = await request.sendRequest(normalizeReqPath, methodRequst, { methodQuery, options }, true);

      const {
        data: { response: { metadata = [], params: { isPartData = false, fromCache = false } = {} } = {} },
      } = res || {};

      let items = [];

      metadata.forEach((doc, index) => _.isNumber(index) && items.push(doc));

      if (items.length) items = items.filter(it => !_.isEmpty(it));
      else if (fromCache && !items.length) throw new Error('Network error');

      const copyStore = [...items];
      const undefiendCopyStore = [];

      if (noCorsClient && _.isNull(requestError)) {
        const sortedCopyStore =
          !sortBy && copyStore.every(it => it.createdAt)
            ? copyStore.sort((a, b) => {
                const aDate = moment(a.createdAt).unix();
                const bDate = moment(b.createdAt).unix();
                return bDate - aDate;
              })
            : sortBy
            ? copyStore.sort((a, b) => a[sortBy] - b[sortBy])
            : copyStore;

        dispatch(
          saveComponentStateAction({ [storeLoad]: sortedCopyStore, load: true, path: pathValid, isPartData }),
        );
      }

      if (!_.isNull(requestError)) dispatch(errorRequstAction(null));

      if (storeLoad === 'news') {
        const data = { [storeLoad]: copyStore, load: true, path: pathValid, isPartData };
        await dispatch(saveComponentStateAction(data));
      } else {
        const cursor = clientDB.getCursor(storeLoad);
        isLocalUpdate = !_.isNull(cursor);

        if (cursor) {
          cursor.onsuccess = async event => {
            const dep = {
              copyStore,
              isPartData,
              storeLoad,
              methodQuery,
              schema,
              clientDB,
              sortBy,
              pathValid,
              requestError,
            };
            // @ts-ignore
            const { target: { result: cursor } = {} } = event;

            if (!cursor) {
              const { data, shoudClearError = false } = dataParser(true, true, dep);
              if (shoudClearError) await dispatch(errorRequstAction(null));
              await dispatch(saveComponentStateAction(data));
              return;
            }

            const index = copyStore.findIndex(it => {
              const isKey = it[primaryKey] || it['key'];
              const isValid = it[primaryKey] === cursor.key || it['key'] === cursor.key;

              return isKey && isValid;
            });
            const iEmpty = index === -1;
            if (copyStore && iEmpty) {
              if (cursor.value.modeAdd === 'offline') {
                const copy = { ...cursor.value, modeAdd: 'online' };
                cursor.value.modeAdd = 'online';
                undefiendCopyStore.push({ ...copy });
              }
            }
            cursor.continue();
          };
        }
      }

      if (!isLocalUpdate) {
        const dep = {
          copyStore,
          isPartData,
          storeLoad,
          methodQuery,
          schema,
          clientDB,
          sortBy,
          pathValid,
          requestError,
        };

        // @ts-ignore
        const { data, shoudClearError = false } = dataParser(true, false, dep);
        if (shoudClearError) await dispatch(errorRequstAction(null));
        await dispatch(saveComponentStateAction(data));
      }
    } catch (error) {
      console.error(error);
      if (error.status === 400) {
        const errorRequest = new Request();
        dispatch(setStatus({ statusRequst: 'offline' }));
        dispatch(errorRequstAction(error.message));
        errorRequest.follow(
          'offline',
          statusRequst => {
            if (getState().publicReducer.status !== statusRequst && statusRequst === 'online') {
              errorRequest.unfollow();

              dispatch(setStatus({ statusRequst }));
              dispatch(errorRequstAction(null));
              dispatch(loadCurrentData({ path, storeLoad }));
            }
          },
          3000,
        );
      } else dispatch(errorRequstAction(error.message));
    }
  } else {
    if (!noCorsClient) return;

    const items = clientDB.getAllItems(storeLoad);
    items.onsuccess = event => {
      const {
        target: { result },
      } = event;
      const schemaTemplate =
        storeLoad === 'jurnalworks'
          ? TASK_CONTROLL_JURNAL_SCHEMA
          : storeLoad === 'users'
          ? USER_SCHEMA
          : storeLoad === 'tasks'
          ? TASK_SCHEMA
          : null;

      const itemsCopy = result.map(it => schema.getSchema(schemaTemplate, it)).filter(Boolean);
      const data = saveComponentStateAction({
        [storeLoad]: itemsCopy,
        load: true,
        path: pathValid,
        mode: 'offline',
      });
      dispatch(data);
    };
  }
};

const onMultipleLoadData = params => async (dispatch, getState, { schema, Request, clientDB }) => {
  const { requestsParamsList = [] } = params;

  const router = getState().router;
  const primaryKey = 'uuid';
  const { requestError, status = 'online' } = getState().publicReducer;
  const responseList = [];

  if (status === 'online') {
    for await (let requestParam of requestsParamsList) {
      const {
        useStore = false,
        storeLoad = '',
        startPath = '',
        xhrPath = '',
        methodRequst = 'POST',
        methodQuery = 'get_all',
        options = {},
        noCorsClient = false,
        sortBy = '',
        path = '',
      } = requestParam;
      let isLocalUpdate = true;
      const pathValid = path.includes('_') ? path.split('_')[0] : path.split('__')[0];
      const normalizeReqPath = useStore
        ? `/${startPath}/${storeLoad}/${xhrPath}`.trim().replace('//', '/')
        : `/${startPath}/${xhrPath}`.trim().replace('//', '/');

      try {
        const request = new Request();
        const res = await request.sendRequest(normalizeReqPath, methodRequst, { methodQuery, options }, true);

        const {
          data: { response: { metadata = [], params: { isPartData = false, fromCache = false } = {} } = {} },
        } = res || {};

        let items = [];

        metadata.forEach((doc, index) => _.isNumber(index) && items.push(doc));

        if (items.length) items = items.filter(it => !_.isEmpty(it));
        else if (fromCache && !items.length) throw new Error('Network error');

        const copyStore = [...items];
        const undefiendCopyStore = [];

        if (noCorsClient && _.isNull(requestError)) {
          const sortedCopyStore =
            !sortBy && copyStore.every(it => it.createdAt)
              ? copyStore.sort((a, b) => {
                  const aDate = moment(a.createdAt).unix();
                  const bDate = moment(b.createdAt).unix();
                  return bDate - aDate;
                })
              : sortBy
              ? copyStore.sort((a, b) => a[sortBy] - b[sortBy])
              : copyStore;

          responseList.push({ [storeLoad]: sortedCopyStore, load: true, path: pathValid, isPartData });
          continue;
        }

        if (!_.isNull(requestError)) await dispatch(errorRequstAction(null));

        if (storeLoad === 'news') {
          const data = { [storeLoad]: copyStore, load: true, path: pathValid, isPartData };
          await dispatch(saveComponentStateAction(data));
        } else {
          const cursor = clientDB.getCursor(storeLoad);
          isLocalUpdate = !_.isNull(cursor);

          if (cursor) {
            cursor.onsuccess = async event => {
              // @ts-ignore
              const { target: { result: cursor } = {} } = event;

              if (!cursor) {
                const dep = {
                  copyStore,
                  isPartData,
                  storeLoad,
                  methodQuery,
                  schema,
                  clientDB,
                  sortBy,
                  pathValid,
                  requestError,
                };
                const { data, shoudClearError = false } = dataParser(true, true, dep);
                if (shoudClearError) await dispatch(errorRequstAction(null));
                return await dispatch(saveComponentStateAction(data));
              }

              const index = copyStore.findIndex(it => {
                const isKey = it[primaryKey] || it['key'];
                const isValid = it[primaryKey] === cursor.key || it['key'] === cursor.key;

                return isKey && isValid;
              });
              const iEmpty = index === -1;
              if (copyStore && iEmpty) {
                if (cursor.value.modeAdd === 'offline') {
                  const copy = { ...cursor.value, modeAdd: 'online' };
                  cursor.value.modeAdd = 'online';
                  undefiendCopyStore.push({ ...copy });
                }
              }
              cursor.continue();
            };
          }
        }
      } catch (error) {
        console.error(error);
        dispatch(errorRequstAction(error.message));
        break;
      }
    }
  } else {
  }
};

export { loadCurrentData, onMultipleLoadData };
