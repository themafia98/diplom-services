// @ts-nocheck
import React from 'react';
import { modalWindowType } from './types';
import { v4 as uuid } from 'uuid';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import { Modal, Button, message, Select } from 'antd';
import { TASK_CONTROLL_JURNAL_SCHEMA } from '../../Models/Schema/const';
import { createNotification, isTimeLostValue } from '../../Utils';
import SimpleEditableModal from './SimpleEditableModal';
import RegistrationModal from './RegistrationModal';
import ActionList from '../ActionList';
import TrackerModal from './TrackerModal';

import modelContext from '../../Models/context';

const { Option } = Select;

class ModalWindow extends React.PureComponent {
  state = {
    visible: false,
    name: null,
    password: null,
    modeSetTime: null,
    departament: null,
    email: null,
    jurnal: {
      timeLost: null,
      date: moment().format('DD.MM.YYYY HH:mm:ss'),
      description: null,
    },
    description: {
      value: this.props.editableContent || null,
    },
    error: new Set(),
    loading: false,
    taskStatus: null,
    type: null,
  };

  static contextType = modelContext;
  static propTypes = modalWindowType;

  onMessage = (event) => {
    message.warning('Вы в режиме редактирования карточки.');
  };

  onChangeDescription = (event) => {
    const { currentTarget: { value: valueTarget = '' } = {} } = event;
    const { description = {} } = this.state;

    if (valueTarget || valueTarget === '')
      this.setState({
        ...this.state,
        description: {
          ...description,
          value: valueTarget,
        },
      });
  };

  showModal = (event) => {
    const { mode, modeEditContent } = this.props;
    const { modeSetTime } = this.state;
    const { currentTarget = {} } = event;
    let type = mode;

    if (mode !== currentTarget.className.split(' ')[0]) {
      type = currentTarget.className.split(' ')[0];
    }

    this.setState({
      ...this.state,
      modeSetTime: !modeSetTime,
      modeEditContent: !modeEditContent,
      visible: true,
      type: type,
    });
  };

  onRegUser = async () => {
    const { name, password, departament, email, loading, surname } = this.state;

    if (!name && !password && !departament && !email && loading) {
      return;
    }

    try {
      const res = await axios.post('/rest/reg', {
        email,
        password,
        displayName: `${name} ${surname}`,
        departament,
        position: 'Master',
        rules: 'full',
        accept: true,
      });

      if (!res || res.status !== 200) {
        throw new Error('Bad registration data');
      }

      this.setState({ ...this.state, visible: false });
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
    }
  };

  onSaveEdit = (event) => {
    const { description: { value: valueDescription = '' } = {} } = this.state;

    const {
      onUpdate,
      routeDataActive = {},
      routeDataActive: { key = null } = {},
      onCancelEditModeContent,
    } = this.props;
    onUpdate({
      key,
      updateBy: 'key',
      id: routeDataActive?._id,
      updateItem: valueDescription,
      updateField: 'description',
      item: { ...routeDataActive },
      store: 'tasks',
    })
      .then((res) => {
        onCancelEditModeContent(event);
        this.setState({
          ...this.state,
          visible: false,
          type: null,
          modeSetTime: false,
          loading: false,
        });
        message.success('Описание изменено.');
      })
      .catch((error) => {
        message.error('Ошибка редактирования.');
      });
  };

  onTrackTask = async () => {
    const { jurnal } = this.state;

    const {
      onCaching,
      routeDataActive: { key = null, name: nameTask = '' } = {},
      actionType = null,
      keyTask = null,
      udata: { displayName = '', _id: uid = '' } = {},
    } = this.props;
    const item = { ...jurnal, depKey: keyTask, editor: displayName, uid };
    const journalCopy = { ...jurnal };

    if (onCaching) {
      await onCaching({ item, actionType, depStore: 'tasks', store: 'jurnalworks' });
      this.handleCancel();
    }
    const itemNotification = {
      type: 'global',
      title: 'Списание времени в журнал',
      isRead: false,
      message: `
              Работа над задачей ${nameTask}.
              Время затрачено: ${journalCopy?.timeLost}.
              Описание: ${journalCopy.description}. Дата: ${journalCopy?.date}`,
      action: {
        type: 'tasks_link',
        moduleName: 'taskModule',
        link: key,
      },
      uidCreater: uid,
      authorName: displayName,
    };

    createNotification('global', itemNotification).catch((error) => {
      if (error?.response?.status !== 404) console.error(error);
      message.error('Ошибка глобального уведомления');
    });

    return this.setState({
      ...this.state,
      visible: false,
      modeSetTime: false,
      type: null,
      loading: false,
      jurnal: { timeLost: null, date: moment().format('DD.MM.YYYY HH:mm:ss'), description: null },
      error: new Set(),
    });
  };

