import React from 'react';
import { taskModuleType } from './types';
import _ from 'lodash';

import { connect } from 'react-redux';
//import Scrollbars from 'react-custom-scrollbars';
import { Button, message } from 'antd';

import { routeParser, oneOfType } from 'Utils';
import { settingsStatusSelector } from 'Utils/selectors';
import {
  addTabAction,
  openPageWithDataAction,
  removeTabAction,
  setActiveTabAction,
} from 'Redux/actions/routerActions';
import { setStatus } from 'Redux/actions/publicActions';
import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import { loadCacheData } from 'Redux/actions/publicActions/middleware';
import modelContext from 'Models/context';
import entityRender from 'Utils/Tools/entityRender';
import withRouter from 'Components/withRouter';
import types from 'types';

class TaskModule extends React.PureComponent {
  state = {
    height: null,
    heightController: null,
    path: null,
    counter: null,
  };

  static contextType = modelContext;
  static propTypes = taskModuleType;

  static getDerivedStateFromProps = (props, state) => {
    if (props.path !== state.path) {
      return {
        ...state,
        path: props.path,
      };
    }

    return state;
  };

  componentDidMount = () => {
    const {
      path = '',
      visible,
      loaderMethods = {},
      router: { routeData },
    } = this.props;
    const { config: { task: { limitList = 20 } = {} } = {} } = this.context;
    const { height } = this.state;
    const { onShowLoader } = loaderMethods;

    const isEmptyTasks = _.isEmpty(routeData[path]);
    const isTaskModule = path && path.includes('task') && !path.split('__')[1];
    if (_.isNull(height) && !_.isNull(this.moduleTask) && visible) {
      this.recalcHeight();
    }

    if (visible && isTaskModule) {
      const saveData = {
        current: 1,
        pageSize: limitList,
      };
      this.fetchTaskModule(null, {
        ...saveData,
        paginationState: saveData,
      });
    }

    if (_.isFunction(onShowLoader) && isEmptyTasks) {
      onShowLoader();
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

  shouldUpdateTasks = () => {
    const { path = '' } = this.props;
    const viewId = path.split('__')[1];
    return !!path && path.includes('task') && !viewId && !path.includes('createTask');
  };

  componentDidUpdate = () => {
    const {
      visible,
      router: { shouldUpdate = false, routeData = {} },
      path = '',
    } = this.props;
    const { isListCounterLoading = false } = this.state;
    const { config: { task: { limitList = 20 } = {} } = {} } = this.context;
    if (!_.isNull(this.moduleTask) && !_.isNull(this.controller) && visible) {
      this.recalcHeight();
    }

    const shouldUpdateList = visible && routeData[path] && routeData[path]?.shouldUpdate;
    const isUnloadModule = shouldUpdate && visible && !routeData[path]?.load;
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

  fetchTaskModule = async (customOptions = null, saveData = {}, saveDataState) => {
    const { onLoadCurrentData, path, udata: { _id: uid = '' } = {} } = this.props;
    const { counter = null } = this.state;
    const { config, Request } = this.context || {};
    const { task: { limitList = 20 } = {} } = config || {};

    const options = customOptions
      ? customOptions
      : {
          limitList,
          saveData,
        };

    if (!Request) return;

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
            { filterCounter: path.includes('all') ? null : uid, saveData: { ...saveDataState, arrayKeys } },
            true,
          );
          if (res.status !== 200) throw new Error('Bad list');
          const { data: { response: { metadata = 0 } = {} } = {} } = res || {};
          if (counter !== metadata)
            this.setState({
              ...this.state,
              counter: metadata,
            });
        } catch (error) {
          if (error?.response?.status === 404) {
            this.setState({
              ...this.state,
              counter: 1,
            });
          } else console.error(error);
        }

        await onLoadCurrentData({
          path,
          storeLoad: 'tasks',
          useStore: true,
          methodRequst: 'POST',
          shoudParseToUniq: true,
          options: { ...options, filterCounter: path.includes('taskModule_all') ? null : uid },
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
        height: window.innerHeight - 10 > heightForState ? heightForState : window.innerHeight - 15,
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
    } = this.props;
    const { config: { tabsLimit = 50 } = {} } = this.context;

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
    if (path) {
      const { height, heightController, counter } = this.state;
      const {
        router,
        router: { currentActionTab = '' } = {},
        publicReducer: { status = null } = {},
        onOpenPageWithData,
        onLoadCurrentData,
        onLoadCacheData,
        rest,
        removeTab,
        setCurrentTab,
        udata = {},
        loaderMethods = {},
        statusList = {},
        onSetStatus = null,
        type: typeDefault = Symbol(''),
      } = this.props;

      const route = routeParser({ pageType: 'moduleItem', path });
      const [namePath = '', uuid = ''] = path.split('__');
      const type = uuid ? types.$entity_entrypoint : typeDefault;

      const subTabProps = {
        currentActionTab,
        rest,
        statusApp: status,
        counter,
        loaderMethods,
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
              <Button className="newTaskButton" onClick={this.handlerNewTask} type="primary">
                Создать новую задачу
              </Button>
            </div>
          ) : null}
          {this.renderTasksSubTabs(subTabProps)}
        </>
      );
    } else return <div>Not found path module</div>;
  };

  render() {
    const { path = '', type = '' } = this.props;
    const moduleViewKey = path?.split('__')[1];

    if (!path.includes('taskModule') || (moduleViewKey && !path.includes(moduleViewKey))) {
      return null;
    }

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
  const { udata = {} } = state.publicReducer;

  return {
    publicReducer: state.publicReducer,
    router: state.router,
    statusList: settingsStatusSelector(state, props),
    udata,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addTab: (tab, config = {}) => dispatch(addTabAction({ tab, config })),
    setCurrentTab: (tab, config = {}) => dispatch(setActiveTabAction({ tab, config })),
    onSetStatus: (status) => dispatch(setStatus(status)),
    removeTab: (tab) => dispatch(removeTabAction(tab)),
    onOpenPageWithData: (data) => dispatch(openPageWithDataAction(data)),
    onLoadCacheData: (props) => dispatch(loadCacheData(props)),
    onLoadCurrentData: (props) => dispatch(loadCurrentData({ ...props })),
  };
};
export { TaskModule };
export default connect(mapStateToProps, mapDispatchToProps)(withRouter(TaskModule));
