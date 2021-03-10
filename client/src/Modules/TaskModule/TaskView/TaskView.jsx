import React, { PureComponent } from 'react';
import { taskViewType } from '../TaskModule.types';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import moment from 'moment';
import { Empty, message, Spin } from 'antd';
import { connect } from 'react-redux';
import Scrollbars from 'react-custom-scrollbars';
import { loadFile, routeParser, sortedByKey } from 'Utils';
import { TASK_SCHEMA } from 'Models/Schema/const';
import { settingsStatusSelector } from 'Redux/selectors';
import { middlewareCaching, middlewareUpdate } from 'Redux/actions/publicActions/middleware';
import { сachingAction } from 'Redux/actions/publicActions';

import ModalWindow from 'Components/ModalWindow';
import TitleModule from 'Components/TitleModule';

import DescriptionTask from './DescriptionTask';
import TaskDescription from './TaskDescription';
import actionsTypes from 'actions.types';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { withClientDb } from 'Models/ClientSideDatabase';
import actionPath from 'actions.path';
import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import { getClassNameByStatus } from './TaskView.utils';
import fs from 'Utils/Tools/Fs';

class TaskView extends PureComponent {
  state = {
    type: 'default',
    key: this.props.uuid ? this.props.uuid : null,
    mode: 'jur',
    modeControll: 'default',
    isLoad: false,
    statusListName: [],
    modeControllEdit: {
      key: null,
      status: null,
      name: null,
      priority: null,
      uidCreater: null,
      authorName: null,
      editor: null,
      description: null,
      date: null,
      tags: [],
    },
    actionType: '__getJurnal',
    customTypeModal: '',
    isLoadingFiles: false,
    filesArray: [],
    filteredUsers: [],
    showModalJur: false,
    modeEditContent: false,
  };

  static propTypes = taskViewType;
  static defaultProps = {
    columnStyleConfig: { xxl: 1, xl: 1, lg: 1, d: 1, sm: 1, xs: 1 },
    modeControllEdit: {},
    isBackground: false,
  };

  static getDerivedStateFromProps = (props, state) => {
    const { uuid, router: { routeDataActive: { uidCreater = '' } = {} } = {} } = props;
    const { key, type } = state;
    if (uuid !== key) return { ...state, key: key };
    else if (uidCreater?.includes('__remoteTicket') && type !== 'remote') {
      return {
        ...state,
        type: 'remote',
      };
    } else return state;
  };

  componentDidMount = () => {
    const { router = {} } = this.props;
    const { routeDataActive = {} } = router;
    const { key = null } = routeDataActive;

    if (!key) {
      this.findTask();
      return;
    }

    this.onLoadTaskAdditionalData();
  };

  componentDidUpdate = () => {
    const { isLoadingFiles = false, shouldRefresh } = this.state;
    const { router = {} } = this.props;
    const { shouldUpdate = false } = router;

    if (!isLoadingFiles && (shouldUpdate || shouldRefresh)) {
      this.fetchFiles();
    }

    this.onRefreshStatusList();
  };

  onRefreshStatusList = () => {
    const { statusListName = [] } = this.state;
    const { statusList = {} } = this.props;
    const { settings = [] } = statusList;

    const filteredStatusNames = settings.reduce((acc, { value = '' }) => {
      if (value) return [...acc, value];
      return acc;
    }, []);

    if (filteredStatusNames.length === statusListName.length) return;
    this.setState({
      ...this.state,
      statusListName: filteredStatusNames,
    });
  };

  onLoadTaskAdditionalData = async () => {
    const { router = {}, onLoadCacheData, onSaveCache = null, clientDB } = this.props;
    const { routeDataActive = {} } = router;
    const { key = '', uidCreater = '', authorName = '' } = routeDataActive;
    const { actionType, key: taskId } = this.state;

    if (!taskId) return;

    await onSaveCache({
      data: [{ _id: uidCreater, displayName: authorName, key: key || uuid() }],
      load: true,
      union: true,
      customDepKey: `taskView#${taskId}`,
      uuid: '__author',
    });

    await onLoadCacheData({
      actionType,
      depKey: taskId,
      depStore: 'tasks',
      store: 'jurnalworks',
      clientDB,
    });

    await this.fetchDepUsersList();
    await this.fetchFiles();
  };

