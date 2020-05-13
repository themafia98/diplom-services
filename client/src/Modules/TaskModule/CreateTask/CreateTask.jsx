// @ts-nocheck
import React from 'react';
import { createTaskType } from '../types';
import clsx from 'clsx';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import TitleModule from '../../../Components/TitleModule';
import moment from 'moment';
import { Button, Input, Select, DatePicker, message } from 'antd';
import Textarea from '../../../Components/Textarea';
//import File from '../../../Components/File';
import { v4 as uuid } from 'uuid';

import { routePathNormalise, routeParser, createEntity, createNotification } from '../../../Utils';
import modelContext from '../../../Models/context';

import { CREATE_TASK_SCHEMA } from '../../../Models/Schema/const';

const { Option } = Select;
const { RangePicker } = DatePicker;

class CreateTask extends React.PureComponent {
  state = {
    load: false,
    trySubmit: false,
    statusListName: [],
    card: {
      key: uuid(),
      status: '',
      name: null,
      priority: 'Средний',
      uidCreater: null,
      authorName: null,
      editor: null,
      description: null,
      comments: [],
      date: null,
    },
    errorBundle: {},
  };

  static contextType = modelContext;
  static propTypes = createTaskType;
  static defaultProps = {
    visibleMode: 'default',
  };

  static getDerivedStateFromProps = (props, state) => {
    const { card: { authorName: authorState = null, uidCreater = null, date = null } = {} } = state;
    const {
      udata: { _id: uid, displayName = '' } = {},
      dateFormat = 'DD.MM.YYYY',
      contentDrawer = '',
    } = props;

    const dateUpdater = _.isNull(date)
      ? contentDrawer && contentDrawer instanceof moment
        ? {
            date: [contentDrawer.format(dateFormat), contentDrawer.format(dateFormat)],
          }
        : {
            date: [moment().format(dateFormat), moment().format(dateFormat)],
          }
      : {};

    if (_.isNull(uidCreater) && _.isNull(authorState) && uid && displayName) {
      return {
        ...state,
        card: {
          ...state.card,
          authorName: displayName,
          uidCreater: uid,
          ...dateUpdater,
        },
      };
    }

    if (_.isNull(date)) {
      return {
        ...state,
        card: {
          ...state.card,
          ...dateUpdater,
        },
      };
    }

    return state;
  };

