import React from 'react';
import { taskViewType } from '../types';
import { v4 as uuid } from 'uuid';
import _ from 'lodash';
import moment from 'moment';
import { Descriptions, Empty, message } from 'antd';
import { connect } from 'react-redux';
import Scrollbars from 'react-custom-scrollbars';
import { deleteFile, loadFile } from 'Utils';
import { TASK_SCHEMA } from 'Models/Schema/const';
import { settingsStatusSelector } from 'Utils/selectors';
import { middlewareCaching, middlewareUpdate } from 'Redux/actions/publicActions/middleware';
import { сachingAction } from 'Redux/actions/publicActions';

import ModalWindow from 'Components/ModalWindow';
import TitleModule from 'Components/TitleModule';

import modelContext from 'Models/context';
import DescriptionTask from './DescriptionTask';
import renderDescription from './renderDescription';

class TaskView extends React.PureComponent {
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
    modeControllEdit: {},
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

  onChangeTagList = (tags) => {
    this.setState({
      ...this.state,
      modeControllEdit: {
        ...this.state.modeControllEdit,
        tags,
      },
    });
  };

  componentDidMount = async () => {
    const {
      publicReducer: { caches = {} } = {},
      router: {
        routeDataActive: { _id: id = '', key = '', editor = '', uidCreater = '', authorName = '' } = {},
        routeDataActive = {},
      },
      onLoadCacheData,
      data: { id: idProps = '' } = {},
      onSaveCache = null,
    } = this.props;
    const { Request = {} } = this.context;
    const { actionType, key: taskId } = this.state;

    const idTask = !_.isEmpty(routeDataActive) && id ? id : idProps ? idProps : '';

    if (_.isEmpty(caches) || (key && !caches[key]) || (!key && onLoadCacheData)) {
      onSaveCache({
        data: [{ _id: uidCreater, displayName: authorName, key: uuid() }],
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

    const { statusListName = [] } = this.state;
    const { statusList: { settings = [] } = {} } = this.props;
    const filteredStatusNames = settings.map(({ value = '' }) => value).filter(Boolean);

    if ((!isLoadingFiles && routeDataActive?._id) || shouldRefresh) {
      try {
        this.setState(
          {
            ...this.state,
            statusListName: filteredStatusNames,
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
              const { metadata } = response;
              const filesArray = _.isArray(metadata)
                ? metadata
                : _.isPlainObject(metadata)
                ? metadata?.entries
                : [];

              const files = filesArray
                .map((it) => {
                  const { name = '', path_display: url = '', id: uid = '' } = it || {};
                  const [module, taskId, filename] = url?.slice(1)?.split(/\//gi);

                  return {
                    name,
                    url: `${rest.getApi()}/system/${module}/download/${taskId}/${filename}`,
                    status: 'done',
                    uid,
                  };
                })
                .filter(({ name = '', url = '', uid = '' } = {}) => name && url && uid);

              this.setState({
                ...this.state,
                statusListName: filteredStatusNames,
                filesArray: files,
              });
            }
          },
        );
      } catch (error) {
        if (error?.response?.status !== 404) console.error(error);
      }
    }

    if (filteredStatusNames?.length !== statusListName?.length) {
      this.setState({
        ...this.state,
        statusListName: filteredStatusNames,
      });
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
      const arrayStatus = this.state.statusListName;
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

  onEditContentMode = (event) => {
    event.preventDefault();
    this.setState({
      ...this.state,
      modeEditContent: true,
    });
  };

  calcSumWorkTime = (cachesJournalList = []) => {
    return cachesJournalList
      .reduce((startValue, item) => {
        const normalizeValue = item.timeLost.toString().toLowerCase();

        let hour = null;
        let min = null;

        if (normalizeValue.includes('h') || normalizeValue.includes('ч')) {
          const arrayStringHour = normalizeValue.match(/(\w+)[h|ч]/gi) || [];
          hour = !arrayStringHour
            ? 0
            : arrayStringHour.reduce((total, current) => {
                return total + parseFloat(current);
              }, 0) || 0;
        }

        if (normalizeValue.includes('m') || normalizeValue.includes('м')) {
          const arrayStringMin = normalizeValue.match(/(\w+)[m|м]/gi) || [];
          min = !arrayStringMin
            ? 0
            : arrayStringMin.reduce((total, current) => {
                return total + parseFloat(current);
              }, 0);
        }

        const plusValue = !min && hour ? hour : hour && min > 0 ? hour + min / 60 : min > 0 ? min / 60 : 0;
        if (_.isNumber(plusValue)) return startValue + plusValue;
        else return startValue;
      }, 0)
      .toFixed(1);
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
    const { mode, actionType, modeControll, modeEditContent, isLoad = false, type = 'default' } = this.state;

    const { _id: id = '', key = '', status = '', description = '' } = routeDataActive || {};
    return (
      <ModalWindow
        actionTypeList={type}
        onCaching={onCaching}
        actionType={actionType}
        routeDataActive={routeDataActive}
        mode={mode}
        path={path}
        key={key ? key : uuid()}
        keyTask={id ? id : null}
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
      udata: { _id: uid = '' } = {},
      onOpenPageWithData,
      setCurrentTab,
      router = {},
      columnStyleConfig = {},
    } = this.props;

    const {
      modeControll,
      modeControllEdit = {},
      filesArray = [],
      filteredUsers = [],
      isLoad = false,
      modeControllEdit: { tags: tagsListState = [] } = {},
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
      calcSumWorkTime,
      onEditContentMode,
      onAddFileList,
      onRemoveFile,
      onChangeTagList,
    } = this;
    const { rest = {} } = this.context;

    if (!key) return <div>This task not found</div>;

    const [cachesAuthorList, cachesEditorList, cachesJurnalList] = this.getCacheItemsList();
    const accessStatus = this.getAccessStatus();
    const accessPriority = this.getAccessPriority();
    const isRemoteTicket = uidCreater?.includes('__remoteTicket');
    const rulesEdit = uid === uidCreater || isRemoteTicket;
    const rulesStatus = editor.some((editorId) => editorId === uid) || uid === uidCreater || isRemoteTicket;

    const statusClassName = this.getClassNameByStatus();
    const renderMethods = {
      onChangeEditable,
      onChangeEditableStart,
      onChangeTagList,
      onOpenPageWithData,
      onEditContentMode,
      onChangeEditableEnd,
      calcSumWorkTime,
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
                <DescriptionTask commentProps={commonProps} {...descriptionTaskProps} />
              </div>
            </Scrollbars>
          </div>
          <div className="col-6 col-taskDescription">
            <TitleModule classNameTitle="historyTaskTitle" title="Журнал работы" />
            <Scrollbars hideTracksWhenNotNeeded={true}>
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
  const { router = {}, publicReducer = {}, publicReducer: { udata = {} } = {} } = state || {};

  return {
    router,
    publicReducer,
    udata,
    statusList: settingsStatusSelector(state, props),
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
