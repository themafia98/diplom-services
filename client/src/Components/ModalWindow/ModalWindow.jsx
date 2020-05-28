import React from 'react';
import { modalWindowType } from './types';
import _ from 'lodash';
import moment from 'moment';
import { Modal, Button, message, Select } from 'antd';
import { TASK_CONTROLL_JURNAL_SCHEMA } from 'Models/Schema/const';
import { createNotification, isTimeLostValue } from 'Utils';
import SimpleEditableModal from './SimpleEditableModal';
import RegistrationModal from './RegistrationModal';
import ActionList from 'Components/ActionList';
import TrackerModal from './TrackerModal';
import MailResponserModal from './MailResponserModal';

import Textarea from 'Components/Textarea';
import modelContext from 'Models/context';

const { Option } = Select;

class ModalWindow extends React.PureComponent {
  state = {
    visible: false,
    reg: {
      name: null,
      password: null,
      departament: null,
      email: null,
      surname: null,
    },
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
  static defaultProps = {
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
    actionTypeList: 'default',
    mode: '',
    actionType: '',
    keyTask: '',
    udata: {},
    path: '',
    statusTaskValue: '',
    accessStatus: [],
  };

  static getDerivedStateFromProps = (props, state) => {
    const { mode } = props;
    const { type = '' } = state;

    if (mode === 'reg' && _.isNull(type)) {
      return {
        ...state,
        type: 'regType',
      };
    }
    return state;
  };

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

  showModal = (event, type = '') => {
    const { [type]: visibleType = false } = this.state;

    this.setState({
      ...this.state,
      [type]: !visibleType,
      visible: true,
      type,
    });
  };

  onRegUser = async () => {
    const { reg: { name, password, departament, email, surname } = {}, type = '', loading } = this.state;
    const { Request } = this.context;

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
          email,
          password,
          displayName: `${name} ${surname}`,
          departament,
          position: 'Master',
          rules: 'full',
          accept: true,
        },
        false,
      );

      if (!res || res.status !== 200) {
        throw new Error('Bad registration data');
      }

