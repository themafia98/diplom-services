import React, { useCallback, useContext, useEffect, useMemo, useState, memo } from 'react';
import { taskViewType } from '../TaskModule.types';
import { v4 as uuidv4 } from 'uuid';
import _ from 'lodash';
import moment from 'moment';
import { Empty, message, Spin } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import Scrollbars from 'react-custom-scrollbars';
import { routeParser } from 'Utils';
import { TASK_SCHEMA } from 'Models/Schema/const';
import { selectSettingsStatus, selectSettingsTasksPriority } from 'Redux/selectors';
import { loadCacheData, middlewareUpdate } from 'Redux/middleware/publicReducer.thunk';
import ModalWindow from 'Components/ModalWindow';
import Title from 'Components/Title';
import DescriptionTask from './DescriptionTask';
import TaskDescription from './TaskDescription';
import actionsTypes from 'actions.types';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { withClientDb } from 'Models/ClientSideDatabase';
import actionPath from 'actions.path';
import { loadCurrentData } from 'Redux/middleware/routerReducer.thunk';
import { getClassNameByStatus, selectTaskViewCache } from './TaskView.utils';
import fs from 'Utils/Tools/Fs';
import { setAppCache } from 'Redux/reducers/publicReducer.slice';
import LogItem from './LogItem/LogItem';
import { useTranslation } from 'react-i18next';
import ModelContext from 'Models/context';
import { VIEW_ACTION_TYPE } from '../TaskModule.constant';
import { fetchDepUsersList } from './TaskView.api';

const defaultViewModeControllEditValues = {
  key: null,
  status: null,
  name: null,
  priority: null,
  uidCreater: null,
  authorName: null,
  editor: null,
  description: null,
  date: null,
};

