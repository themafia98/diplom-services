import React from 'react';
import { modalWindowType } from './types';
import clsx from 'clsx';
import axios from 'axios';
import _ from 'lodash';
import moment from 'moment';
import { Modal, Button, Dropdown, Icon, Menu, Input, DatePicker, message, Select } from 'antd';
import { TASK_CONTROLL_JURNAL_SCHEMA } from '../../Models/Schema/const';
import { createNotification } from '../../Utils';
import SimpleEditableModal from './SimpleEditableModal';
import RegistrationModal from './RegistrationModal';
import Textarea from '../Textarea';

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
    const { mode } = this.props;
    const { currentTarget = {} } = event;
    let type = mode;

    if (mode !== currentTarget.className.split(' ')[0]) {
      type = currentTarget.className.split(' ')[0];
    }

    this.setState({
      ...this.state,
      modeSetTime: true,
      visible: true,
      type: type,
    });
  };

  handleOk = async (event) => {
    const {
      name,
      password,
      departament,
      visible,
      email,
      loading,
      surname,
      jurnal,
      type: typeValue,
      taskStatus = null,
      description: { value: valueDescription = '' } = {},
    } = this.state;
    const {
      mode = null,
      onCaching,
      onUpdate,
      routeDataActive = {},
      routeDataActive: { key = null, name: nameTask = '' } = {},
      actionType = null,
      keyTask = null,
      onCancelEditModeContent,
      path = '',
      modeEditContent = null,
    } = this.props;

    if (mode === 'reg') {
      if (name && password && departament && email && !loading) {
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
          console.error(error);
        }
      }
    } else if (mode === 'jur' && modeEditContent) {
      onUpdate({
        key,
        id: routeDataActive['_id'],
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
    } else if ((visible && mode === 'jur' && this.validation() && !typeValue) || typeValue === 'jur') {
      const item = { ...jurnal, depKey: keyTask, editor: 'Павел Петрович' };

      const jurnalCopy = { ...jurnal };
      const { Request } = this.context;
      const { udata: { _id: uid, displayName } = {} } = this.props;

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
                Время затрачено: ${jurnalCopy?.timeLost}.
                Описание: ${jurnalCopy.description}. Дата: ${jurnalCopy?.date}`,
        action: {
          type: 'tasks_link',
          moduleName: 'taskModule',
          link: key,
        },
        uidCreater: uid,
        authorName: displayName,
      };

      createNotification('global', itemNotification).catch((error) => {
        console.error(error);
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
    } else if (!_.isNull(typeValue) && typeValue === 'statusTask') {
      if (_.isNull(taskStatus)) {
        return this.setState({
          ...this.state,
          visible: false,
          type: null,
          modeSetTime: false,
          loading: false,
        });
      }
      onUpdate({
        path,
        id: routeDataActive['_id'],
        key,
        updateItem: taskStatus,
        updateField: 'status',
        item: { ...routeDataActive },
        store: 'tasks',
      })
        .then((res) => {
          this.setState({
            ...this.state,
            visible: false,
            type: null,
            modeSetTime: false,
            loading: false,
          });
          message.success('Статус изменен.');
        })
        .catch((error) => {
          message.error('Ошибка редактирования.');
        });
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
      type: typeState,
    } = this.state;
    const { keyTask } = this.props;
    const { schema = {} } = this.context;
    let _valid = true;
    let invalidDate = !_.isDate(new Date(date));
    let invalidTimeLost = !_.isString(timeLost);
    let invalidDescription = !_.isString(description);

    if ((invalidDate || invalidTimeLost || invalidDescription) && !typeState) {
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

  render() {
    const {
      mode = '',
      statusTaskValue = '',
      accessStatus = [],
      onEdit = null,
      modeControll = null,
      description: descriptionDefault = '',
      onRejectEdit = null,
      modeEditContent = null,
      defaultView = false,
      onCancelEditModeContent = null,
      onUpdateEditable,
    } = this.props;

    if (defaultView) {
      return <SimpleEditableModal {...this.props} />;
    }

    const {
      type: typeState = '',
      modeSetTime = null,
      description: { value: valueDesc = '' } = {},
    } = this.state;
    if (mode === 'reg') {
      return (
        <React.Fragment>
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
              <div></div>
            )}
          </Modal>
        </React.Fragment>
      );
    } else if (mode === 'jur') {
      const {
        error,
        jurnal: { description, timeLost },
      } = this.state;
      moment.locale('ru');
      const menu = (
        <React.Fragment>
          <Menu>
            <Menu.Item>
              <p className="jur" onClick={modeControll === 'edit' ? this.onMessage : this.showModal}>
                Занести в журнал работы
              </p>
            </Menu.Item>
            <Menu.Item>
              <p className="statusTask" onClick={modeControll === 'edit' ? this.onMessage : this.showModal}>
                Сменить статус задачи
              </p>
            </Menu.Item>
            <Menu.Item>
              <p className="statusTask" onClick={modeControll === 'edit' ? this.onMessage : onEdit}>
                Редактировать задачу
              </p>
            </Menu.Item>
          </Menu>
        </React.Fragment>
      );
      switch (typeState) {
        case 'statusTask': {
          return (
            <div className="dropDownWrapper">
              <Dropdown overlay={menu}>
                <p>
                  Управление задачей
                  <Icon type="down" />
                </p>
              </Dropdown>
              {modeControll === 'edit' ? (
                <React.Fragment>
                  <p onClick={onUpdateEditable} className="modeControllEdit">
                    Сохранить изменения
                  </p>
                  <p onClick={onRejectEdit} className="modeControllEditReject">
                    Отмена изменений
                  </p>
                </React.Fragment>
              ) : null}
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
          return (
            <React.Fragment>
              <div className="dropDownWrapper">
                <Dropdown overlay={menu}>
                  <p>
                    Управление задачей
                    <Icon type="down" />
                  </p>
                </Dropdown>
                {modeControll === 'edit' ? (
                  <React.Fragment>
                    <p onClick={onUpdateEditable} className="modeControllEdit">
                      Сохранить изменения
                    </p>
                    <p onClick={onRejectEdit} className="modeControllEditReject">
                      Отмена изменений
                    </p>
                  </React.Fragment>
                ) : null}
              </div>
              {mode === 'jur' && modeEditContent ? (
                <Modal
                  className="modalWindow"
                  visible={modeEditContent}
                  onOk={this.handleOk}
                  onCancel={onCancelEditModeContent}
                  title={'Редактирование'}
                >
                  <Textarea
                    key="textAreaEdit"
                    className="editContentDescription"
                    //editor={true}
                    row={10}
                    onChange={this.onChangeDescription}
                    value={valueDesc ? valueDesc : ''}
                    defaultValue={valueDesc ? valueDesc : ''}
                  />
                </Modal>
              ) : modeSetTime ? (
                <Modal
                  className="modalWindow"
                  visible={this.state.visible}
                  onOk={this.handleOk}
                  onCancel={this.handleCancel}
                  title=" Отчет времени"
                >
                  <span>Затраченое время:</span>
                  <Input
                    onChange={this.onChangeTask}
                    className={clsx('timeLost', error.has('timeLost') ? 'errorFild' : null)}
                    value={timeLost}
                    type="text"
                    size="default"
                    placeholder="20m / 1h / 2.5h "
                  />

                  <span>Дата и время:</span>
                  <DatePicker
                    onChange={this.onChangeTask}
                    className={clsx('date', error.has('date') ? 'errorFild' : null)}
                    format="DD.MM.YYYY HH:mm:ss"
                    showTime={{ defaultValue: moment() }}
                    defaultValue={moment()}
                  />
                  <span>Кометарии:</span>
                  <Textarea
                    key="commentsTextArea"
                    onChange={this.onChangeTask}
                    defaultValue={descriptionDefault}
                    value={description}
                    className={['description', error.has('description') ? 'errorFild' : null].join(' ')}
                    rows={4}
                  />
                </Modal>
              ) : null}
            </React.Fragment>
          );
        }
      }
    } else return null;
  }
}

export default ModalWindow;