      this.setState({ ...this.state, [type]: false });
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
    }
  };

  onSaveEdit = (event) => {
    const { description: { value: valueDescription = '' } = {}, type: typeState = '' } = this.state;

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
        if (onCancelEditModeContent) onCancelEditModeContent(event);
        this.setState({
          ...this.state,
          [typeState]: false,
          type: null,
          loading: false,
        });
        message.success('Описание изменено.');
      })
      .catch((error) => {
        message.error('Ошибка редактирования.');
      });
  };

  getTemplate = (nameTask, timeLost, description, date) => {
    return `
    Работа над задачей ${nameTask}.\n
    Время затрачено: ${timeLost}.\n
    Дата: ${date}. \n
    Описание: ${description}. \n
    `;
  };

  onTrackTask = async () => {
    const { jurnal, type = '' } = this.state;

    const {
      onCaching,
      routeDataActive: { key = null, name: nameTask = '' } = {},
      actionType,
      keyTask,
      udata: { displayName = '', _id: uid = '' } = {},
    } = this.props;
    const item = { ...jurnal, depKey: keyTask, editor: displayName, uid };
    const { timeLost = '', description = '', date = '' } = jurnal || {};

    if (onCaching) {
      await onCaching({ item, actionType, depStore: 'tasks', store: 'jurnalworks' });
      this.handleCancel();
    }
    const itemNotification = {
      type: 'global',
      title: 'Списание времени в журнал',
      isRead: false,
      message: this.getTemplate(nameTask, timeLost, description, date),
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
      [type]: false,
      type: null,
      loading: false,
      jurnal: { timeLost: null, date: moment().format('DD.MM.YYYY HH:mm:ss'), description: null },
      error: new Set(),
    });
  };

  onChangeStatusTask = async (customStatus = null) => {
    const { taskStatus = null, type = '' } = this.state;

    const { onUpdate, routeDataActive = {}, routeDataActive: { key = null } = {}, path } = this.props;

    if (_.isNull(taskStatus) && !_.isString(customStatus))
      return this.setState({
        ...this.state,
        [type]: false,
        type: null,
        loading: false,
      });

    try {
      await onUpdate({
        path,
        id: routeDataActive?._id,
        key,
        updateBy: 'key',
        updateItem: _.isString(customStatus) ? customStatus : taskStatus,
        updateField: 'status',
        item: { ...routeDataActive },
        store: 'tasks',
      });

      this.setState({
        ...this.state,
        [type]: false,
        type: null,
        loading: false,
      });
      message.success('Статус изменен.');
    } catch (error) {
      message.error('Ошибка редактирования.');
    }
  };

  handleOk = async (event, action = '', response = '') => {
    const { type } = this.state;
    debugger;
    if (action === 'close') {
      this.showModal(event, type, response, action);
      this.onChangeStatusTask('Закрыт');
    }

    if (type === 'regType') return this.onRegUser(event);
    else if (type === 'jur' && this.validation()) return this.onTrackTask();
    else if (type === 'statusTask') return this.onChangeStatusTask();
  };

  handleCancel = (event) => {
    const { type = '' } = this.state;
    this.setState({
      ...this.state,
      [type]: false,
      loading: false,
      jurnal: { timeLost: null, date: moment().format('DD.MM.YYYY HH:mm:ss'), description: null },
      error: new Set(),
    });
  };

  onChangeSelect = (event) => {
    const { type, reg = {} } = this.state;
    if (type === 'statusTask') {
      this.setState({ ...this.state, taskStatus: event });
    } else this.setState({ ...this.state, reg: { ...reg, departament: event } });
  };

  onChange = (event) => {
    const { type = '' } = this.state;
    const { target: { value = '', className = '' } = {} } = event;
    const param = className?.split(' ')[1];
    if (!param) return;

    const newState =
      type === 'regType'
        ? {
            ...this.state,
            reg: {
              ...this.state.reg,
              [param]: value,
            },
          }
        : {
            ...this.state,
            [param]: value,
          };

    this.setState(newState);
  };

  validation = () => {
    const {
      jurnal: { timeLost = null, date = moment(), description = null },
      error = [],
      udata: { displayName = '' } = {},
      type = '',
    } = this.state;

    const { keyTask, modeEditContent } = this.props;
    const { schema = {} } = this.context;
    let _valid = true;
    let invalidDate = !date || !_.isDate(new Date(date));
    let invalidTimeLost = !timeLost || !_.isString(timeLost) || !isTimeLostValue(timeLost);
    let invalidDescription = !description || !_.isString(description);

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
      this.setState({ ...this.state, error: errorBundle });
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
  };

  onChangeTask = (event) => {
    if (!event) return;
    const { jurnal = {} } = this.state;
    const { target: { value = '', className = '' } = {}, _isValid = null } = event;
    const typeChanges = className?.split(' ')[1];

    if (value && typeChanges === 'timeLost') {
      this.setState({
        ...this.state,
        jurnal: { ...jurnal, timeLost: value },
      });
    } else if (_isValid && event && _isValid) {
      this.setState({
        ...this.state,
        jurnal: { ...jurnal, date: event.toString() },
      });
    } else if ((value || value === '') && typeChanges === 'description') {
      this.setState({
        ...this.state,
        jurnal: { ...jurnal, description: value },
      });
    }
  };

  renderRegistrationModal = () => {
    const { type = '' } = this.state;
    const { [type]: visible = false } = this.state;
    return (
      <>
        <Button aria-label="reg-button" type="primary" onClick={(event) => this.showModal(event, 'regType')}>
          Регистрация
        </Button>
        <Modal
          className="modalWindow"
          visible={visible}
          onOk={this.handleOk}
          onCancel={this.handleCancel}
          title={'Регистрация'}
        >
          <RegistrationModal cbOnChange={this.onChange} cbOnChangeSelect={this.onChangeSelect} />
        </Modal>
      </>
    );
  };

  renderChangerStatusModal = (actionProps = {}) => {
    const { statusTaskValue, accessStatus } = this.props;
    const { type = '' } = this.state;
    const { [type]: visible = false } = this.state;
    return (
      <div className="dropDownWrapper">
        <ActionList {...actionProps} />
        <Modal
          className="modalWindow changeStatus"
          visible={visible}
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
  };

  render() {
    const {
      onEdit,
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
      actionTypeList: viewType = 'default',
    } = this.props;
    const { type: typeView = '' } = this.state;
    const {
      [typeView]: visible = false,
      description: { value: valueDesc = '' } = {},
      error,
      jurnal: { description, timeLost },
    } = this.state;

    if (defaultView) {
      return <SimpleEditableModal {...this.props} />;
    }

    if (typeView === 'regType') {
      return this.renderRegistrationModal();
    }

    const actionProps = {
      viewType,
      entityName: 'taskView',
      onMessage: this.onMessage,
      showModal: this.showModal,
      modeControll,
      onUpdateEditable: onUpdateEditable,
      onRejectEdit: onRejectEdit,
      isLoadList,
      rulesStatus,
      rulesEdit,
      onEdit,
    };

    if (typeView === 'statusTask') {
      return this.renderChangerStatusModal({
        ...actionProps,
      });
    }

    const trackProps = {
      typeView,
      visible,
      handleOk: this.handleOk,
      handleCancel: this.handleCancel,
      onChangeTask: this.onChangeTask,
      error,
      timeLost,
      description,
    };
    const isVisibleMailResponser = visible && typeView === 'mailResponse';

    return (
      <>
        <div className="dropDownWrapper">
          <ActionList {...actionProps} showModal={this.showModal} />
        </div>
        {isVisibleMailResponser ? (
          <MailResponserModal
            handleCancel={this.handleCancel}
            handleOk={this.handleOk}
            routeDataActive={routeDataActive}
            typeView={typeView}
            visibleModal={isVisibleMailResponser}
          />
        ) : (
          <Modal
            className="modalWindow"
            visible={visible || modeEditContent}
            onOk={this.handleOk}
            destroyOnClose={true}
            onCancel={modeEditContent ? onCancelEditModeContent : this.handleCancel}
            title={modeEditContent ? 'Редактирование' : 'Отчет времени'}
          >
            {modeEditContent ? (
              <Textarea
                key="textAreaEdit"
                className="editContentDescription"
                //editor={true}
                row={10}
                onChange={this.onChangeDescription}
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
  }
}

export default ModalWindow;