  findTask = () => {
    const { router = {}, clientDB, onLoadCurrentData } = this.props;
    const { currentActionTab = '' } = router;

    const { page: path = '', itemId = '' } = routeParser({ pageType: 'moduleItem', path: currentActionTab });

    this.setState({ findTaskLoading: true }, async () => {
      await onLoadCurrentData({
        action: actionPath.$LOAD_TASKS_LIST,
        path,
        options: {
          itemId,
        },
        optionsForParse: {
          add: true,
        },
        clientDB,
      });
      await this.onLoadTaskAdditionalData();
      this.setState({ findTaskLoading: false });
    });
  };

  fetchDepUsersList = async () => {
    const { onSaveCache = null, router = {}, modelsContext } = this.props;
    const { routeDataActive = {} } = router;
    const { editor = '' } = routeDataActive;
    const { key: taskId } = this.state;
    const { Request = {} } = modelsContext;

    try {
      const rest = new Request();
      const res = await rest.sendRequest('/system/userList', 'GET', null, true);

      if (res?.status !== 200) throw new Error('fail load user list');

      const { response = {} } = res.data || {};
      const { metadata = [] } = response;

      const filteredUsers = metadata.reduce((usersList, user) => {
        const { _id = '', displayName = '' } = user;

        if (!user || !_id || !displayName) return usersList;

        return [
          ...usersList,
          {
            _id,
            displayName,
          },
        ];
      }, []);

      const dataEditor = Array.isArray(editor)
        ? filteredUsers.filter(({ _id: userId }) => editor.some((value) => value === userId))
        : filteredUsers;

      onSaveCache({
        data: dataEditor,
        load: true,
        union: true,
        customDepKey: `taskView#${taskId}`,
        uuid: '__editor',
      });

      this.setState({
        ...this.state,
        isLoad: true,
        filteredUsers,
      });
    } catch (error) {
      message.error('Ошибка загрузки сотрудников.');

      if (error?.response?.status !== 404) {
        console.error(error);
      }

      this.setState({
        ...this.state,
        isLoad: true,
      });
    }
  };

