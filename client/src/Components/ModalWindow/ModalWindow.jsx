import React, { memo, useEffect, useCallback, useMemo, useReducer, useContext } from 'react';
import { modalWindowType } from './Modal.types';
import _ from 'lodash';
import moment from 'moment';
import { Modal, Button, message, Select } from 'antd';
import { TASK_CONTROLL_JURNAL_SCHEMA } from 'Models/Schema/const';
import { createNotification, isTimeLostValue, routeParser } from 'Utils';
import SimpleEditableModal from './SimpleEditableModal';
import RegistrationModal from './RegistrationModal';
import ActionList from 'Components/ActionList';
import TrackerModal from './TrackerModal';
import MailResponserModal from './MailResponserModal';

import Textarea from 'Components/Textarea';
import ModelContext from 'Models/context';
import actionsTypes from 'actions.types';
import { withClientDb } from 'Models/ClientSideDatabase';
import { reducer, modalState } from './Modal.utils';
import { ACTIONS } from './Modal.constant';

const { Option } = Select;

const ModalWindow = memo((props) => {
  const {
    modeControll,
    onRejectEdit,
    modeEditContent,
    defaultView,
    onCancelEditModeContent,
    onUpdateEditable,
    rulesEdit,
    rulesStatus,
    isLoadList,
    routeDataActive,
    actionTypeList: viewType,
    onUpdate,
    route,
    path,
    mode,
    customTypeModal,
    clientDB,
    keyTask,
    accessStatus,
    statusTaskValue,
    editableContent,
    onEdit,
  } = props;

  const { key: keyActiveRoute = null, _id: id = '', name: nameActive = '' } = routeDataActive || {};
  const [state, dispatch] = useReducer(reducer, modalState);

  const context = useContext(ModelContext);

  const { type: typeView = '' } = state;
  const {
    [typeView]: visible = false,
    description: { value: valueDesc = '' } = {},
    error,
    jurnal: { description, timeLost },
  } = state;

  const runAction = useMemo(
    () => ({
      onChangeTypeAction: (payload) => dispatch({ type: ACTIONS.CHANGE_TYPE, payload }),
      onChangeDescriptionAction: (payload) => dispatch({ type: ACTIONS.CHANGE_DESCRIPTION, payload }),
      onChangeRootState: (payload) => dispatch({ type: ACTIONS.CHANGE_ROOT, payload }),
    }),
    [],
  );

  useEffect(() => {
    const { type } = state;

    if (customTypeModal === 'editDescription' && editableContent && state?.description?.value === null) {
      runAction.onChangeDescriptionAction({ ...state.description, value: editableContent });
    }

    if (modeEditContent && customTypeModal && customTypeModal !== type) {
      runAction.onChangeTypeAction(customTypeModal);
      return;
    }
    if (mode === 'reg' && type === null) {
      runAction.onChangeTypeAction('regType');
      return;
    }
  }, [customTypeModal, editableContent, mode, modeEditContent, runAction, state]);

  const onMessage = (event) => {
    message.warning('Вы в режиме редактирования карточки.');
  };

  const onChangeDescription = (event) => {
    const { currentTarget: { value } = {} } = event;
    const { description } = state;

    if (value || value === '') {
      runAction.onChangeDescriptionAction({ ...description, value });
    }
  };

  const showModal = useCallback(
    (event, type = '') => {
      const { [type]: visibleType = false } = state;

      runAction.onChangeRootState({
        [type]: !visibleType,
        visible: true,
        type,
      });
    },
    [runAction, state],
  );

  const onRegUser = useCallback(async () => {
    const { reg: { name, password, departament, email, surname } = {}, type = '', loading } = state;
    const { Request } = context;

    if (!name || !password || !departament || !email || loading) {
      message.warning('Не все поля заполнены');
      return;
    }

    try {
      const rest = new Request();
      const res = await rest.sendRequest(
        '/reg',
        'POST',
        {
          actionType: actionsTypes.$REG_USER,
          user: {
            email,
            password,
            displayName: `${name} ${surname}`,
            departament,
            position: 'Master',
          },
        },
        false,
      );

      if (!res || res.status !== 200) {
        throw new Error('Bad registration data');
      }

      runAction.onChangeRootState({ ...state, [type]: false });
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
    }
  }, [context, runAction, state]);

  const onSaveEdit = useCallback(
    async (event) => {
      const { description: { value: valueDescription } = {}, type: typeState } = state;

      const parsedRoutePath =
        !route || (route && _.isEmpty(route))
          ? routeParser({
              pageType: 'moduleItem',
              path,
            })
          : route;
      try {
        await onUpdate({
          actionType: actionsTypes.$UPDATE_SINGLE,
          parsedRoutePath,
          key: keyActiveRoute,
          updateBy: '_id',
          id: routeDataActive?._id,
          updateItem: valueDescription,
          updateField: 'description',
          item: { ...routeDataActive },
          store: 'tasks',
          clientDB,
        });
        if (onCancelEditModeContent) onCancelEditModeContent(event);

        runAction.onChangeRootState({
          ...state,
          [typeState]: false,
          type: null,
          loading: false,
        });

        message.success('Описание изменено.');
      } catch (error) {
        console.error(error);
        message.error('Ошибка редактирования.');
      }
    },
    [
      clientDB,
      keyActiveRoute,
      onCancelEditModeContent,
      onUpdate,
      path,
      route,
      routeDataActive,
      runAction,
      state,
    ],
  );

  const getTemplate = useCallback(
    (nameTask, timeLost, description, date) => `
    Работа над задачей ${nameTask}.\n
    Время затрачено: ${timeLost}.\n
    Дата: ${date}. \n
    Описание: ${description}. \n
    `,
    [],
  );

  const handleCancel = useCallback(
    (event) => {
      const { type = '' } = state;
      runAction.onChangeRootState({
        ...state,
        [type]: false,
        loading: false,
        jurnal: { timeLost: null, date: moment().format('DD.MM.YYYY HH:mm:ss'), description: null },
        error: new Set(),
      });
    },
    [runAction, state],
  );

  const onTrackTask = useCallback(async () => {
    const { jurnal, type } = state;

    const {
      onCaching,
      actionType,
      keyTask,
      udata: { displayName = '', _id: uid = '' },
      clientDB,
    } = props;

    const item = { ...jurnal, depKey: keyTask, editor: displayName, uid };
    const { timeLost = '', description = '', date = '' } = jurnal;

    if (onCaching) {
      await onCaching({ item, actionType, depStore: 'tasks', store: 'jurnalworks', clientDB });
      handleCancel();
    }
    const itemNotification = {
      type: 'global',
      title: 'Списание времени в журнал',
      isRead: false,
      message: getTemplate(nameActive, timeLost, description, date),
      action: {
        type: 'tasks_link',
        moduleName: 'taskModule',
        link: id ? id : keyActiveRoute,
      },
      uidCreater: uid,
      authorName: displayName,
    };

    createNotification('global', itemNotification).catch((error) => {
      if (error?.response?.status !== 404) console.error(error);
      message.error('Ошибка глобального уведомления');
    });

    runAction.onChangeRootState({
      ...state,
      [type]: false,
      type: null,
      loading: false,
      jurnal: { timeLost: null, date: moment().format('DD.MM.YYYY HH:mm:ss'), description: null },
      error: new Set(),
    });
  }, [getTemplate, handleCancel, id, keyActiveRoute, nameActive, props, runAction, state]);

  const validation = useCallback(() => {
    const {
      jurnal: { timeLost = null, date = moment(), description = null },
      error,
      type,
    } = state;

    const { udata: { displayName = '' } = {} } = props;
    const { schema = {} } = context;

    let _valid = true;

    let invalidDate = !date || !_.isDate(new Date(date));
    let invalidTimeLost = !timeLost || typeof timeLost !== 'string' || !isTimeLostValue(timeLost);
    let invalidDescription = !description || typeof description !== 'string';

    if (type === 'jur' && !modeEditContent && (invalidDate || invalidTimeLost || invalidDescription)) {
      _valid = false;
      const errorBundle = error.size ? new Set([...error]) : new Set();
      message.error('Не все поля заполнены!');

      if (invalidDate) errorBundle.add('date');
      else if (errorBundle.has('date')) errorBundle.delete('date');
      if (invalidTimeLost) errorBundle.add('timeLost');
      else if (errorBundle.has('timeLost')) errorBundle.delete('timeLost');
      if (invalidDescription) errorBundle.add('description');
      else if (errorBundle.has('description')) errorBundle.delete('description');
      runAction.onChangeRootState({ ...state, error: errorBundle });
    }

    if (!_valid) return _valid;

    const validData = schema?.getSchema(TASK_CONTROLL_JURNAL_SCHEMA, {
      depKey: keyTask,
      timeLost: timeLost,
      editor: displayName,
      date: date,
      description: description,
    });

    if (validData) return _valid;
    else return false;
  }, [context, keyTask, modeEditContent, props, runAction, state]);

  const onChangeStatusTask = useCallback(
    async (customStatus = null) => {
      const { taskStatus = null, type } = state;

      if (taskStatus === null && typeof customStatus !== 'string') {
        return runAction.onChangeRootState({
          ...state,
          [type]: false,
          type: null,
          loading: false,
        });
      }

      try {
        const parsedRoutePath =
          !route || (route && _.isEmpty(route))
            ? routeParser({
                pageType: 'moduleItem',
                path,
              })
            : route;

        await onUpdate({
          actionType: actionsTypes.$UPDATE_SINGLE,
          parsedRoutePath,
          path,
          id: routeDataActive?._id,
          key: keyActiveRoute,
          updateBy: '_id',
          updateItem: typeof customStatus === 'string' ? customStatus : taskStatus,
          updateField: 'status',
          item: { ...routeDataActive },
          store: 'tasks',
          clientDB,
        });

        runAction.onChangeRootState({
          ...state,
          [type]: false,
          type: null,
          loading: false,
        });
        message.success('Статус изменен.');
      } catch (error) {
        message.error('Ошибка редактирования.');
      }
    },
    [clientDB, keyActiveRoute, onUpdate, path, route, routeDataActive, runAction, state],
  );

  const handleOk = useCallback(
    async (event, action = '', response = '') => {
      const { type } = state;

      if (action === 'close') {
        showModal(event, type, response, action);
        onChangeStatusTask('Закрыт');
      }

      if (type === 'regType') return onRegUser(event);
      else if (type === 'jur' && validation()) return onTrackTask();
      else if (type === 'statusTask') return onChangeStatusTask();
      else if (type === 'editDescription') return onSaveEdit(event);

      message.warning('Not found event handler for save modalWindow action');
    },
    [onChangeStatusTask, onRegUser, onSaveEdit, onTrackTask, showModal, state, validation],
  );

  const onChangeSelect = useCallback(
    (event) => {
      const { type, reg = {} } = state;
      if (type === 'statusTask') {
        runAction.onChangeRootState({ ...state, taskStatus: event });
      } else runAction.onChangeRootState({ ...state, reg: { ...reg, departament: event } });
    },
    [runAction, state],
  );

  const onChange = useCallback(
    (event) => {
      const { type = '' } = state;
      const { target: { value = '', className = '' } = {} } = event;
      const param = className?.split(' ')[1];
      if (!param) return;

      const newState =
        type === 'regType'
          ? {
              ...state,
              reg: {
                ...state.reg,
                [param]: value,
              },
            }
          : {
              ...state,
              [param]: value,
            };

      runAction.onChangeRootState(newState);
    },
    [runAction, state],
  );

  const onChangeTask = (event) => {
    if (!event) return;
    const { jurnal = {} } = state;

    const { target: { value = '', className = '' } = {}, _isValid = null } = event;

    const typeChanges = className?.split(' ')[1];

    if (value && typeChanges === 'timeLost') {
      runAction.onChangeRootState({
        ...state,
        jurnal: { ...jurnal, timeLost: value },
      });
    } else if (_isValid && event && _isValid) {
      runAction.onChangeRootState({
        ...state,
        jurnal: { ...jurnal, date: event.toString() },
      });
    } else if ((value || value === '') && typeChanges === 'description') {
      runAction.onChangeRootState({
        ...state,
        jurnal: { ...jurnal, description: value },
      });
    }
  };

  const renderRegistrationModal = useCallback(() => {
    const { type = '' } = state;
    const { [type]: visible = false } = state;
    return (
      <>
        <Button aria-label="reg-button" type="primary" onClick={(event) => showModal(event, 'regType')}>
          Регистрация
        </Button>
        <Modal
          className="modalWindow"
          visible={visible}
          onOk={handleOk}
          onCancel={handleCancel}
          title="Регистрация"
        >
          <RegistrationModal cbOnChange={onChange} cbOnChangeSelect={onChangeSelect} />
        </Modal>
      </>
    );
  }, [handleCancel, handleOk, onChange, onChangeSelect, showModal, state]);

  const renderChangerStatusModal = useCallback(
    (actionProps = {}) => {
      const { type = '' } = state;
      const { [type]: visible = false } = state;

      return (
        <div className="dropDownWrapper">
          <ActionList {...actionProps} />
          <Modal
            className="modalWindow changeStatus"
            visible={visible}
            onOk={handleOk}
            onCancel={handleCancel}
            title="Смена статуса"
          >
            <Select onChange={onChangeSelect} defaultValue={statusTaskValue}>
              {accessStatus.map((status, index) => {
                return (
                  <Option key={`${index}${status}`} label={status} value={status}>
                    {status}
                  </Option>
                );
              })}
            </Select>
          </Modal>
        </div>
      );
    },
    [accessStatus, handleCancel, handleOk, onChangeSelect, state, statusTaskValue],
  );

  if (defaultView) {
    return <SimpleEditableModal {...props} />;
  }

  if (typeView === 'regType') {
    return renderRegistrationModal();
  }

  const actionProps = {
    viewType,
    entityName: 'taskView',
    onMessage: onMessage,
    showModal: showModal,
    onEdit: onEdit,
    modeControll,
    onUpdateEditable: onUpdateEditable,
    onRejectEdit: onRejectEdit,
    isLoadList,
    rulesStatus,
    rulesEdit,
  };

  if (typeView === 'statusTask') {
    return renderChangerStatusModal({
      ...actionProps,
    });
  }

  const trackProps = {
    typeView,
    visible,
    handleOk: handleOk,
    handleCancel: handleCancel,
    onChangeTask: onChangeTask,
    error,
    timeLost,
    description,
  };
  const isVisibleMailResponser = visible && typeView === 'mailResponse';

  return (
    <>
      <div className="dropDownWrapper">
        <ActionList {...actionProps} showModal={showModal} />
      </div>
      {isVisibleMailResponser ? (
        <MailResponserModal
          handleCancel={handleCancel}
          handleOk={handleOk}
          routeDataActive={routeDataActive}
          typeView={typeView}
          visibleModal={isVisibleMailResponser}
        />
      ) : (
        <Modal
          className="modalWindow"
          visible={visible || modeEditContent}
          onOk={handleOk}
          destroyOnClose={true}
          onCancel={modeEditContent ? onCancelEditModeContent : handleCancel}
          title={modeEditContent ? 'Редактирование' : 'Отчет времени'}
        >
          {modeEditContent ? (
            <Textarea
              key="textAreaEdit"
              className="editContentDescription"
              row={10}
              onChange={onChangeDescription}
              value={valueDesc ? valueDesc : ''}
              defaultValue={valueDesc ? valueDesc : ''}
            />
          ) : visible && typeView === 'jur' ? (
            <TrackerModal {...trackProps} />
          ) : null}
        </Modal>
      )}
    </>
  );
});

ModalWindow.propTypes = modalWindowType;
ModalWindow.defaultProps = {
  onEdit: null,
  modeControll: null,
  onRejectEdit: null,
  modeEditContent: null,
  defaultView: false,
  onCancelEditModeContent: null,
  onUpdateEditable: null,
  rulesEdit: true,
  rulesStatus: true,
  isLoadList: true,
  routeDataActive: {},
  route: null,
  actionTypeList: 'default',
  mode: '',
  actionType: '',
  keyTask: '',
  udata: {},
  path: '',
  statusTaskValue: '',
  accessStatus: [],
  customTypeModal: '',
  clientDB: null,
};

export default withClientDb(ModalWindow);