  onChangeStatusTask = async () => {
    const { taskStatus = null } = this.state;

    const { onUpdate, routeDataActive = {}, routeDataActive: { key = null } = {}, path = '' } = this.props;

    if (_.isNull(taskStatus))
      return this.setState({
        ...this.state,
        visible: false,
        type: null,
        modeSetTime: false,
        loading: false,
      });

    try {
      await onUpdate({
        path,
        id: routeDataActive?._id,
        key,
        updateBy: 'key',
        updateItem: taskStatus,
        updateField: 'status',
        item: { ...routeDataActive },
        store: 'tasks',
      });

      this.setState({
        ...this.state,
        visible: false,
        type: null,
        modeSetTime: false,
        loading: false,
      });
      message.success('Статус изменен.');
    } catch (error) {
      message.error('Ошибка редактирования.');
    }
  };

  handleOk = async (event) => {
    const { visible, type: typeValue, modeSetTime } = this.state;
    const { mode = null, modeEditContent = null } = this.props;
    debugger;
    switch (mode) {
      case 'reg':
        return this.onRegUser(event);
      case 'jur': {
        if (modeEditContent) return this.onSaveEdit(event);

        if (visible && modeSetTime && this.validation()) {
          return this.onTrackTask();
        }

        if (typeValue === 'statusTask') {
          return this.onChangeStatusTask();
        }

        break;
      }
      default:
        return null;
    }
  };

  handleCancel = (event) => {
    this.setState({
      ...this.state,
      visible: false,
      type: null,
      modeSetTime: false,
      loading: false,
      jurnal: { timeLost: null, date: moment().format('DD.MM.YYYY HH:mm:ss'), description: null },
      error: new Set(),
    });
  };

  onChangeSelect = (event) => {
    const { type } = this.state;
    if (type === 'statusTask') {
      this.setState({ ...this.state, taskStatus: event });
    } else this.setState({ ...this.state, departament: event });
  };

  onChange = (event) => {
    const { target } = event;
    if (target.className.split(' ')[1] === 'surname') {
      this.setState({
        ...this.state,
        surname: target.value,
      });
    } else if (target.className.split(' ')[1] === 'name') {
      this.setState({
        ...this.state,
        name: target.value,
      });
    } else if (target.className.split(' ')[1] === 'password') {
      this.setState({
        ...this.state,
        password: target.value,
      });
    } else if (target.className.split(' ')[1] === 'email') {
      this.setState({
        ...this.state,
        email: target.value,
      });
    }
  };

  validation = () => {
    const {
      jurnal: { timeLost = null, date = moment(), description = null },
      error = [],
      modeSetTime,
    } = this.state;

    const { keyTask, modeEditContent } = this.props;
    const { schema = {} } = this.context;
    let _valid = true;
    let invalidDate = !date || !_.isDate(new Date(date));
    let invalidTimeLost = !timeLost || !_.isString(timeLost) || !isTimeLostValue(timeLost);
    let invalidDescription = !description || !_.isString(description);

    if (modeSetTime && !modeEditContent && (invalidDate || invalidTimeLost || invalidDescription)) {
      _valid = false;
      const errorBundle = error.size ? new Set([...error]) : new Set();
      message.error('Не все поля заполнены!');

      if (invalidDate) errorBundle.add('date');
      else if (errorBundle.has('date')) errorBundle.delete('date');
      if (invalidTimeLost) errorBundle.add('timeLost');
      else if (errorBundle.has('timeLost')) errorBundle.delete('timeLost');
      if (invalidDescription) errorBundle.add('description');
      else if (errorBundle.has('description')) errorBundle.delete('description');
      this.setState({ ...this.state, error: errorBundle });
    }
    if (!_valid) return _valid;

    const validData = schema?.getSchema(TASK_CONTROLL_JURNAL_SCHEMA, {
      depKey: keyTask,
      timeLost: timeLost,
      editor: '',
      date: date,
      description: description,
      _id: uuid(),
    });

    if (validData) return _valid;
    else return false;
  };