const TaskView = memo((props) => {
  const { uuid, clientDB, route, columnStyleConfig } = props;

  const dispatch = useDispatch();
  const { t } = useTranslation();
  const modelsContext = useContext(ModelContext);

  const [shouldRefreshState, setShouldRefreshState] = useState(false);
  const [viewType, setViewType] = useState('default');
  const [viewKey, setViewKey] = useState(uuid);
  const [viewMode] = useState('jur');
  const [viewModeControll, setViewModeControll] = useState('default');
  const [isLoad, setLoaded] = useState(false);
  const [statusListName, setStatusListName] = useState(null);
  const [viewModeControllEditValues, setViewModelControllEditValues] = useState(
    () => defaultViewModeControllEditValues,
  );
  const [actionType] = useState(VIEW_ACTION_TYPE.GET_LOGS);
  const [customTypeModal, setCustomTypeModal] = useState('');
  const [isLoadingFiles, setLoadingFiles] = useState(false);
  const [filesArray, setFilesArray] = useState(null);
  const [filteredUsers, setUsers] = useState(null);
  const [isModeEditContent, setModeEditContent] = useState(false);
  const [findTaskLoading, setFindTaskLoading] = useState(false);
  const [priorityList, setPriorityList] = useState(null);

  const { router, caches, udata, statusList, tasksPriority } = useSelector((state) => {
    const { router, publicReducer } = state;
    const { caches, udata } = publicReducer;
    return {
      router,
      caches,
      udata,
      statusList: selectSettingsStatus(state, props),
      tasksPriority: selectSettingsTasksPriority(state, props),
    };
  });
  const { routeDataActive = null, shouldUpdate = false, currentActionTab = '', path = '' } = router;
  const {
    uidCreater = '',
    key: routeDataActiveKey = '',
    authorName = '',
    editor = '',
    _id: routeDataActiveId = '',
  } = routeDataActive || {};

  const getUsersList = useCallback(async () => {
    if (isLoad) {
      return;
    }

    const result = await fetchDepUsersList(editor);

    if (result === null) {
      message.error(t('taskModule_view_messages_errorLoadUsers'));
      setLoaded(true);
      return;
    }

    const [dataEditor, filteredUsers] = result;

    dispatch(
      setAppCache({
        data: dataEditor,
        load: true,
        union: true,
        customDepKey: `taskView#${viewKey}`,
        uuid: '__editor',
      }),
    );

    setLoaded(true);
    setUsers(filteredUsers);
  }, [dispatch, editor, isLoad, t, viewKey]);

  const onRefreshSettings = useCallback(() => {
    const { settings: statusListSettings = [] } = statusList;
    const { settings: tasksPrioritySettings = [] } = tasksPriority;

    const filteredStatusNames = statusListSettings.map((acc, { value }) => {
      if (value) return [...acc, value];
      return acc;
    }, []);

    const shouldBeUpdateStatusList =
      Array.isArray(statusListName) && filteredStatusNames.length !== statusListName.length;
    const shouldBeSetStatusList = !Array.isArray(statusListName) && !!filteredStatusNames.length;

    if (shouldBeUpdateStatusList || shouldBeSetStatusList) {
      setStatusListName(filteredStatusNames);
    }

    const filteredTasksPriority = tasksPrioritySettings.reduce((acc, { value }) => {
      if (value) return [...acc, value];
      return acc;
    }, []);

    const shouldBeUpdateTasksPriorityList =
      Array.isArray(priorityList) && filteredTasksPriority.length !== priorityList.length;
    const shouldBeSetTasksPriorityList = !Array.isArray(priorityList) && !!filteredTasksPriority.length;

    if (shouldBeUpdateTasksPriorityList || shouldBeSetTasksPriorityList) {
      setPriorityList(filteredTasksPriority);
    }
  }, [priorityList, statusList, statusListName, tasksPriority]);

  const fetchFiles = useCallback(async () => {
    const { rest } = modelsContext;

    if (isLoadingFiles) {
      return;
    }

    try {
      setShouldRefreshState(false);
      setLoadingFiles(true);

      const fileLoaderBody = {
        queryParams: {
          entityId: routeDataActiveId,
        },
      };

      const res = await fs.loadFile('tasks', fileLoaderBody);
      const { response = null } = res.data;

      if (!response.done) {
        throw new Error('Bad fetch files');
      }

      const { metadata } = response;

      let filesList = [];

      if (Array.isArray(metadata)) {
        filesList = metadata;
      } else if (metadata && typeof metadata === 'object') {
        filesList = metadata?.entries;
      }

      const files = filesList.reduce((acc, file) => {
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

      setFilesArray(files);
    } catch (error) {
      if (error?.response?.status !== 404) {
        console.error(error);
      }
    }
  }, [isLoadingFiles, modelsContext, routeDataActiveId]);

  const debounceFetchFiles = useMemo(() => _.debounce(fetchFiles, 400), [fetchFiles]);

  const onLoadTaskAdditionalData = useCallback(async () => {
    if (!viewKey) {
      return;
    }

    dispatch(
      setAppCache({
        data: [{ _id: uidCreater, displayName: authorName, key: routeDataActiveKey || uuidv4() }],
        load: true,
        union: true,
        customDepKey: `taskView#${viewKey}`,
        uuid: '__author',
      }),
    );

    dispatch(
      loadCacheData({
        actionType,
        depKey: viewKey,
        depStore: 'tasks',
        store: 'jurnalworks',
        clientDB,
      }),
    );

    await getUsersList();
    await debounceFetchFiles();
  }, [
    actionType,
    authorName,
    clientDB,
    debounceFetchFiles,
    dispatch,
    getUsersList,
    routeDataActiveKey,
    uidCreater,
    viewKey,
  ]);

  const findTask = useCallback(async () => {
    const { page: path = '', itemId = '' } = routeParser({ pageType: 'moduleItem', path: currentActionTab });

    setFindTaskLoading(true);

    dispatch(
      loadCurrentData({
        action: actionPath.$LOAD_TASKS_LIST,
        path,
        options: {
          itemId,
        },
        optionsForParse: {
          add: true,
        },
        clientDB,
      }),
    );

    await onLoadTaskAdditionalData();
    setFindTaskLoading(false);
  }, [clientDB, currentActionTab, dispatch, onLoadTaskAdditionalData]);

  useEffect(() => {
    if (uuid !== viewKey) {
      setViewKey(uuid);
      return;
    }

    if (uidCreater && uidCreater?.includes('__remoteTicket') && viewType !== 'remote') {
      setViewType('remote');
    }
  }, [uuid, uidCreater, viewType, viewKey]);

  useEffect(() => {
    if (!routeDataActiveKey && !findTaskLoading) {
      findTask();
      return;
    }

    if (!findTaskLoading) {
      onLoadTaskAdditionalData();
    }
  }, [routeDataActiveKey, findTaskLoading, findTask, onLoadTaskAdditionalData]);

  useEffect(() => {
    if (!isLoadingFiles && (shouldUpdate || shouldRefreshState)) {
      debounceFetchFiles();
    }

    onRefreshSettings();
  }, [isLoadingFiles, shouldUpdate, shouldRefreshState, debounceFetchFiles, onRefreshSettings]);

  const onChangeTagList = useCallback(
    (tagsList) => {
      setViewModeControll({
        ...viewModeControll,
        tags: tagsList,
      });
    },
    [viewModeControll],
  );

  const onAddFileList = (fileList) => {
    const shouldRefresh = fileList.every((it) => it.status === 'done');

    setFilesArray(fileList);
    setShouldRefreshState(shouldRefresh);
  };

  const onRemoveFile = useCallback(
    async (file) => {
      try {
        if (!file) {
          return;
        }

        const deleteFileBody = {
          queryParams: {
            file,
          },
        };

        const res = await fs.deleteFile('tasks', deleteFileBody);
        const { response = null } = res.data;

        if (!response.done) {
          throw new Error('Invalid delete file');
        }

        const { metadata: fileParams = {} } = response?.metadata || {};
        const { uid: idClient = '' } = file;
        const { id: idResponse = '' } = fileParams;

        if (idClient !== idResponse) {
          throw new Error('id files not equal');
        }

        setFilesArray(filesArray.filter((it) => it.uid !== idResponse));
        message.success(t('taskModule_view_messages_fileDelete'));
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.error(error);
        }
        message.error(t('taskModule_view_messages_errorFileDelete'));
      }
    },
    [filesArray, t],
  );

  const onEdit = () => {
    setModeEditContent(false);
    setViewModeControll('edit');
    setViewModelControllEditValues({ ...routeDataActive });
  };

  const onRejectEdit = () => {
    setViewModeControll('default');
    setModeEditContent(false);
    setViewModelControllEditValues(defaultViewModeControllEditValues);
  };

  const onChangeEditableStart = useCallback(
    (event) => {
      const dateString = event && event._d ? moment(event._d, 'DD.MM.YYYY').format('DD.MM.YYYY') : null;

      const { date } = viewModeControllEditValues;

      let newDate = [dateString];

      if (date) {
        newDate = date;
        newDate[0] = dateString;
      }

      setModeEditContent(false);
      setViewModelControllEditValues({
        ...viewModeControllEditValues,
        date: newDate,
      });
    },
    [viewModeControllEditValues],
  );

  const onChangeEditableEnd = useCallback(
    (event) => {
      const dateString = event && event._d ? moment(event._d, 'DD.MM.YYYY').format('DD.MM.YYYY') : null;
      const { date } = viewModeControllEditValues;

      let newDate = [dateString];

      if (date) {
        newDate = date;
        newDate[1] = dateString;
      }

      setModeEditContent(false);
      setViewModelControllEditValues({
        ...viewModeControllEditValues,
        date: newDate,
      });
    },
    [viewModeControllEditValues],
  );

  const onChangeEditable = useCallback(
    (event) => {
      const { currentTarget = {}, currentTarget: { value = '' } = {} } = event;

      if (event && typeof event === 'object' && currentTarget && !_.isEmpty(currentTarget)) {
        setModeEditContent(false);
        setViewModelControllEditValues({
          ...viewModeControllEditValues,
          name: value,
        });
        return;
      }

      if (event && typeof event === 'object' && Array.isArray(event)) {
        setModeEditContent(false);
        setViewModelControllEditValues({
          ...viewModeControllEditValues,
          editor: [...event],
        });
        return;
      }

      if (typeof event === 'string') {
        if (Array.isArray(statusListName) && statusListName.some((it) => it === event)) {
          setModeEditContent(false);
          setViewModelControllEditValues({
            ...viewModeControllEditValues,
            status: event,
          });
          return;
        }

        setModeEditContent(false);
        setViewModelControllEditValues({
          ...viewModeControllEditValues,
          priority: event,
        });
        return;
      }
    },
    [statusListName, viewModeControllEditValues],
  );

  const onUpdateEditable = (event) => {
    const { schema } = modelsContext;

    const validHash = [viewModeControllEditValues]
      .map((it) => schema?.getSchema(TASK_SCHEMA, it))
      .filter(Boolean)[0];

    if (!validHash) {
      return;
    }

    const { _id: id = '', key = '' } = viewModeControllEditValues;

    try {
      const parsedRoutePath =
        !route || (route && _.isEmpty(route))
          ? routeParser({
              pageType: 'moduleItem',
              path,
            })
          : route;

      dispatch(
        middlewareUpdate({
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
        }),
      );

      onRejectEdit(event);

      message.success(t('taskModule_view_messages_taskRefresh'));
    } catch (error) {
      message.error(t('taskModule_view_messages_errorTaskRefresh'));
    }
  };

  const onCancelEditModeContent = () => setModeEditContent(false);

  const onEditContentMode = (event, customTypeModal) => {
    event.preventDefault();

    setModeEditContent(true);
    setCustomTypeModal(customTypeModal);
  };

  const { cachesAuthorList, cachesEditorList, cachesJurnalList } = useMemo(
    () => selectTaskViewCache(caches, uuid),
    [caches, uuid],
  );

  const logsList = useMemo(() => {
    if (!cachesJurnalList) {
      return null;
    }

    cachesJurnalList.map((item, index) => {
      const date = item && Array.isArray(item.date) ? item.date[0] : 'Invalid date';

      let message = t('taskModule_view_notSet');
      let dateProp = t('taskModule_view_notSet');
      let timeLostProp = t('taskModule_view_notSet');

      if (item?.date && date !== 'Invalid date') {
        dateProp = date;
      } else if (item[0]) {
        dateProp = item[0].date;
      }

      if (item?.timeLost) {
        timeLostProp = item.timeLost;
      } else if (item[0]) {
        timeLostProp = item[0].timeLost;
      }

      if (item?.description) {
        message = item.description;
      } else if (Array.isArray(item) && item[0]?.description) {
        message = item[0].description;
      }

      return (
        <LogItem
          index={`${item?._id}${index}${date}`}
          editor={item.editor}
          timeLost={timeLostProp}
          date={dateProp}
          title={t('taskModule_view_spendTime')}
          message={message}
        />
      );
    });
  }, [cachesJurnalList, t]);

  const { _id: uid } = udata;
  const { tags: tagsListState = [] } = viewModeControllEditValues;

  const { key, status, priority, name, date, tags: tagsView, description } = routeDataActive;

  const accessPriority = useMemo(() => {
    if (!key) {
      return null;
    }

    const { priority: priorityState = '' } = viewModeControllEditValues;
    const { priority } = router.routeDataActive;

    if (!priorityList || !Array.isArray(priorityList)) {
      return null;
    }

    return _.uniq([priorityState ? priorityState : priority ? priority : null, ...priorityList]).filter(
      Boolean,
    );
  }, [key, priorityList, router.routeDataActive, viewModeControllEditValues]);

  const statusClassName = useMemo(() => getClassNameByStatus(status), [status]);

  const isRemoteTicket = uidCreater?.includes('__remoteTicket');
  const rulesEdit = uid === uidCreater || isRemoteTicket;
  const rulesStatus =
    (Array.isArray(editor) && editor.some((editorId) => editorId === uid)) ||
    uid === uidCreater ||
    isRemoteTicket;

  const renderMethods = useMemo(
    () => ({
      onChangeEditable,
      onChangeEditableStart,
      onChangeTagList,
      onEditContentMode,
      onChangeEditableEnd,
      onAddFileList,
      onRemoveFile,
    }),
    [onChangeEditable, onChangeEditableEnd, onChangeEditableStart, onChangeTagList, onRemoveFile],
  );

  const commonProps = useMemo(
    () => ({
      ...renderMethods,
      depDataKey: 'global',
      cachesAuthorList,
      cachesEditorList,
      cachesJurnalList,
      filteredUsers,
      router,
    }),
    [cachesAuthorList, cachesEditorList, cachesJurnalList, filteredUsers, renderMethods, router],
  );

  const descriptionTaskProps = useMemo(
    () => ({
      ...commonProps,
      description,
      rulesEdit,
      filesArray,
      path: currentActionTab,
    }),
    [commonProps, currentActionTab, description, filesArray, rulesEdit],
  );

  const renderProps = useMemo(
    () => ({
      ...commonProps,
      modeControllEdit: viewModeControllEditValues,
      statusClassName,
      accessPriority,
      modeControll: viewModeControll,
      accessStatus: statusListName,
      uidCreater,
      tagList: tagsView ? _.uniqBy([...tagsListState, ...tagsView], 'id') : null,
      tagsView,
      priority,
      status,
      isLoad,
      editor,
      name,
      date,
      taskKey: key,
    }),
    [
      accessPriority,
      commonProps,
      date,
      editor,
      isLoad,
      key,
      name,
      priority,
      status,
      statusClassName,
      statusListName,
      tagsListState,
      tagsView,
      uidCreater,
      viewModeControll,
      viewModeControllEditValues,
    ],
  );

  if (!key && findTaskLoading) {
    return (
      <div className="taskView taskView--taskLoader">
        <Spin size="large" tip={t('taskModule_view_loading')} />
      </div>
    );
  }

  if (!key) {
    return <div>{t('taskModule_view_notFound')}</div>;
  }

  return (
    <Scrollbars hideTracksWhenNotNeeded>
      <Title classNameTitle="taskModuleTitle" title={t('taskModule_view_title')} />
      <ModalWindow
        key={key}
        actionTypeList={viewType}
        actionType={actionType}
        mode={viewMode}
        path={path}
        route={route}
        keyTask={routeDataActiveId ? routeDataActiveId : null}
        accessStatus={statusListName}
        description={description}
        onRejectEdit={onRejectEdit}
        modeControll={viewModeControll}
        editableContent={description}
        modeEditContent={isModeEditContent}
        onCancelEditModeContent={onCancelEditModeContent}
        onUpdateEditable={onUpdateEditable}
        statusTaskValue={status ? status : null}
        rulesEdit={rulesEdit}
        onEdit={onEdit}
        rulesStatus={rulesStatus}
        isLoadList={isLoad}
        customTypeModal={customTypeModal}
      />
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
          <Title classNameTitle="historyTaskTitle" title={t('taskModule_view_workHistory')} />
          <Scrollbars hideTracksWhenNotNeeded>
            {!cachesJurnalList?.length ? (
              <Empty description={<span>{t('globalMessages_empty')}</span>} />
            ) : (
              logsList
            )}
          </Scrollbars>
        </div>
      </div>
    </Scrollbars>
  );
});

TaskView.propTypes = taskViewType;
TaskView.defaultProps = {
  columnStyleConfig: { xxl: 1, xl: 1, lg: 1, d: 1, sm: 1, xs: 1 },
  modeControllEdit: {},
};

export { TaskView };
export default compose(moduleContextToProps, withClientDb)(TaskView);
