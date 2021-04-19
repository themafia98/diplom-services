import React, { memo, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { compose } from 'redux';
import { taskModuleType } from './TaskModule.types';
import { useDispatch, useSelector } from 'react-redux';
import { Button, message } from 'antd';
import { routeParser, oneOfType } from 'Utils';
import { selectSettingsStatus } from 'Redux/selectors';
import { loadCurrentData } from 'Redux/middleware/routerReducer.thunk';
import entityRender from 'Utils/Tools/entityRender';
import withRouter from 'Components/Helpers/withRouter';
import types from 'types.modules';
import actionsTypes from 'actions.types';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import regExpRegister from 'Utils/Tools/regexpStorage';
import { withClientDb } from 'Models/ClientSideDatabase';
import actionPath from 'actions.path';
import { requestTemplate } from 'Utils/Api/api.utils';
import { ACTIONS } from 'App.constant';
import { createTab, setActiveTab } from 'Redux/reducers/routerReducer.slice';
import ModelContext from 'Models/context';
import { useTranslation } from 'react-i18next';
import _ from 'lodash';

const TaskModule = memo((props) => {
  const { path, moduleContext, type: typeProps, clientDB } = props;

  const { t } = useTranslation();
  const dispatch = useDispatch();
  const modelsContext = useContext(ModelContext);

  const [tableHeight, setTableHeight] = useState(null);
  const [heightController, setHeightController] = useState(null);
  const [statePath, setPath] = useState(null);
  const [counter, setCounter] = useState(null);
  const [isListCounterLoading, setListCounterLoading] = useState(false);
  const [isCreateTaskAvailable, setCreateTaskAvailable] = useState(false);

  const moduleTaskRef = useRef(null);
  const controllersRef = useRef(null);

  const { status, router, statusList, udata, appConfig } = useSelector((state, props) => {
    const { router, publicReducer } = state;
    const { udata, appConfig, status } = publicReducer;

    return {
      status,
      router,
      statusList: selectSettingsStatus(state, props),
      udata,
      appConfig,
    };
  });

  const { shouldUpdate = false, routeData = null, currentActionTab = '', activeTabs } = router;
  const route = routeParser({ pageType: 'moduleItem', path });
  const [namePath = '', uuid = ''] = path.split(regExpRegister.MODULE_ID);

  const shouldUpdateTasks = useCallback(() => {
    const viewId = path.split(regExpRegister.MODULE_ID)[1];

    return !!path && path.includes('task') && !viewId && !path.includes('createTask');
  }, [path]);

  const fetchTaskModule = useCallback(
    async (customOptions = null, saveData = {}, saveDataState) => {
      const { _id: uid } = udata;
      const { Request } = modelsContext;
      const { limitList = 20 } = appConfig?.task || {};

      const options = customOptions
        ? customOptions
        : {
            limitList,
            saveData,
          };

      if (isListCounterLoading) {
        return;
      }

      setListCounterLoading(true);

      try {
        const { filteredInfo = null } = saveDataState || {};

        const arrayKeys = !filteredInfo
          ? []
          : Object.keys(filteredInfo).filter(
              (key) => filteredInfo[key]?.length && (key === 'editor' || key === 'date'),
            );

        const rest = new Request();

        const res = await rest.sendRequest(
          '/tasks/listCounter',
          'POST',
          {
            ...requestTemplate,
            actionType: actionsTypes.$CURRENT_LIST_COUNTER,
            moduleName: 'taskModule',
            params: {
              path,
              filterCounter: path.includes('all') ? null : uid,
              saveData: { ...saveDataState, arrayKeys },
            },
          },
          true,
        );

        if (res.status !== 200) {
          throw new Error('Bad tasks list');
        }

        const { response, actions = [] } = res.data || {};
        const { metadata = 0 } = response || {};

        const createTaskAvailable = actions.some((it) => it === ACTIONS.CREATE);

        if (counter !== metadata) {
          setCounter(metadata);
        }

        if (createTaskAvailable !== isCreateTaskAvailable) {
          setCreateTaskAvailable(createTaskAvailable);
        }
      } catch (error) {
        const { response = {} } = error || {};
        const { actions = [] } = response?.data || {};

        const createTaskAvailable = Array.isArray(actions) && actions.some((it) => it === ACTIONS.CREATE);

        setCounter(1);
        setCreateTaskAvailable(createTaskAvailable);
      } finally {
        setListCounterLoading(false);

        dispatch(
          loadCurrentData({
            action: actionPath.$LOAD_TASKS_LIST,
            path,
            options: {
              ...options,
              filterCounter: path.includes('taskModule_all') ? null : uid,
            },
            clientDB,
          }),
        );
      }
    },
    [
      appConfig?.task,
      clientDB,
      counter,
      dispatch,
      isCreateTaskAvailable,
      isListCounterLoading,
      modelsContext,
      path,
      udata,
    ],
  );

  const recalcHeight = useCallback(() => {
    const isExists = controllersRef.current || !moduleTaskRef.current;

    if (currentActionTab !== path || !isExists || !moduleTaskRef.current) {
      return;
    }

    const heightControllerForState = controllersRef.current?.getBoundingClientRect().height || null;
    const heightForState = moduleTaskRef.current.getBoundingClientRect().height;

    if (tableHeight !== heightForState || heightControllerForState !== heightController) {
      const newHeight =
        window.innerHeight - 10 > heightForState ? heightForState - 250 : window.innerHeight - 250;

      if (newHeight !== tableHeight) {
        setTableHeight(newHeight);
      }

      if (heightControllerForState !== heightController) {
        setHeightController(heightControllerForState);
      }
    }
  }, [currentActionTab, heightController, path, tableHeight]);

  const handlerNewTask = useCallback(
    (event) => {
      const { tabsLimit = 50 } = appConfig;

      if (currentActionTab !== 'taskModule_createTask') {
        if (tabsLimit <= activeTabs.length) {
          message.error(`${t('globalMessages_maxTabs')} ${tabsLimit}`);
          return;
        }

        const path = 'taskModule_createTask';
        const isFind = activeTabs.findIndex((tab) => tab === path) !== -1;

        const config = { hardCodeUpdate: false };
        if (!isFind) {
          dispatch(createTab({ tab: routeParser({ path }), config }));
          return;
        }

        if (currentActionTab !== path) {
          dispatch(setActiveTab({ tab: path, config }));
        }
      }
    },
    [activeTabs, appConfig, currentActionTab, dispatch, t],
  );

  const checkBackground = useCallback(
    (path, visible, mode = 'default') => {
      if (mode === 'default') {
        return !visible && activeTabs.some((actionTab) => actionTab === path);
      }
      return false;
    },
    [activeTabs],
  );

  const debounceFetchTaskModule = useMemo(() => _.debounce(fetchTaskModule, 400), [fetchTaskModule]);

  useEffect(() => {
    if (path !== statePath && path.toLowerCase().includes('task')) {
      setPath(path);
    }
  }, [path, statePath]);

  useEffect(() => {
    const { visibility = false } = moduleContext;

    if (!visibility) {
      return;
    }

    if (tableHeight === null && moduleTaskRef.current) {
      recalcHeight();
    }
  }, [appConfig?.task, moduleContext, path, recalcHeight, statePath, tableHeight]);

  useEffect(() => {
    window.addEventListener('resize', recalcHeight, false);

    return () => {
      window.removeEventListener('resize', recalcHeight, false);
    };
  }, [recalcHeight]);

  useEffect(() => {
    const { visibility = false } = moduleContext;
    const { limitList = 20 } = appConfig?.task || {};

    if (!visibility) {
      return;
    }

    const shouldUpdateList = routeData[path] && routeData[path]?.shouldUpdate;
    const isUnloadModule = shouldUpdate && !routeData[path]?.load;

    const { loading = false } = routeData[path] || {};

    const isCloseTabAction = !isUnloadModule && !shouldUpdateList && shouldUpdate && !loading;

    if (!isListCounterLoading && (isUnloadModule || shouldUpdateList || isCloseTabAction)) {
      const { saveData: saveDataState = null } = routeData[path] || {};

      const saveData = saveDataState
        ? saveDataState
        : {
            current: 1,
            pageSize: limitList,
          };

      if (shouldUpdateTasks()) {
        debounceFetchTaskModule(null, saveData, saveDataState);
      }
    }
  }, [
    appConfig?.task,
    debounceFetchTaskModule,
    isListCounterLoading,
    moduleContext,
    path,
    recalcHeight,
    routeData,
    shouldUpdate,
    shouldUpdateTasks,
    tableHeight,
  ]);

  const subTabs = useMemo(() => {
    const { rest } = modelsContext;

    const subTabProps = {
      currentActionTab,
      rest,
      statusApp: status,
      counter,
      loading: router?.routeData[path] && router?.routeData[path]?.loading,
      height: heightController ? tableHeight - heightController : tableHeight,
      data: router?.routeData[path],
      uuid,
      namePath,
      route,
      statusList,
      router,
    };

    const config = {
      validation: checkBackground,
      path,
      viewModuleName: 'taskViewModule',
      moduleName: 'taskModule',
      parentType: typeProps,
      type: oneOfType(types.$sub_entrypoint_module, types.$entity_entrypoint),
    };

    return entityRender(
      activeTabs.filter((tab) => entitysList.some((entity) => tab.includes(entity))),
      subTabProps,
      config,
    );
  }, [
    activeTabs,
    checkBackground,
    counter,
    currentActionTab,
    heightController,
    modelsContext,
    namePath,
    path,
    route,
    router,
    status,
    statusList,
    tableHeight,
    typeProps,
    uuid,
  ]);

  const type = useMemo(() => {
    if (uuid) {
      return types.$entity_entrypoint;
    }

    return typeProps;
  }, [uuid, typeProps]);

  return (
    <div key="taskModule" ref={moduleTaskRef} className="taskModule">
      {!path ? (
        <div>Not found path module</div>
      ) : (
        <>
          {oneOfType(types.$sub_entrypoint_module, types.$entrypoint_module)(type) &&
          (path?.includes('all') || path?.includes('myTasks')) ? (
            <div key="controllers" ref={controllersRef} className="controllersWrapper">
              <Button
                disabled={!isCreateTaskAvailable}
                className="newTaskButton"
                onClick={handlerNewTask}
                type="primary"
              >
                {t('taskModule_createNewTaskButton')}
              </Button>
            </div>
          ) : null}
          {subTabs}
        </>
      )}
    </div>
  );
});

TaskModule.propTypes = taskModuleType;

export { TaskModule };
export default compose(withRouter, moduleContextToProps, withClientDb)(TaskModule);
