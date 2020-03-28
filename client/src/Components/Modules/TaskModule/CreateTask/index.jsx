import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import TitleModule from '../../../TitleModule';
import moment from 'moment';
import { Button, Input, Select, DatePicker, message } from 'antd';

import Textarea from '../../../Textarea';
import File from '../../../File';
import uuid from 'uuid/v4';

import { routePathNormalise, routeParser } from '../../../../Utils';
import modelContext from '../../../../Models/context';

import { CREATE_TASK_SCHEMA } from '../../../../Models/Schema/const';

const { Option } = Select;
const { RangePicker } = DatePicker;

class CreateTask extends React.PureComponent {
  state = {
    load: false,
    card: {
      key: uuid(),
      status: 'Открыт',
      name: null,
      priority: 'Средний',
      author: 'Петрович Павел',
      editor: null,
      description: null,
      comments: [],
      date: [moment().format('DD.MM.YYYY'), moment().format('DD.MM.YYYY')],
    },
    errorBundle: {},
  };

  static contextType = modelContext;

  static propTypes = {
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    onLoadCurrentData: PropTypes.func.isRequired,

    statusApp: PropTypes.string.isRequired,
  };

  componentDidMount = async () => {
    const { Request = {} } = this.context;

    try {
      const rest = new Request();
      const response = await rest.sendRequest('/system/userList', 'GET', null, true);

      if (response && response.status === 200) {
        const { data: { response: { metadata = [] } = {} } = {} } = response || {};

        const filteredUsers = metadata
          .map(user => {
            const { _id = '', displayName = '' } = user;

            if (!user || !_id || !displayName) return null;

            return {
              _id,
              displayName,
            };
          })
          .filter(Boolean);

        this.setState({
          filteredUsers,
        });
      } else throw new Error('fail load user list');
    } catch (err) {
      message.error('Ошибка загрузки сотрудников.');
      console.error(err);
    }
  };