  fetchFiles = async () => {
    const { router = {}, modelsContext } = this.props;
    const { routeDataActive = {} } = router;
    const { rest } = modelsContext;

    try {
      this.setState(
        {
          ...this.state,
          shouldRefresh: false,
          isLoadingFiles: true,
        },
        async () => {
          const { _id: entityId = '' } = routeDataActive;
          const fileLoaderBody = {
            queryParams: {
              entityId,
            },
          };

          const res = await loadFile('tasks', fileLoaderBody);
          const { response = null } = res.data;

          if (!response.done) throw new Error('Bad fetch files');

          const { metadata } = response;
          const filesArray = Array.isArray(metadata)
            ? metadata
            : metadata && typeof metadata === 'object'
            ? metadata?.entries
            : [];

          const files = filesArray.reduce((acc, file) => {
            const { name = '', path_display: url = '', id: uid = '' } = file || {};
            const [module, taskId, filename] = url?.slice(1)?.split(/\//gi);

            if (!name || !url || !uid) return acc;

            return [
              ...acc,
              {
                name,
                url: `${rest.getApi()}/system/${module}/download/${taskId}/${filename}`,
                status: 'done',
                uid,
              },
            ];
          }, []);

          this.setState({
            ...this.state,
            filesArray: files,
          });
        },
      );
    } catch (error) {
      if (error?.response?.status !== 404) {
        console.error(error);
      }
    }
  };

  onChangeTagList = (tags) => {
    this.setState({
      ...this.state,
      modeControllEdit: {
        ...this.state.modeControllEdit,
        tags,
      },
    });
  };

  onAddFileList = (fileList) => {
    const shouldRefresh = fileList.every((it) => it.status === 'done');
    this.setState({
      ...this.state,
      filesArray: [...fileList],
      shouldRefresh,
    });
  };

  onRemoveFile = async (file) => {
    try {
      const { filesArray } = this.state;

      if (!file) return;

      const deleteFileBody = {
        queryParams: {
          file,
        },
      };

      const res = await fs.deleteFile('tasks', deleteFileBody);
      const { response = null } = res.data;

      if (!response.done) throw new Error('Invalid delete file');

      const { metadata: { metadata: fileParams = {} } = {} } = response;
      const { uid: idClient = '' } = file;
      const { id: idResponse = '' } = fileParams;

      if (idClient !== idResponse) {
        throw new Error('id files not equal');
      }

      this.setState(
        {
          ...this.state,
          filesArray: filesArray.filter((it) => it.uid !== idResponse),
        },
        () => {
          message.success('Файл успешно удален');
        },
      );
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error('Ошибка удаления файла.');
    }
  };

  onEdit = () => {
    const { router = {} } = this.props;
    const { routeDataActive = {} } = router;

    this.setState({
      ...this.state,
      modeEditContent: false,
      modeControll: 'edit',
      modeControllEdit: { ...routeDataActive },
    });
  };

  onRejectEdit = () => {
    this.setState({
      ...this.state,
      modeControll: 'default',
      modeEditContent: false,
      modeControllEdit: {
        key: null,
        status: null,
        name: null,
        priority: null,
        uidCreater: null,
        authorName: null,
        editor: null,
        description: null,
        date: null,
      },
    });
  };

  onChangeEditableStart = (event) => {
    const dateString = event && event._d ? moment(event._d, 'DD.MM.YYYY').format('DD.MM.YYYY') : null;
    const { modeControllEdit: { date = [] } = {} } = this.state;
    const newDate = [...date];
    newDate[0] = dateString;

    return this.setState({
      ...this.state,
      modeEditContent: false,
      modeControllEdit: {
        ...this.state.modeControllEdit,
        date: newDate,
      },
    });
  };

  onChangeEditableEnd = (event) => {
    const dateString = event && event._d ? moment(event._d, 'DD.MM.YYYY').format('DD.MM.YYYY') : null;
    const { modeControllEdit: { date = [] } = {} } = this.state;
    const newDate = [...date];
    newDate[1] = dateString;

    return this.setState({
      ...this.state,
      modeEditContent: false,
      modeControllEdit: {
        ...this.state.modeControllEdit,
        date: newDate,
      },
    });
  };

  onChangeEditable = (event) => {
    const { currentTarget = {}, currentTarget: { value = '' } = {} } = event;

    if (event && typeof event === 'object' && currentTarget && !_.isEmpty(currentTarget)) {
      return this.setState({
        ...this.state,
        modeEditContent: false,
        modeControllEdit: {
          ...this.state.modeControllEdit,
          name: value,
        },
      });
    } else if (event && typeof event === 'object') {
      if (Array.isArray(event)) {
        return this.setState({
          ...this.state,
          modeEditContent: false,
          modeControllEdit: {
            ...this.state.modeControllEdit,
            editor: [...event],
          },
        });
      }
    } else if (typeof event === 'string') {
      const { statusListName } = this.state;

      if (statusListName?.some((it) => it === event)) {
        return this.setState({
          ...this.state,
          modeEditContent: false,
          modeControllEdit: {
            ...this.state.modeControllEdit,
            status: event,
          },
        });
      } else {
        return this.setState({
          ...this.state,
          modeEditContent: false,
          modeControllEdit: {
            ...this.state.modeControllEdit,
            priority: event,
          },
        });
      }
    }
  };

  onUpdateEditable = async (event) => {
    const {
      onUpdate,
      router: { routeDataActive = {} } = {},
      router: { path = '' },
      route = null,
      modelsContext,
      clientDB,
    } = this.props;

    const { modeControllEdit = {} } = this.state;
    const validHashCopy = [{ ...modeControllEdit }];
    const { schema = {} } = modelsContext;

    const validHash = validHashCopy.map((it) => schema?.getSchema(TASK_SCHEMA, it)).filter(Boolean)[0];

    if (!validHash) return;
    const { _id: id = '', key = '' } = modeControllEdit || {};
    try {
      const parsedRoutePath =
        !route || (route && _.isEmpty(route))
          ? routeParser({
              pageType: 'moduleItem',
              path,
            })
          : route;

      await onUpdate({
        actionType: actionsTypes.$UPDATE_MANY,
        parsedRoutePath,
        id,
        key,
        path,
        updateBy: '_id',
        updateItem: { ...validHash },
        item: { ...routeDataActive },
        store: 'tasks',
        clientDB,
      });
      this.onRejectEdit(event);
      message.success('Задача обновлена.');
    } catch (error) {
      message.error('Ошибка обновления задачи.');
    }
  };

  onCancelEditModeContent = () => {
    this.setState({
      ...this.state,
      modeEditContent: false,
    });
  };

  onEditContentMode = (event, customTypeModal) => {
    event.preventDefault();
    this.setState({
      ...this.state,
      modeEditContent: true,
      customTypeModal,
    });
  };

  renderWorkJournal = (cachesJournalList = []) => {
    return _.uniqBy(cachesJournalList, '_id')
      .sort((a, b) => moment(b?.date[0]).unix() - moment(a?.date[0]).unix())
      .map((item, index) => {
        const date = item && Array.isArray(item.date) ? item.date[0] : 'Invalid date';

        return (
          <div key={`${item?._id}${index}`} className="journalItem">
            {item.editor ? <p className="editor">{item.editor}</p> : null}
            <p className="timeLost">
              <span className="title">Затрачено времени:</span>
              {item?.timeLost ? item.timeLost : item[0] ? item[0]?.timeLost : 'не установлено'}
            </p>
            <p className="date">
              <span className="title">Дата:</span>
              {item?.date && date !== 'Invalid date' ? date : item[0] ? item[0].date : 'не установлено'}
            </p>
            <p className="comment">
              <span className="title">Коментарии:</span>
            </p>
            <p className="msg">
              {item?.description
                ? item.description
                : Array.isArray(item) && item[0]?.description
                ? item[0].description
                : 'не установлено'}
            </p>
          </div>
        );
      });
  };

  getCacheItemsList = () => {
    const { caches = null, uuid: UUID = '' } = this.props;
    const cachesAuthorList = [];
    const cachesEditorList = [];
    const cachesJurnalList = [];

    if (caches && typeof caches === 'object') {
      for (let [key, value] of Object.entries(caches)) {
        if (key.includes('__getJurnal') && value?.depKey === UUID) {
          cachesJurnalList.push(value);
          continue;
        }

        if (!key.includes(`taskView#${UUID}`)) continue;

        if (key.includes('editor')) {
          cachesEditorList.push(value);
          continue;
        }

        if (key.includes('author')) {
          cachesAuthorList.push(value);
        }
      }
    }

    return [
      cachesAuthorList,
      cachesEditorList,
      sortedByKey(cachesJurnalList, 'date', 'date', 'DD.MM.YYYY HH:mm:ss'),
    ];
  };

  getAccessStatus = () => {
    const { statusListName } = this.state;
    return statusListName;
  };

  getAccessPriority = () => {
    const {
      router: { routeDataActive = {} },
    } = this.props;
    const { modeControllEdit: { priority: priorityState = '' } = {} } = this.state;
    const { priority = '' } = routeDataActive;

    return _.uniq([
      priorityState ? priorityState : priority ? priority : null,
      'Высокий',
      'Средний',
      'Низкий',
      'Критический',
    ]).filter(Boolean);
  };

  getModalWindow = (accessStatus, rulesEdit = true, rulesStatus = false) => {
    const {
      router: { routeDataActive = {} } = {},
      onCaching,
      onUpdate,
      router: { path = '' },
      route,
      uuid,
      udata = {},
    } = this.props;
    const {
      mode,
      actionType,
      modeControll,
      modeEditContent,
      isLoad = false,
      type = 'default',
      customTypeModal,
    } = this.state;

    const { _id: id = '', key = '', status = '', description = '' } = routeDataActive || {};
    return (
      <ModalWindow
        key={key ? key : uuid()}
        actionTypeList={type}
        onCaching={onCaching}
        actionType={actionType}
        routeDataActive={routeDataActive}
        mode={mode}
        path={path}
        route={route}
        keyTask={id ? id : null}
        accessStatus={accessStatus}
        onUpdate={onUpdate}
        description={description}
        onRejectEdit={this.onRejectEdit}
        modeControll={modeControll}
        editableContent={description}
        modeEditContent={modeEditContent}
        onCancelEditModeContent={this.onCancelEditModeContent}
        onUpdateEditable={this.onUpdateEditable}
        statusTaskValue={status ? status : null}
        udata={udata}
        rulesEdit={rulesEdit}
        onEdit={this.onEdit}
        rulesStatus={rulesStatus}
        isLoadList={isLoad}
        customTypeModal={customTypeModal}
      />
    );
  };

  render() {
    const {
      router: { routeDataActive = {} },
      onUpdate,
      udata = {},
      udata: { _id: uid = '' } = {},
      onOpenPageWithData,
      setCurrentTab,
      router = {},
      columnStyleConfig = {},
      currentActionTab: path = '',
      modelsContext,
    } = this.props;

    const {
      modeControll,
      modeControllEdit = {},
      filesArray = [],
      filteredUsers = [],
      isLoad = false,
      modeControllEdit: { tags: tagsListState = [] } = {},
      findTaskLoading = false,
    } = this.state;

    const {
      key = '',
      status = '',
      priority = '',
      name = '',
      uidCreater = '',
      editor = [],
      date = [],
      tags: tagsView = [],
      description = '',
    } = routeDataActive || {};
    const {
      onChangeEditable,
      onChangeEditableStart,
      onChangeEditableEnd,
      onEditContentMode,
      onAddFileList,
      onRemoveFile,
      onChangeTagList,
    } = this;
    const { rest = {} } = modelsContext;

    if (!key)
      return findTaskLoading ? (
        <div className="taskView taskView--taskLoader">
          <Spin size="large" tip="Loading task..." />
        </div>
      ) : (
        <div>This task not found</div>
      );

    const [cachesAuthorList, cachesEditorList, cachesJurnalList] = this.getCacheItemsList();
    const accessStatus = this.getAccessStatus();
    const accessPriority = this.getAccessPriority();
    const isRemoteTicket = uidCreater?.includes('__remoteTicket');
    const rulesEdit = uid === uidCreater || isRemoteTicket;
    const rulesStatus = editor.some((editorId) => editorId === uid) || uid === uidCreater || isRemoteTicket;

    const statusClassName = getClassNameByStatus(status);
    const renderMethods = {
      onChangeEditable,
      onChangeEditableStart,
      onChangeTagList,
      onOpenPageWithData,
      onEditContentMode,
      onChangeEditableEnd,
      onAddFileList,
      onRemoveFile,
    };

    const commonProps = {
      ...renderMethods,
      depDataKey: 'global',
      cachesAuthorList,
      cachesEditorList,
      cachesJurnalList,
      filteredUsers,
      router,
      udata,
    };

    const descriptionTaskProps = {
      ...commonProps,
      routeDataActive,
      description,
      rulesEdit,
      filesArray,
      onUpdate,
      udata,
      path,
      rest,
    };

    const renderProps = {
      ...commonProps,
      modeControllEdit,
      statusClassName,
      accessPriority,
      setCurrentTab,
      modeControll,
      accessStatus,
      uidCreater,
      tagList: _.uniqBy([...tagsListState, ...tagsView], 'id'),
      tagsView,
      priority,
      status,
      isLoad,
      editor,
      name,
      date,
      taskKey: key,
    };

    return (
      <Scrollbars hideTracksWhenNotNeeded>
        <TitleModule classNameTitle="taskModuleTitle" title="Карточка задачи" />
        {this.getModalWindow(accessStatus, rulesEdit, rulesStatus)}
        <div className="taskView">
          <div className="col-6 col-taskDescription">
            <Scrollbars hideTracksWhenNotNeeded>
              <TaskDescription {...renderProps} columnStyleConfig={columnStyleConfig} />
              <div className="descriptionTask">
                <DescriptionTask commentProps={commonProps} {...descriptionTaskProps} />
              </div>
            </Scrollbars>
          </div>
          <div className="col-6 col-taskDescription">
            <TitleModule classNameTitle="historyTaskTitle" title="Журнал работы" />
            <Scrollbars hideTracksWhenNotNeeded>
              {!cachesJurnalList?.length ? (
                <Empty description={<span>Нету данных в журнале</span>} />
              ) : (
                this.renderWorkJournal(cachesJurnalList)
              )}
            </Scrollbars>
          </div>
        </div>
      </Scrollbars>
    );
  }
}

const mapStateTopProps = (state, props) => {
  const { router, publicReducer } = state || {};
  const { caches, udata } = publicReducer;
  return {
    router,
    caches,
    udata,
    statusList: settingsStatusSelector(state, props),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onCaching: async (props) => await dispatch(middlewareCaching(props)),
    onLoadCurrentData: (props) => dispatch(loadCurrentData(props)),
    onSaveCache: (props) => dispatch(сachingAction(props)),
    onUpdate: (props) => dispatch(middlewareUpdate(props)),
  };
};

export { TaskView };
export default compose(
  moduleContextToProps,
  withClientDb,
  connect(mapStateTopProps, mapDispatchToProps),
)(TaskView);
