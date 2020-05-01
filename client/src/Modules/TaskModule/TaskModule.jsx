// @ts-nocheck
import React from 'react';
import { taskModuleType } from './types';
import _ from 'lodash';

import { connect } from 'react-redux';
import Scrollbars from 'react-custom-scrollbars';
import { Button, message } from 'antd';

import { routeParser } from '../../Utils';

import TabContainer from '../../Components/TabContainer';
import { addTabAction, openPageWithDataAction, removeTabAction } from '../../Redux/actions/routerActions';
import { loadCurrentData } from '../../Redux/actions/routerActions/middleware';
import { loadCacheData } from '../../Redux/actions/publicActions/middleware';
import TaskModuleCalendar from './TaskModuleCalendar';
import TaskModuleList from './TaskModuleList';
import TaskModuleMyList from './TaskModuleMyList';
import TaskView from './TaskView';
import CreateTask from './CreateTask';
import modelContext from '../../Models/context';

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

    window.addEventListener('resize', this.recalcHeight.bind(this));
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.recalcHeight.bind(this));
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
    const isTaskModule = path && path.includes('task') && !path.split('__')[1];

    const shouldUpdateList = visible && isTaskModule && routeData[path] && routeData[path]?.shouldUpdate;
    const isUnloadModule = shouldUpdate && visible && !routeData[path]?.load;
    const { loading = false } = routeData[path] || {};

    const isCloseAction = !isUnloadModule && !shouldUpdateList && shouldUpdate && !loading;
    if (!isListCounterLoading && isTaskModule && (isUnloadModule || shouldUpdateList || isCloseAction)) {
      const { saveData: saveDataState = null } = routeData[path] || {};
      const saveData = saveDataState
        ? saveDataState
        : {
            current: 1,
            pageSize: limitList,
          };
      this.fetchTaskModule(null, saveData, saveDataState);
    }
  };

  fetchTaskModule = async (customOptions = null, saveData = {}, saveDataState) => {
    const { onLoadCurrentData, path, udata: { _id: uid = '' } = {}, routeDa } = this.props;
    const { counter = null } = this.state;
    const { config, Request } = this.context || {};
    const { task: { limitList = 20 } = {} } = config || {};
    const options = customOptions
      ? customOptions
      : {
          limitList,
          saveData,
        };

    this.setState(
      {
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
        // if (options && options?.saveData?.filteredInfo) {
        //   options.saveData.filteredInfo = {
        //     editor: ['5df9621e83e65e4538bfc2c3'],
        //   };
        // }

        await onLoadCurrentData({
          path,
          storeLoad: 'tasks',
          useStore: true,
          methodRequst: 'POST',
          shoudParseToUniq: true,
          options: { ...options, filterCounter: path.includes('all') ? null : uid },
        });

        this.setState({
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
      router: { currentActionTab, actionTabs },
    } = this.props;
    const { config: { tabsLimit = 50 } = {} } = this.context;

    if (currentActionTab !== 'taskModule_createTask') {
      if (tabsLimit <= actionTabs.length)
        return message.error(`Максимальное количество вкладок: ${tabsLimit}`);
      const path = 'taskModule_createTask';
      const isFind = actionTabs.findIndex((tab) => tab === path) !== -1;

      if (!isFind) addTab(routeParser({ path }));
      else if (currentActionTab !== path) setCurrentTab(path);
    }
  };

  checkBackground = (path, mode = 'default') => {
    const { actionTabs = [] } = this.props;
    if (mode === 'default') return actionTabs.some((actionTab) => actionTab === path);
  };

  getTaskByPath = (path) => {
    if (path) {
      const { height, heightController } = this.state;
      const isList = path === 'taskModule_myTasks' || path === 'taskModule_all';
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
      } = this.props;

      const isViewTask = path.startsWith('taskModule') && /__/gi.test(path);

      const isBackgroundTaskModuleAll = this.checkBackground('taskModule_all');
      const isBackgroundTaskModuleMyTasks = this.checkBackground('taskModule_myTasks');
      const isBackgroundTaskModuleCalendar = this.checkBackground('taskModule_сalendar');
      const isBackgroundTaskModuleCreateTask = this.checkBackground('taskModule_createTask');

      const route = routeParser({ pageType: 'moduleItem', path });
      const isBackgroundTaskViewModule = _.isObject(route) && !_.isNull(route);
      const moduleName = path;
      const [name = '', key = ''] = path.split('__');

      return (
        <Scrollbars hideTracksWhenNotNeeded={true}>
          {isList ? (
            <div key="controllers" ref={this.refControllers} className="controllersWrapper">
              <Button className="newTaskButton" onClick={this.handlerNewTask} type="primary">
                Создать новую задачу
              </Button>
            </div>
          ) : null}
          <TabContainer
            key={`${currentActionTab}${name}taskList_tab`}
            className="tabList"
            isBackground={isBackgroundTaskModuleAll}
            visible={path === 'taskModule_all'}
          >
            <TaskModuleList
              key="taskModule_listAll"
              urrentActionTab={currentActionTab}
              isBackground={isBackgroundTaskModuleAll}
              rest={rest}
              counter={this.state.counter}
              loaderMethods={loaderMethods}
              visible={path === 'taskModule_all'}
              setCurrentTab={setCurrentTab}
              loading={router?.routeData[moduleName] && router?.routeData[moduleName]?.loading}
              height={heightController ? height - heightController : height}
              data={router?.routeData[moduleName]}
              router={router}
            />
          </TabContainer>
          <TabContainer
            key={`${currentActionTab}${name}myTaskList_tab`}
            className="tabList"
            isBackground={isBackgroundTaskModuleMyTasks}
            visible={path === 'taskModule_myTasks'}
          >
            <TaskModuleMyList
              key="myList_tasks"
              currentActionTab={currentActionTab}
              rest={rest}
              udata={udata}
              router={router}
              loading={router?.routeData[moduleName] && router?.routeData[moduleName]?.loading}
              loaderMethods={loaderMethods}
              counter={this.state.counter}
              isBackground={isBackgroundTaskModuleMyTasks}
              visible={path === 'taskModule_myTasks'}
              setCurrentTab={setCurrentTab}
              height={height}
              data={router?.routeData[moduleName]}
            />
          </TabContainer>
          <TabContainer
            key="calendarTaskModule_tab"
            className="validateStyleWrapper"
            isBackground={isBackgroundTaskModuleCalendar}
            visible={path === 'taskModule_сalendar'}
          >
            <TaskModuleCalendar
              key="calendarTaskModule"
              rest={rest}
              isBackground={isBackgroundTaskModuleCalendar}
              visible={path === 'taskModule_сalendar'}
              setCurrentTab={setCurrentTab}
              onOpenPageWithData={onOpenPageWithData}
              height={heightController ? height - heightController : height}
              router={router}
              loaderMethods={loaderMethods}
            />
          </TabContainer>
          <TabContainer
            key="createTask_module_tab"
            className="validateStyleWrapper"
            isBackground={isBackgroundTaskModuleCreateTask}
            visible={path === 'taskModule_createTask'}
          >
            <CreateTask
              key="createTask_module"
              rest={rest}
              isBackground={isBackgroundTaskModuleCreateTask}
              visible={path === 'taskModule_createTask'}
              height={heightController ? height - heightController : height}
              onLoadCurrentData={onLoadCurrentData}
              statusApp={status}
              router={router}
              onOpenPageWithData={onOpenPageWithData}
              removeTab={removeTab}
              udata={udata}
            />
          </TabContainer>
          <TabContainer
            key="taskView_tab"
            className="validateStyleWrapper"
            isBackground={isBackgroundTaskViewModule}
            visible={isViewTask}
          >
            <TaskView
              key="taskView"
              uuid={key}
              rest={rest}
              isBackground={isBackgroundTaskViewModule}
              visible={isViewTask}
              height={heightController ? height - heightController : height}
              onLoadCurrentData={onLoadCurrentData}
              onLoadCacheData={onLoadCacheData}
              onOpenPageWithData={onOpenPageWithData}
              setCurrentTab={setCurrentTab}
              data={router.routeData[key]}
            />
          </TabContainer>
        </Scrollbars>
      );
    } else return <div>Not found path module</div>;
  };

  render() {
    const { path } = this.props;

    const component = this.getTaskByPath(path);
    return (
      <div key="taskModule" ref={this.refModuleTask} className="taskModule">
        {component ? component : null}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { udata = {} } = state.publicReducer;

  return {
    publicReducer: state.publicReducer,
    router: state.router,
    udata,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addTab: (tab) => dispatch(addTabAction(tab)),
    removeTab: (tab) => dispatch(removeTabAction(tab)),
    onOpenPageWithData: (data) => dispatch(openPageWithDataAction(data)),
    onLoadCacheData: (props) => dispatch(loadCacheData(props)),
    onLoadCurrentData: (props) => dispatch(loadCurrentData({ ...props })),
  };
};
export { TaskModule };
export default connect(mapStateToProps, mapDispatchToProps)(TaskModule);
