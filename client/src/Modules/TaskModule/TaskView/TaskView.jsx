// @ts-nocheck
import React from 'react';
import { taskViewType } from '../types';
import _ from 'lodash';
import moment from 'moment';
import { Descriptions, Empty, message } from 'antd';
import { connect } from 'react-redux';
import Scrollbars from 'react-custom-scrollbars';
import { deleteFile, loadFile } from '../../../Utils';
import { TASK_SCHEMA } from '../../../Models/Schema/const';

import { middlewareCaching, middlewareUpdate } from '../../../Redux/actions/publicActions/middleware';
import { сachingAction } from '../../../Redux/actions/publicActions';

import ModalWindow from '../../../Components/ModalWindow';
import TitleModule from '../../../Components/TitleModule';

import modelContext from '../../../Models/context';
import DescriptionTask from './DescriptionTask';
import renderDescription from './renderDescription';

class TaskView extends React.PureComponent {
  state = {
    key: this.props.uuid ? this.props.uuid : null,
    mode: 'jur',
    modeControll: 'default',
    isLoad: false,
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
    actionType: '__getJurnal',
    isLoadingFiles: false,
    filesArray: [],
    filteredUsers: [],
    showModalJur: false,
    modeEditContent: false,
  };

  static contextType = modelContext;
  static propTypes = taskViewType;
  static defaultProps = {
    columnStyleConfig: { xxl: 1, xl: 1, lg: 1, d: 1, sm: 1, xs: 1 },
  };

  static getDerivedStateFromProps = (props, state) => {
    if (props.uuid !== state.key) return { ...state, key: props.key };
    else return state;
  };

  componentDidMount = async () => {
    const {
      publicReducer: { caches = {} } = {},
      router: {
        routeDataActive: { key = '', editor = '', uidCreater = '', authorName = '' } = {},
        routeDataActive = {},
      },
      onLoadCacheData,
      data: { key: keyProps = '' } = {},
      onSaveCache = null,
    } = this.props;
    const { Request = {} } = this.context;
    const { actionType, key: taskId } = this.state;

    const idTask = !_.isEmpty(routeDataActive) && key ? key : keyProps ? keyProps : '';

    if (_.isEmpty(caches) || (key && !caches[key]) || (!key && onLoadCacheData)) {
      onSaveCache({
        data: [{ _id: uidCreater, displayName: authorName }],
        load: true,
        union: true,
        customDepKey: `taskView#${taskId}`,
        primaryKey: '__author',
      });

      onLoadCacheData({ actionType, depKey: idTask, depStore: 'tasks', store: 'jurnalworks' });
      try {
        const rest = new Request();
        const response = await rest.sendRequest('/system/userList', 'GET', null, true);

        if (response && response.status === 200) {
          const { data: { response: { metadata = [] } = {} } = {} } = response || {};

          const filteredUsers = metadata
            .map((user) => {
              const { _id = '', displayName = '' } = user;

              if (!user || !_id || !displayName) return null;

              return {
                _id,
                displayName,
              };
            })
            .filter(Boolean);

          if (onSaveCache) {
            const dataEditor =
              Array.isArray(editor) && editor?.length
                ? filteredUsers.filter(({ _id: userId }) => editor.some((value) => value === userId))
                : filteredUsers;

            onSaveCache({
              data: dataEditor,
              load: true,
              union: true,
              customDepKey: `taskView#${taskId}`,
              primaryKey: '__editor',
            });
          }

          this.setState({
            ...this.state,
            isLoad: true,
            filteredUsers,
          });
        } else throw new Error('fail load user list');
      } catch (error) {
        message.error('Ошибка загрузки сотрудников.');
        if (error?.response?.status !== 404) console.error(error);
        this.setState({
          ...this.state,
          isLoad: true,
        });
      }
    }
  };