  onChangeTask = (event) => {
    if (!event) return;

    const { target = {}, _isValid = null } = event;

    if (target && target.value && target.className.split(' ')[1] === 'timeLost') {
      this.setState({
        jurnal: { ...this.state.jurnal, timeLost: target.value },
      });
    } else if (_isValid && event && _isValid) {
      this.setState({
        jurnal: { ...this.state.jurnal, date: event.toString() },
      });
    } else if (
      target &&
      (target.value || target.value === '') &&
      target.className.split(' ')[1] === 'description'
    ) {
      this.setState({
        jurnal: { ...this.state.jurnal, description: target.value },
      });
    }
  };

  onSendMailResponse = (e) => {
    this.showModal(e);
  };

  render() {
    const {
      mode = '',
      statusTaskValue = '',
      accessStatus = [],
      onEdit = null,
      modeControll = null,
      onRejectEdit = null,
      modeEditContent = null,
      defaultView = false,
      onCancelEditModeContent = null,
      onUpdateEditable,
      rulesEdit = true,
      rulesStatus = true,
      isLoadList = true,
      actionTypeList: viewType = 'default',
    } = this.props;
    const { visible = false } = this.state;
    if (defaultView) {
      return <SimpleEditableModal {...this.props} />;
    }

    const { type: typeState = '', modeSetTime = null } = this.state;
    if (mode === 'reg') {
      return (
        <>
          {mode === 'reg' ? (
            <Button aria-label="reg-button" type="primary" onClick={this.showModal}>
              Регистрация
            </Button>
          ) : null}
          <Modal
            className="modalWindow"
            visible={this.state.visible}
            onOk={this.handleOk}
            onCancel={this.handleCancel}
            title={mode === 'reg' ? 'Регистрация' : null}
          >
            {mode === 'reg' ? (
              <RegistrationModal cbOnChange={this.onChange} cbOnChangeSelect={this.onChangeSelect} />
            ) : (
              <div className="empty" />
            )}
          </Modal>
        </>
      );
    } else if (mode === 'jur') {
      const {
        error,
        jurnal: { description, timeLost },
      } = this.state;
      const actionProps = {
        viewType,
        entityName: 'taskView',
        showModal: this.showModal,
        onMessage: this.onMessage,
        onSendMailResponse: this.onSendMailResponse,
        modeControll,
        onUpdateEditable: onUpdateEditable,
        onRejectEdit: onRejectEdit,
        isLoadList,
        rulesStatus,
        rulesEdit,
        onEdit,
      };

      switch (typeState) {
        case 'statusTask': {
          return (
            <div className="dropDownWrapper">
              <ActionList {...actionProps} />
              <Modal
                className="modalWindow changeStatus"
                visible={this.state.visible}
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                title="Смена статуса"
              >
                <Select onChange={this.onChangeSelect} defaultValue={statusTaskValue}>
                  {accessStatus.map((status, i) =>
                    i === 0 ? (
                      <Option key={i + status} value={statusTaskValue}>
                        {statusTaskValue}
                      </Option>
                    ) : (
                      <Option key={i + status} value={status}>
                        {status}
                      </Option>
                    ),
                  )}
                </Select>
              </Modal>
            </div>
          );
        }

        default: {
          const trackProps = {
            modeSetTime,
            visible,
            handleOk: this.handleOk,
            handleCancel: this.handleCancel,
            onChangeTask: this.onChangeTask,
            error,
            timeLost,
            description,
          };
          return (
            <>
              <div className="dropDownWrapper">
                <ActionList {...actionProps} />
              </div>
              {mode === 'jur' && modeEditContent ? (
                <Modal
                  className="modalWindow"
                  visible={modeEditContent}
                  onOk={this.handleOk}
                  onCancel={onCancelEditModeContent}
                  title={'Редактирование'}
                >
                  <TrackerModal {...trackProps} />
                </Modal>
              ) : modeSetTime ? (
                <Modal
                  className="modalWindow"
                  visible={visible}
                  onOk={this.handleOk}
                  onCancel={this.handleCancel}
                  title=" Отчет времени"
                >
                  <TrackerModal {...trackProps} />
                </Modal>
              ) : null}
            </>
          );
        }
      }
    } else return null;
  }
}

export default ModalWindow;