  validation = () => {
    const {
      card: { key, status, name, priority, author, editor, description, date },
      errorBundle: errorBundleState,
    } = this.state;
    let isUpdate = false;
    const copyErrorBundleState = { ...errorBundleState };
    const errorBundle = {};

    if (!key) errorBundle.key = 'Ключ не найден.';
    else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.key) {
      isUpdate = true;
      copyErrorBundleState.key = null;
    }
    if (!status) errorBundle.status = 'Статус не найден.';
    else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.status) {
      isUpdate = true;
      copyErrorBundleState.status = null;
    }
    if (!name) errorBundle.name = 'Имя не найдено.';
    else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.name) {
      isUpdate = true;
      copyErrorBundleState.name = null;
    }
    if (!priority) errorBundle.priority = 'Приоритет не найден.';
    else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.priority) {
      isUpdate = true;
      copyErrorBundleState.priority = null;
    }
    if (!author) errorBundle.author = 'Автор не найден.';
    else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.author) {
      isUpdate = true;
      copyErrorBundleState.author = null;
    }
    if (!editor) errorBundle.editor = 'Исполнитель(и) не найден(ы).';
    else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.editor) {
      isUpdate = true;
      copyErrorBundleState.editor = null;
    }
    if (!description) errorBundle.description = 'Описание задачи не найдено.';
    else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.description) {
      isUpdate = true;
      copyErrorBundleState.description = null;
    }
    if (!date.length) errorBundle.date = 'Срок сдачи не найден.';
    else if (!_.isEmpty(copyErrorBundleState) && copyErrorBundleState.date) {
      isUpdate = true;
      copyErrorBundleState.date = null;
    }

    if (isUpdate) {
      const keyCopy = Object.keys(copyErrorBundleState);
      let newCopyErrorBundle = {};
      keyCopy.forEach(key => {
        if (copyErrorBundleState[key] !== null) newCopyErrorBundle[key] = copyErrorBundleState[key];
      });
      this.setState({ ...this.state, errorBundle: { ...newCopyErrorBundle } });
    }
    if (_.isEmpty(errorBundle)) return true;
    else {
      message.error('Не все поля заполнены!');
      this.setState({ ...this.state, errorBundle: errorBundle });
      return;
    }
  };

  onChangeHandler = event => {
    const { target = null } = event;
    if (_.isNull(target)) return;
    if (!_.isNull(target) && target.name === 'name')
      return this.setState({ ...this.state, card: { ...this.state.card, name: target.value } });
    else if (!_.isNull(target) && target.name === 'description')
      return this.setState({
        ...this.state,
        card: { ...this.state.card, description: target.value },
      });
  };

  onChangeTextArea = event => {
    const { target } = event;
    this.setState({ ...this.state, card: { ...this.state.card, description: target.value } });
  };

  onChangeHandlerDate = (date, dateArray) => {
    if (_.isArray(dateArray) && dateArray !== this.state.date) {
      return this.setState({ ...this.state, card: { ...this.state.card, date: dateArray } });
    }
  };

  onChangeHandlerSelectEditor = eventArray => {
    if (!_.isArray(eventArray) || eventArray === this.state.card.editor) return;
    else return this.setState({ ...this.state, card: { ...this.state.card, editor: eventArray } });
  };

  onChangeHandlerSelectPriority = eventString => {
    if (!_.isString(eventString) || eventString === this.state.priority) return;
    else {
      this.setState({ ...this.state, card: { ...this.state.card, priority: eventString } });
    }
  };

  offlineMode = validHash => {
    const offlineValidHash = { ...validHash, modeAdd: 'offline' };
    const { clientDB = {} } = this.context;
    const putAction = clientDB.addItem('tasks', offlineValidHash);

    if (putAction)
      putAction.onsuccess = event => {
        this.setState({ ...this.state, card: { ...this.state.card, key: uuid() }, load: false }, () =>
          message.success(`Задача создана.`),
        );
      };
  };

  handlerCreateTask = async event => {
    const {
      statusApp = '',
      onOpenPageWithData,
      router: { currentActionTab: path, actionTabs = [] },
      setCurrentTab,
      removeTab,
      udata: { _id: uid, displayName = '' },
    } = this.props;
    const { config = {}, Request = {}, schema = {} } = this.context;

    if (!this.validation()) return;

    let keys = Object.keys(this.state.card);

    if (keys.every(key => _.isNull(this.state.card[key]))) return;

    const validHashCopy = [{ ...this.state.card }];
    const validHash = validHashCopy.map(it => schema.getSchema(CREATE_TASK_SCHEMA, it)).filter(Boolean)[0];

    if (!validHash) return message.error('Не валидные данные.');

    const parseDateArray = [];

    if (parseDateArray.length) validHash.date = parseDateArray;

    this.setState({ ...this.state, load: true });

    if (statusApp === 'online') {
      try {
        if (statusApp === 'offline') this.offlineMode(validHash);

        const request = new Request();
        const res = await request.sendRequest('/tasks/createTask', 'POST', validHash, true);

        if (res.status !== 200) {
          console.error(res);
          throw new Error('Bad response');
        }

        const {
          data: { response: { done = false, metadata = [] } = {} },
        } = res || {};

        if (!done) {
          throw new Error(typeof metadata === 'string' ? metadata : 'Error create task');
        }

        this.setState(
          {
            ...this.state,
            card: { ...this.state.card, key: uuid() },
            load: false,
          },
          () => {
            message.success(`Задача создана.`);
            const {
              card: { name = '' },
            } = this.state;
            const { key = '' } = metadata[0] || metadata || {};
            if (!key) return;

            const rest = new Request();
            rest
              .sendRequest(
                `/system/global/notification`,
                'POST',
                {
                  actionType: 'set_notification',
                  item: {
                    type: 'global',
                    title: 'Новая задача',
                    message: `Создана новая задача № ${key}. ${name}`,
                    action: {
                      type: 'task_link',
                      link: key,
                    },
                    uidCreater: uid,
                    authorName: displayName,
                  },
                },
                true,
              )
              .catch(error => {
                console.error(error);
                message.error('Ошибка глобального уведомления');
              });

            if (config.tabsLimit <= actionTabs.length)
              return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

            const { moduleId = '', page = '' } = routeParser({ path });
            if (!moduleId || !page) return;

            const index = actionTabs.findIndex(tab => tab.includes(page) && tab.includes(key));
            const isFind = index !== -1;

            let type = 'deafult';
            if (path.split('__')[1]) type = 'itemTab';

            removeTab({ path, type: type });

            if (!isFind) {
              onOpenPageWithData({
                activePage: routePathNormalise({
                  pathType: 'moduleItem',
                  pathData: { page, moduleId, key },
                }),
                routeDataActive: metadata[0] || metadata || {},
              });
            } else {
              setCurrentTab(actionTabs[index]);
            }
          },
        );

        // if (rest)
        //     rest.sendRequest("/tasks/createTask", "POST", validHash, true)
        //         .then((response) => {
        //             this.setState(
        //                 { ...this.state, card: { ...this.state.card, key: uuid() }, load: false },
        //                 () => message.success(`Задача создана.`));
        //         })
        //         .catch(err => {
        //             if (/offline/gi.test(err.message)) {
        //                 onLoadCurrentData({ path: "taskModule", storeLoad: "tasks" }).then(() => {
        //                     this.offlineMode(validHash);
        //                 });
        //             }
        //         });
      } catch (error) {
        console.error(error);
        message.success(error.message);
        this.setState({
          ...this.state,
          load: false,
        });
      }
    }
  };

  render() {
    const dateFormat = 'DD.MM.YYYY';
    const { errorBundle, filteredUsers = [] } = this.state;
    const { rest } = this.context;
    // const { height } = this.props;
    return (
      <Scrollbars>
        <div className="createTask">
          <TitleModule
            additional="Форма создания задачи"
            classNameTitle="createTaskTitle"
            title="Новая задача"
          />
          <div className="createTask__main">
            <div className="col-6 col-task">
              <Scrollbars autoHide>
                <form className="taskForm" name="taskForm">
                  <label>Название: </label>
                  <Input
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.name ? 'isError' : null)}
                    onChange={this.onChangeHandler}
                    name="name"
                    type="text"
                  />
                  <label>Приоритет: </label>
                  <Select
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.priority ? 'isError' : null)}
                    onChange={this.onChangeHandlerSelectPriority}
                    defaultValue="Средний"
                    name="priority"
                    type="text"
                  >
                    <Option value="Низкий">Низкий</Option>
                    <Option value="Средний">Средний</Option>
                    <Option value="Высокий">Высокий</Option>
                  </Select>
                  <label>Назначить исполнителя/исполнителей:</label>
                  <Select
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.editor ? 'isError' : null)}
                    onChange={this.onChangeHandlerSelectEditor}
                    name="editor"
                    mode="multiple"
                    placeholder="выберете исполнителя"
                    optionLabelProp="label"
                  >
                    {filteredUsers && filteredUsers.length
                      ? filteredUsers.map(it => (
                          <Option value={it.displayName} label={it.displayName}>
                            <span>{it.displayName}</span>
                          </Option>
                        ))
                      : null}
                  </Select>
                  <label>Описание задачи: </label>
                  <Textarea
                    key="createTextare"
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.description ? 'isError' : null)}
                    name="description"
                    onChange={this.onChangeHandler}
                    rows={8}
                  />
                  <label>Прикрепить файлы: </label>
                  <File onAddFileList={null} rest={rest} />
                  <label>Срок сдачи: </label>
                  <RangePicker
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.date ? 'isError' : null)}
                    onChange={this.onChangeHandlerDate}
                    defaultValue={[
                      moment(moment().format('DD.MM.YYYY'), dateFormat),
                      moment(moment().format('DD.MM.YYYY'), dateFormat),
                    ]}
                    name="date"
                    format="DD.MM.YYYY"
                    type="date"
                  />
                  <Button
                    className="submitNewTask"
                    disabled={this.state.load}
                    onClick={this.handlerCreateTask}
                    loading={this.state.load}
                    type="primary"
                  >
                    Создать задачу
                  </Button>
                </form>
              </Scrollbars>
            </div>
          </div>
        </div>
      </Scrollbars>
    );
  }
}

export default CreateTask;