  componentDidUpdate = async (props, state) => {
    const { isLoadingFiles = false, shouldRefresh = false } = this.state;
    const {
      router: { routeDataActive = {} },
    } = this.props;

    const { rest } = this.context;

    if ((!isLoadingFiles && routeDataActive?._id) || shouldRefresh) {
      try {
        this.setState(
          {
            ...this.state,
            shouldRefresh: false,
            isLoadingFiles: true,
          },
          async () => {
            const fileLoaderBody = {
              queryParams: {
                entityId: routeDataActive._id,
              },
            };

            const { data: { response = null } = {} } = await loadFile('tasks', fileLoaderBody);
            if (response && response?.done) {
              const { metadata: filesArray } = response;

              this.setState({
                ...this.state,
                filesArray: filesArray.map((it) => {
                  const { name, path_display: url, id: uid } = it;
                  const [module, taskId, filename] = url.slice(1).split(/\//gi);

                  return {
                    name,
                    url: `${rest.getApi()}/system/${module}/download/${taskId}/${filename}`,
                    status: 'done',
                    uid,
                  };
                }),
              });
            }
          },
        );
      } catch (error) {
        if (error?.response?.status !== 404) console.error(error);
      }
    }
  };

  /**
   * @param {any[]} fileList
   * @param {any} status
   */
  onAddFileList = (fileList, status) => {
    const shouldRefresh = fileList.every((it) => it.status === 'done');
    this.setState({
      ...this.state,
      filesArray: [...fileList],
      shouldRefresh,
    });
  };

  /**
   * @param {{ uid: any; }} file
   */
  onRemoveFile = async (file) => {
    try {
      const { filesArray } = this.state;

      if (!file) return;

      const deleteFileBody = {
        queryParams: {
          file,
        },
      };

      const { data: { response = null } = {} } = await deleteFile('tasks', deleteFileBody);

      if (response && response?.done) {
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
      } else throw new Error('Invalid delete file');
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error('Ошибка удаления файла.');
    }
  };

  onEdit = (event) => {
    const {
      router: { routeDataActive = {} },
    } = this.props;
    this.setState({
      ...this.state,
      modeEditContent: false,
      modeControll: 'edit',
      modeControllEdit: { ...routeDataActive },
    });
  };

  onRejectEdit = (event) => {
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
    if (_.isObject(event) && currentTarget && !_.isEmpty(currentTarget)) {
      return this.setState({
        ...this.state,
        modeEditContent: false,
        modeControllEdit: {
          ...this.state.modeControllEdit,
          name: value,
        },
      });
    } else if (_.isObject(event)) {
      if (_.isArray(event)) {
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
      const arrayStatus = ['Открыт', 'Выполнен', 'Закрыт', 'В работе'];
      if (arrayStatus.some((it) => it === event)) {
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
    const { onUpdate, router: { routeDataActive = {} } = {}, path = '' } = this.props;
    const { modeControllEdit = {} } = this.state;
    const validHashCopy = [{ ...modeControllEdit }];
    const { schema = {} } = this.context;

    const validHash = validHashCopy.map((it) => schema?.getSchema(TASK_SCHEMA, it)).filter(Boolean)[0];

    if (!validHash) return;
    const { _id: id = '', key = '' } = modeControllEdit || {};
    try {
      await onUpdate({
        id,
        key,
        path,
        updateBy: 'key',
        actionType: 'update_many',
        updateItem: { ...validHash },
        item: { ...routeDataActive },
        store: 'tasks',
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

  onEditContentMode = () => {
    this.setState({
      ...this.state,
      modeEditContent: true,
    });
  };

  showModalWorkJur = () => {
    this.setState({
      ...this.state,
      mode: 'jur',
      showModalJur: true,
      modeEditContent: false,
    });
  };

  calcSumWorkTime = (cachesJurnalList = []) => {
    return cachesJurnalList
      .reduce((startValue, item) => {
        const normalizeValue = item.timeLost.toString().toLowerCase();
        /** TODO: fix calculate */
        if (normalizeValue.includes('h') || normalizeValue.includes('ч')) {
          startValue += parseFloat(normalizeValue.split(/[hч]/i)[0]);
        } else if (normalizeValue.includes('m') || normalizeValue.includes('м')) {
          startValue += parseFloat(normalizeValue.split(/[mм]/i)[0]) / 60;
        }

        return startValue;
      }, 0)
      .toFixed(1);
  };

  renderWorkJurnal = (cachesJurnalList = []) => {
    return _.uniqBy(cachesJurnalList, '_id')
      .sort((a, b) => moment(b?.date[0]).unix() - moment(a?.date[0]).unix())
      .map((item, index) => {
        const date = item && Array.isArray(item.date) ? item.date[0] : 'Invalid date';

        return (
          <div key={`${item?._id}${index}`} className="jurnalItem">
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
            <p>
              {item?.description
                ? item.description
                : Array.isArray(item) && item[0]?.description
                ? item[0].description
                : 'не установлено'}
            </p>
          </div>
        );
      })
      .filter(Boolean);
  };

  getCacheItemsList = () => {
    const { publicReducer: { caches = null } = {}, uuid: UUID = '' } = this.props;
    const cachesAuthorList = [];
    const cachesEditorList = [];
    const cachesJurnalList = [];

    if (caches && typeof caches === 'object') {
      for (let [key, value] of Object.entries({ ...caches })) {
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
    return [cachesAuthorList, cachesEditorList, cachesJurnalList];
  };

  getAccessStatus = () => {
    const {
      router: { routeDataActive = {} },
    } = this.props;
    const { status = '' } = routeDataActive;
    const { modeControllEdit: { status: statusState = '' } = {} } = this.state;
    return _.uniq([
      statusState ? status : status ? status : null,
      'Открыт',
      'Выполнен',
      'Закрыт',
      'В работе',
    ]).filter(Boolean);
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
    ]).filter(Boolean);
  };

  getClassNameByStatus = () => {
    const {
      router: { routeDataActive = {} },
    } = this.props;
    const { status = '' } = routeDataActive;
    return status === 'Выполнен'
      ? 'done'
      : status === 'Закрыт'
      ? 'close'
      : status === 'В работе'
      ? 'active'
      : null;
  };

  getModalWindow = (accessStatus, rulesEdit = true, rulesStatus = false) => {
    const { router: { routeDataActive = {} } = {}, onCaching, onUpdate, path, uuid, udata = {} } = this.props;
    const { mode, actionType, modeControll, modeEditContent, isLoad = false } = this.state;

    const { key = '', status = '', description = '' } = routeDataActive || {};
    return (
      <ModalWindow
        onCaching={onCaching}
        actionType={actionType}
        routeDataActive={routeDataActive}
        mode={mode}
        path={path}
        key={key ? key : uuid()}
        keyTask={key ? key : null}
        accessStatus={accessStatus}
        onUpdate={onUpdate}
        onEdit={this.onEdit}
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
        rulesStatus={rulesStatus}
        isLoadList={isLoad}
      />
    );
  };

  render() {
    const {
      router: { routeDataActive = {} },
      onUpdate,
      udata = {},
      udata: { _id: uid = '' },
      onOpenPageWithData,
      setCurrentTab,
      router = {},
      columnStyleConfig = {},
    } = this.props;

    const {
      modeControll,
      modeControllEdit,
      filesArray = [],
      filteredUsers = [],
      isLoad = false,
    } = this.state;

    const {
      key = '',
      status = '',
      priority = '',
      name = '',
      uidCreater = '',
      editor = [],
      date = [],
      description = '',
    } = routeDataActive || {};
    const {
      onChangeEditable,
      onChangeEditableStart,
      onChangeEditableEnd,
      calcSumWorkTime,
      onEditContentMode,
      onAddFileList,
      onRemoveFile,
    } = this;
    const { rest = {} } = this.context;

    if (!key) return <div>This task not found</div>;

    const [cachesAuthorList, cachesEditorList, cachesJurnalList] = this.getCacheItemsList();
    const accessStatus = this.getAccessStatus();
    const accessPriority = this.getAccessPriority();

    const rulesEdit = uid === uidCreater;
    const rulesStatus = editor.some((editorId) => editorId === uid) || uid === uidCreater;

    const statusClassName = this.getClassNameByStatus();
    const renderMethods = {
      onChangeEditable,
      onChangeEditableStart,
      onEditContentMode,
      onChangeEditableEnd,
      calcSumWorkTime,
      onAddFileList,
      onRemoveFile,
    };

    const desciptionTaskProps = {
      ...renderMethods,
      routeDataActive,
      description,
      rulesEdit,
      filesArray,
      onUpdate,
      udata,
      rest,
    };

    const renderProps = {
      ...renderMethods,
      depModuleName: 'mainModule__table',
      onOpenPageWithData,
      cachesAuthorList,
      cachesEditorList,
      modeControllEdit,
      statusClassName,
      accessPriority,
      setCurrentTab,
      filteredUsers,
      modeControll,
      accessStatus,
      uidCreater,
      priority,
      status,
      isLoad,
      router,
      editor,
      udata,
      name,
      date,
      key,
    };

    return (
      <Scrollbars hideTracksWhenNotNeeded={true}>
        <TitleModule classNameTitle="taskModuleTittle" title="Карточка задачи" />
        {this.getModalWindow(accessStatus, rulesEdit, rulesStatus)}
        <div className="taskView">
          <div className="col-6 col-taskDescription">
            <Scrollbars hideTracksWhenNotNeeded={true}>
              <Descriptions bordered column={columnStyleConfig}>
                {renderDescription()(renderProps)}
              </Descriptions>
              <div className="descriptionTask">
                <DescriptionTask {...desciptionTaskProps} />
              </div>
            </Scrollbars>
          </div>
          <div className="col-6 col-taskDescription">
            <TitleModule classNameTitle="historyTaskTitle" title="Журнал работы" />
            <Scrollbars hideTracksWhenNotNeeded={true}>
              {!cachesJurnalList?.length ? (
                <Empty description={<span>Нету данных в журнале</span>} />
              ) : (
                this.renderWorkJurnal(cachesJurnalList)
              )}
            </Scrollbars>
          </div>
        </div>
      </Scrollbars>
    );
  }
}

const mapStateTopProps = (state) => {
  const { router = {}, publicReducer = {}, publicReducer: { udata = {} } = {} } = state || {};

  return {
    router,
    publicReducer,
    udata,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onCaching: async (props) => await dispatch(middlewareCaching(props)),
    onSaveCache: (props) => dispatch(сachingAction(props)),
    onUpdate: (props) => dispatch(middlewareUpdate({ ...props })),
  };
};

export { TaskView };
export default connect(mapStateTopProps, mapDispatchToProps)(TaskView);
