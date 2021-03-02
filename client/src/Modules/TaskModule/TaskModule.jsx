import React, { Component } from 'react';
import _ from 'lodash';
import { compose } from 'redux';
import { taskModuleType } from './TaskModule.types';
import { connect } from 'react-redux';
import { Button, message } from 'antd';
import { routeParser, oneOfType } from 'Utils';
import { settingsStatusSelector } from 'Redux/selectors';
import {
  addTabAction,
  openPageWithDataAction,
  removeTabAction,
  setActiveTabAction,
} from 'Redux/actions/routerActions';
import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import { loadCacheData } from 'Redux/actions/publicActions/middleware';
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

class TaskModule extends Component {
  state = {
    height: null,
    heightController: null,
    path: null,
    counter: null,
    createTaskAvailable: false,
  };

  static propTypes = taskModuleType;

  static getDerivedStateFromProps = (props, state) => {
    if (props.path && props.path !== state.path && props.path.toLowerCase().includes('task')) {
      return {
        ...state,
        path: props.path,
      };
    }

    return state;
  };

  shouldComponentUpdate = (prevProps) => {
    const { path = '' } = this.state;
    const { path: pathProps } = this.props;

    return path === pathProps && !_.isEqual(this.props, prevProps);
  };

  componentDidMount = () => {
    const { path = '', appConfig, moduleContext } = this.props;
    const { visibility = false } = moduleContext;
    const { task: { limitList = 20 } = {} } = appConfig;
    const { height } = this.state;

    const isTaskModule = path && path.includes('task') && !path.split(regExpRegister.MODULE_ID)[1];
    if (height === null && this.moduleTask !== null && visibility) {
      this.recalcHeight();
    }

    if (isTaskModule) {
      const saveData = {
        current: 1,
        pageSize: limitList,
      };
      this.fetchTaskModule(null, {
        ...saveData,
        paginationState: saveData,
      });
    }

    this.setState({
      ...this.state,
      path,
    });

    window.addEventListener('resize', this.recalcHeight, false);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.recalcHeight, false);
  };

  componentDidUpdate = () => {
    const { router, path = '', moduleContext, appConfig } = this.props;
    const { shouldUpdate = false, routeData = {} } = router;

    const { visibility = false } = moduleContext;
    const { isListCounterLoading = false, height } = this.state;
    const { task: { limitList = 20 } = {} } = appConfig;

    if (!visibility) return;

    const shouldBeInit = height === null && this.moduleTask !== null && visibility;
    if (shouldBeInit || [this.moduleTask, this.controller].every((type) => type !== null)) {
      this.recalcHeight();
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

      this.shouldUpdateTasks() && this.fetchTaskModule(null, saveData, saveDataState);
    }
  };

  shouldUpdateTasks = () => {
    const { path = '' } = this.props;
    const viewId = path.split(regExpRegister.MODULE_ID)[1];
    return !!path && path.includes('task') && !viewId && !path.includes('createTask');
  };

  fetchTaskModule = async (customOptions = null, saveData = {}, saveDataState) => {
    const {
      onLoadCurrentData,
      path,
      udata: { _id: uid = '' } = {},
      modelsContext,
      clientDB,
      appConfig,
    } = this.props;
    const { counter = null, isListCounterLoading } = this.state;
    const { Request } = modelsContext;
    const { task: { limitList = 20 } = {} } = appConfig || {};

    const options = customOptions
      ? customOptions
      : {
          limitList,
          saveData,
        };

    if (!Request || isListCounterLoading) return;

    this.setState(
      {
        ...this.state,
        isListCounterLoading: true,
      },
      async () => {
        try {
          const { filteredInfo = null } = saveDataState || {};
          const arrayKeys = !filteredInfo
            ? []
            : Object.keys(filteredInfo).filter(
                (key) => filteredInfo[key]?.length && (key === 'editor' || key === 'date'),
              );
          if (!Request) return;
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
          if (res.status !== 200) throw new Error('Bad list');
          const { data: { response: { metadata = 0 } = {}, actions = [] } = {} } = res || {};

          const createTaskAvailable = actions.some((it) => it === ACTIONS.CREATE);

          if (counter !== metadata)
            this.setState({
              ...this.state,
              counter: metadata,
              createTaskAvailable,
            });
        } catch (error) {
          const { response = {} } = error || {};
          const { actions = [] } = response?.data || {};
          const createTaskAvailable = actions.some((it) => it === ACTIONS.CREATE);

          this.setState({ counter: 1, createTaskAvailable });
        }

        await onLoadCurrentData({
          action: actionPath.$LOAD_TASKS_LIST,
          path,
          options: {
            ...options,
            filterCounter: path.includes('taskModule_all') ? null : uid,
          },
          clientDB,
        });

        this.setState({
          ...this.state,
          isListCounterLoading: false,
        });
      },
    );
  };

  recalcHeight = () => {
    const { height, heightController, path = '' } = this.state;
    const { router: { currentActionTab = '' } = {} } = this.props;

    const isExists = this.controller?.current || !this.moduleTask?.current;

    if (currentActionTab !== path || !isExists || !this.moduleTask) {
      return;
    }

    const heightControllerForState = this.controller ? this.controller.getBoundingClientRect().height : null;
    const heightForState = this.moduleTask.getBoundingClientRect().height;

    if (height !== heightForState || heightControllerForState !== heightController)
      this.setState({
        ...this.state,
        height: window.innerHeight - 10 > heightForState ? heightForState - 250 : window.innerHeight - 250,
        heightController: heightControllerForState,
      });
  };

  moduleTask = null;
  controller = null;
  refModuleTask = (node) => (this.moduleTask = node);
  refControllers = (node) => (this.controller = node);

  handlerNewTask = (event) => {
    const {
      addTab,
      setCurrentTab,
      router: { currentActionTab, activeTabs },
      appConfig,
    } = this.props;
    const { tabsLimit = 50 } = appConfig;

    if (currentActionTab !== 'taskModule_createTask') {
      if (tabsLimit <= activeTabs.length)
        return message.error(`Максимальное количество вкладок: ${tabsLimit}`);
      const path = 'taskModule_createTask';
      const isFind = activeTabs.findIndex((tab) => tab === path) !== -1;
      const config = { hardCodeUpdate: false };
      if (!isFind) addTab(routeParser({ path }), config);
      else if (currentActionTab !== path) setCurrentTab(path, config);
    }
  };

  checkBackground = (path, visible, mode = 'default') => {
    const { activeTabs = [] } = this.props;
    if (mode === 'default') return !visible && activeTabs.some((actionTab) => actionTab === path);
  };

  renderTasksSubTabs = (subTabProps) => {
    const { path = '' } = this.state;
    const { entitysList = [], type, activeTabs = [] } = this.props;
    const { router: { routeData = {} } = {} } = this.props;

    const config = {
      validation: this.checkBackground,
      path,
      viewModuleName: 'taskViewModule',
      moduleName: 'taskModule',
      parentType: type,
      type: oneOfType(types.$sub_entrypoint_module, types.$entity_entrypoint),
    };

    const entityList = entityRender(
      activeTabs.filter((tab) => tab === entitysList),
      routeData,
      subTabProps,
      config,
    );

    return entityList.map(({ component = null }) => component);
  };

  getTaskByPath = (path) => {
    if (!path) return <div>Not found path module</div>;

    const { height, heightController, counter, createTaskAvailable } = this.state;
    const {
      router,
      router: { currentActionTab = '' } = {},
      status,
      onOpenPageWithData,
      onLoadCurrentData,
      onLoadCacheData,
      rest,
      removeTab,
      setCurrentTab,
      udata = {},
      statusList = {},
      onSetStatus = null,
      type: typeDefault = Symbol(''),
    } = this.props;

    const route = routeParser({ pageType: 'moduleItem', path });
    const [namePath = '', uuid = ''] = path.split(regExpRegister.MODULE_ID);
    const type = uuid ? types.$entity_entrypoint : typeDefault;

    const subTabProps = {
      currentActionTab,
      rest,
      statusApp: status,
      counter,
      setCurrentTab,
      loading: router?.routeData[path] && router?.routeData[path]?.loading,
      height: heightController ? height - heightController : height,
      data: router?.routeData[path],
      uuid,
      namePath,
      route,
      statusList,
      onSetStatus,
      onLoadCurrentData,
      onOpenPageWithData,
      onLoadCacheData,
      removeTab,
      router,
      udata,
    };

    return (
      <>
        {oneOfType(types.$sub_entrypoint_module, types.$entrypoint_module)(type) &&
        (path?.includes('all') || path?.includes('myTasks')) ? (
          <div key="controllers" ref={this.refControllers} className="controllersWrapper">
            <Button
              disabled={!createTaskAvailable}
              className="newTaskButton"
              onClick={this.handlerNewTask}
              type="primary"
            >
              Создать новую задачу
            </Button>
          </div>
        ) : null}
        {this.renderTasksSubTabs(subTabProps)}
      </>
    );
  };

  render() {
    const { path = '', type = '' } = this.props;

    const component = this.getTaskByPath(path);
    return (
      <div key="taskModule" ref={this.refModuleTask} className="taskModule">
        {component ? (
          component
        ) : (
          <div>{`Error render module, invalid module type is ${Symbol.keyFor(type)}`}</div>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const { router, publicReducer } = state;
  const { udata = {}, appConfig, status } = publicReducer;

  return {
    status,
    router,
    statusList: settingsStatusSelector(state, props),
    udata,
    appConfig,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addTab: (tab, config = {}) => dispatch(addTabAction({ tab, config })),
    setCurrentTab: (tab, config = {}) => dispatch(setActiveTabAction({ tab, config })),
    removeTab: (tab) => dispatch(removeTabAction(tab)),
    onOpenPageWithData: (data) => dispatch(openPageWithDataAction(data)),
    onLoadCacheData: (props) => dispatch(loadCacheData(props)),
    onLoadCurrentData: (props) => dispatch(loadCurrentData(props)),
  };
};

export { TaskModule };
export default compose(
  withRouter,
  moduleContextToProps,
  withClientDb,
  connect(mapStateToProps, mapDispatchToProps),
)(TaskModule);