  componentDidMount = async () => {
    const { Request = null } = this.context;
    if (!Request) return;

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

        this.setState({
          filteredUsers,
        });
      } else throw new Error('fail load user list');
    } catch (err) {
      message.error('Ошибка загрузки сотрудников.');
      console.error(err);
    }
  };

  componentDidUpdate = () => {
    const { statusListName = [] } = this.state;
    const { statusList: { settings = [] } = {} } = this.props;

    const filteredStatusNames = settings.map(({ value = '' }) => value).filter(Boolean);

    if (filteredStatusNames?.length !== statusListName?.length) {
      this.setState({
        ...this.state,
        statusListName: filteredStatusNames,
      });
    }
  };

  validation = _.debounce((onChangeValidation = false) => {
    const { card = {}, errorBundle: errorBundleState, trySubmit = false } = this.state;
    const copyErrorBundleState = { ...errorBundleState };

    if (!trySubmit && onChangeValidation) return;

    for (let [key, value] of Object.entries(card)) {
      if (!value) {
        copyErrorBundleState[key] = `Значение ${key} не найдено.`;
        continue;
      }

      copyErrorBundleState[key] = null;
    }

    let newErrorBundle = {};
    for (let [key, value] of Object.entries(copyErrorBundleState)) {
      if (!_.isNull(value)) {
        newErrorBundle[key] = value;
        continue;
      }
    }

    if (_.isEmpty(newErrorBundle) && !onChangeValidation) return true;

    if (JSON.stringify(newErrorBundle) !== JSON.stringify(errorBundleState))
      this.setState({ ...this.state, errorBundle: { ...newErrorBundle } }, () => {
        if (!onChangeValidation) message.error('Не все поля заполнены!');
      });

    return false;
  }, 300);

  getErrorLogs = () => {
    const { errorBundle = {} } = this.state;
    if (!errorBundle || _.isEmpty(errorBundle)) return null;

    return Object.values(errorBundle).map((value, index) => (
      <li key={value && index ? `${value}${index}` : index} className="error-item">
        {value}
      </li>
    ));
  };

  onChangeHandler = (event) => {
    const { target = null } = event;
    if (_.isNull(target)) return;
    if (!_.isNull(target) && target.name === 'name')
      return this.setState({ ...this.state, card: { ...this.state.card, name: target.value } }, () => {
        this.validation(true);
      });
    else if (!_.isNull(target) && target.name === 'description')
      return this.setState(
        {
          ...this.state,
          card: { ...this.state.card, description: target.value },
        },
        () => {
          this.validation(true);
        },
      );
  };

  onChangeTextArea = (event) => {
    const { target } = event;
    this.setState({ ...this.state, card: { ...this.state.card, description: target.value } }, () => {
      this.validation(true);
    });
  };

  onChangeHandlerDate = (date, dateArray) => {
    if (_.isArray(dateArray) && dateArray !== this.state.date) {
      return this.setState({ ...this.state, card: { ...this.state.card, date: dateArray } }, () => {
        this.validation(true);
      });
    }
  };

  onChangeHandlerSelectEditor = (eventArray) => {
    if (!_.isArray(eventArray) || eventArray === this.state.card.editor) return;
    else
      return this.setState({ ...this.state, card: { ...this.state.card, editor: eventArray } }, () => {
        this.validation(true);
      });
  };

  onChangeHandlerSelectPriority = (eventString) => {
    if (!_.isString(eventString) || eventString === this.state.priority) return;
    else {
      this.setState({ ...this.state, card: { ...this.state.card, priority: eventString } }, () => {
        this.validation(true);
      });
    }
  };

  onChangeHandlerSelectState = (stateName) => {
    if (!_.isString(stateName) || stateName === this.state.card?.status) return;
    else {
      this.setState({ ...this.state, card: { ...this.state.card, status: stateName } }, () => {
        this.validation(true);
      });
    }
  };

  renderStatusList = () => {
    const { statusListName = [] } = this.state;
    return statusListName
      .map((status, index) => {
        return (
          <Option key={index && status ? `${index}${status}` : index} value={status} label={status}>
            <span className="value">{status}</span>
          </Option>
        );
      })
      .filter(Boolean);
  };

  handlerCreateTask = async (event) => {
    const {
      statusApp = '',
      onOpenPageWithData,
      router: { currentActionTab: path, actionTabs = [] },
      setCurrentTab,
      removeTab,
      udata: { _id: uid = '', displayName = '' } = {},
      onSetStatus,
    } = this.props;

    const {
      trySubmit: trySubmitState = false,
      card = {},
      card: { name = '' },
    } = this.state;
    const { config = {}, schema = {}, clientDB } = this.context;

    if (!this.validation()) {
      if (trySubmitState) return;

      return this.setState({
        ...this.state,
        trySubmit: true,
      });
    }

    let keys = Object.keys(card);

    if (keys.every((key) => _.isNull(card[key]))) return;

    const validHashCopy = [{ ...card }];
    const validHash = validHashCopy.map((it) => schema?.getSchema(CREATE_TASK_SCHEMA, it)).filter(Boolean)[0];
    if (!validHash) return message.error('Не валидные данные.');

    const parseDateArray = [];
    if (parseDateArray.length) validHash.date = parseDateArray;

    this.setState({ ...this.state, load: true });

    try {
      const { result: res, offline } = await createEntity(
        'tasks',
        validHash,
        { clientDB, statusApp, onSetStatus },
        4,
      );

      if (_.isNull(res) && _.isNull(offline)) {
        throw new Error('Invalid create task');
      }

      const { data: { response: { done = false, metadata = [] } = {} } = {} } = res || {};

      if (!done && !offline) {
        throw new Error(typeof metadata === 'string' ? metadata : 'Error create task');
      }

      this.setState(
        {
          ...this.state,
          card: { ...card, key: uuid() },
          load: false,
        },
        () => {
          message.success(`Задача создана.`);
          const { key = '' } = metadata[0] || metadata || {};
          if (!key || statusApp !== 'online') return;

          const itemNotification = {
            type: 'global',
            title: 'Новая задача',
            isRead: false,
            message: `Создана новая задача № ${key}. ${name}`,
            action: {
              type: 'tasks_link',
              moduleName: 'taskModule',
              link: key,
            },
            uidCreater: uid,
            authorName: displayName,
          };

          if (createNotification) {
            createNotification('global', itemNotification).catch((error) => {
              if (error?.response?.status !== 404) console.error(error);
              message.error('Ошибка глобального уведомления');
            });
          }

          if (config.tabsLimit <= actionTabs.length)
            return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

          const { moduleId = '', page = '' } = routeParser({ path });
          if (!moduleId || !page) return;

          const index = actionTabs.findIndex((tab) => tab.includes(page) && tab.includes(key));
          const isFind = index !== -1;

          let type = 'deafult';
          if (path.split('__')[1]) type = 'itemTab';

          if (removeTab) removeTab({ path, type: type });

          if (!isFind && onOpenPageWithData) {
            onOpenPageWithData({
              activePage: routePathNormalise({
                pathType: 'moduleItem',
                pathData: { page, moduleId, key },
              }),
              routeDataActive: metadata[0] || metadata || {},
            });
          } else if (setCurrentTab) {
            setCurrentTab(actionTabs[index]);
          }
        },
      );
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error(error.message);
      this.setState({
        ...this.state,
        load: false,
      });
    }
  };

  getDefaultDate = (dateFormat) => {
    const { contentDrawer } = this.props;

    if (contentDrawer && contentDrawer instanceof moment) {
      return [
        moment(contentDrawer.format(dateFormat), dateFormat),
        moment(contentDrawer.format(dateFormat), dateFormat),
      ];
    } else
      return [
        moment(moment().format(dateFormat), dateFormat),
        moment(moment().format(dateFormat), dateFormat),
      ];
  };

  render() {
    const { visibleMode = 'default', dateFormat = 'DD.MM.YYYY' } = this.props;

    const {
      errorBundle = {},
      filteredUsers = [],
      card: { description: descriptionValue = '' /* key: keyCard = '' */ },
    } = this.state;
    //const { rest } = this.context;

    const defaultDate = this.getDefaultDate(dateFormat);

    return (
      <Scrollbars hideTracksWhenNotNeeded={true}>
        <div className="createTask">
          {visibleMode === 'default' ? (
            <TitleModule
              additional="Форма создания задачи"
              classNameTitle="createTaskTitle"
              title="Новая задача"
            />
          ) : null}
          <div className="createTask__main">
            <div className={clsx(visibleMode !== 'default' ? 'col-fullscreen' : 'col-6', 'col-task')}>
              <Scrollbars hideTracksWhenNotNeeded={true} autoHide>
                <form className="taskForm" name="taskForm">
                  <label>Название: </label>
                  <Input
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.name ? 'isError' : null)}
                    onChange={this.onChangeHandler}
                    name="name"
                    type="text"
                  />
                  <label> Статус: </label>
                  <Select
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.state ? 'isError' : null)}
                    onChange={this.onChangeHandlerSelectState}
                    name="state"
                    type="text"
                  >
                    {this.renderStatusList()}
                  </Select>
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
                    <Option value="Критический">Критический</Option>
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
                      ? filteredUsers.map((it) => (
                          <Option key={it?._id} value={it._id} label={it.displayName}>
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
                    value={descriptionValue}
                    rows={8}
                  />
                  {/* <label>Прикрепить файлы: </label>
                  <File
                    moduleData={{ id: `${keyCard}_virtual`, name: ' taskModule' }}
                    isLocal={true}
                    module="tasks"
                    rest={rest}
                  /> */}
                  <label>Срок сдачи: </label>
                  <RangePicker
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.date ? 'isError' : null)}
                    onChange={this.onChangeHandlerDate}
                    defaultValue={defaultDate}
                    name="date"
                    format="DD.MM.YYYY"
                    type="date"
                  />
                  <Button
                    className="submitNewTask"
                    disabled={this.state.load || !_.isEmpty(errorBundle)}
                    onClick={this.handlerCreateTask}
                    loading={this.state.load}
                    type="primary"
                  >
                    Создать задачу
                  </Button>
                </form>
              </Scrollbars>
            </div>
            {visibleMode === 'default' ? (
              <div className="col-6 error-logger">
                <ul className="errors-list">{this.getErrorLogs()}</ul>
              </div>
            ) : null}
          </div>
        </div>
      </Scrollbars>
    );
  }
}

export default CreateTask;
