import React, { PureComponent } from 'react';
import { createTaskType } from '../TaskModule.types';
import clsx from 'clsx';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import Title from 'Components/Title';
import moment from 'moment';
import { Button, Input, Select, DatePicker, message } from 'antd';
import Textarea from 'Components/Textarea';
//import File from 'Components/File';
import { v4 as uuid } from 'uuid';

import { routePathNormalise, routeParser, createEntity, createNotification } from 'Utils';

import { CREATE_TASK_SCHEMA } from 'Models/Schema/const';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import regExpRegister from 'Utils/Tools/regexpStorage';
import { compose } from 'redux';
import { withClientDb } from 'Models/ClientSideDatabase';
import { APP_STATUS } from 'App.constant';
import { withTranslation } from 'react-i18next';

const { Option } = Select;
const { RangePicker } = DatePicker;

class CreateTask extends PureComponent {
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

    const dateUpdater =
      date === null
        ? contentDrawer && contentDrawer instanceof moment
          ? {
              date: [contentDrawer.format(dateFormat), contentDrawer.format(dateFormat)],
            }
          : {
              date: [moment().format(dateFormat), moment().format(dateFormat)],
            }
        : {};

    if ([uidCreater, authorState].every((type) => type === null) && uid && displayName) {
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

    if (date !== null) return state;

    return {
      ...state,
      card: {
        ...state.card,
        ...dateUpdater,
      },
    };
  };

  getFilteredUsers = (list) => {
    return list.reduce((usersList, user) => {
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
  };

  componentDidMount = async () => {
    const { router: { routeData = {} } = {}, modelsContext } = this.props;
    const { Request = null } = modelsContext;
    if (!Request) return;

    try {
      const rest = new Request();
      const response = await rest.sendRequest('/system/userList', 'GET', null, true);

      if (response && response.status === 200) {
        const { data: { response: { metadata = [] } = {} } = {} } = response || {};

        const filteredUsers = this.getFilteredUsers(metadata);

        this.setState({
          filteredUsers,
        });
      } else throw new Error('fail load user list');
    } catch (err) {
      const { mainModule__global: { users = [] } = {} } = routeData || {};
      this.setState({
        ...this.state,
        filteredUsers: this.getFilteredUsers(users),
      });
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
    const { t } = this.props;
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
      if (value !== null) {
        newErrorBundle[key] = value;
        continue;
      }
    }

    if (_.isEmpty(newErrorBundle) && !onChangeValidation) return true;

    if (JSON.stringify(newErrorBundle) !== JSON.stringify(errorBundleState))
      this.setState({ ...this.state, errorBundle: { ...newErrorBundle } }, () => {
        if (!onChangeValidation) message.error(t('taskModule_createPage_messages_emptyFields'));
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
    if (target === null) return;

    if (target.name === 'name')
      return this.setState({ ...this.state, card: { ...this.state.card, name: target.value } }, () => {
        this.validation(true);
      });
    else if (target.name === 'description')
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
    if (Array.isArray(dateArray) && dateArray !== this.state.date) {
      return this.setState({ ...this.state, card: { ...this.state.card, date: dateArray } }, () => {
        this.validation(true);
      });
    }
  };

  onChangeHandlerSelectEditor = (eventArray) => {
    if (!Array.isArray(eventArray) || eventArray === this.state.card.editor) return;
    else
      return this.setState({ ...this.state, card: { ...this.state.card, editor: eventArray } }, () => {
        this.validation(true);
      });
  };

  onChangeHandlerSelectPriority = (eventString) => {
    if (typeof eventString !== 'string' || eventString === this.state.priority) return;
    else {
      this.setState({ ...this.state, card: { ...this.state.card, priority: eventString } }, () => {
        this.validation(true);
      });
    }
  };

  onChangeHandlerSelectState = (stateName) => {
    if (typeof stateName !== 'string' || stateName === this.state.card?.status) return;
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
      router: { currentActionTab: path, activeTabs = [] },
      setCurrentTab,
      removeTab,
      udata: { _id: uid = '', displayName = '' } = {},
      onSetStatus,
      modelsContext,
      clientDB,
      t,
    } = this.props;

    const {
      trySubmit: trySubmitState = false,
      card = {},
      card: { name = '' },
    } = this.state;
    const { config = {}, schema = {} } = modelsContext;

    if (!this.validation()) {
      if (trySubmitState) return;

      return this.setState({
        ...this.state,
        trySubmit: true,
      });
    }

    let keys = Object.keys(card);

    if (keys.every((key) => card[key] === null)) return;

    const validHashCopy = [{ ...card }];
    const validHash = validHashCopy.map((it) => schema?.getSchema(CREATE_TASK_SCHEMA, it)).filter(Boolean)[0];
    if (!validHash) return message.error(t('taskModule_createPage_messages_invalidData'));

    const parseDateArray = [];
    if (parseDateArray.length) validHash.date = parseDateArray;

    this.setState({ ...this.state, load: true });

    try {
      const { result: res, offline } = await createEntity(
        'tasks',
        validHash,
        { clientDB, statusApp, onSetStatus, moduleName: path?.split('_')?.[0] },
        4,
        'taskModule',
      );

      if ([res, offline].every((type) => type === null)) {
        throw new Error('Invalid create task');
      }

      const { response = {} } = res.data;
      const { metadata = [], params = {} } = response;
      const { customErrorMessage = '', done = false } = params;

      const errorMessage = customErrorMessage || 'Error create task';

      if (!done && !offline) {
        throw new Error(typeof metadata === 'string' ? metadata : errorMessage);
      }

      this.setState(
        {
          ...this.state,
          card: { ...card, key: uuid() },
          load: false,
        },
        () => {
          message.success(t('taskModule_createPage_messages_taskCreated'));
          const { key: recordKey = '', _id: id = '' } = metadata[0] || metadata || {};
          const key = id ? id : recordKey;
          if (!key || statusApp !== APP_STATUS.ON) return;

          const itemNotification = {
            type: 'global',
            title: t('taskModule_createPage_notification_title'),
            isRead: false,
            message: `${t('taskModule_createPage_notification_message')} № ${key}. ${name}`,
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
              message.error(t('globalMessages_notificationGlobalError'));
            });
          }

          if (config.tabsLimit <= activeTabs.length)
            return message.error(`${t('globalMessages_maxTabs')} ${config.tabsLimit}`);

          const { moduleId = '', page = '' } = routeParser({ path });
          if (!moduleId || !page) return;

          const index = activeTabs.findIndex((tab) => tab.includes(page) && tab.includes(key));
          const isFind = index !== -1;

          let type = 'deafult';
          if (path.split(regExpRegister.MODULE_ID)[1]) type = 'itemTab';

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
            setCurrentTab(activeTabs[index]);
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
    const { visibleMode = 'default', dateFormat = 'DD.MM.YYYY', t } = this.props;

    const {
      errorBundle = {},
      filteredUsers = [],
      card: { description: descriptionValue = '' },
    } = this.state;

    const defaultDate = this.getDefaultDate(dateFormat);

    return (
      <Scrollbars autoHide hideTracksWhenNotNeeded>
        <div className="createTask">
          {visibleMode === 'default' ? (
            <Title
              additional={t('taskModule_createPage_formName')}
              classNameTitle="createTaskTitle"
              title={t('taskModule_createPage_title')}
            />
          ) : null}
          <div className="createTask__main">
            <div className={clsx(visibleMode !== 'default' ? 'col-fullscreen' : 'col-6', 'col-task')}>
              <Scrollbars autoHide hideTracksWhenNotNeeded>
                <form className="taskForm" name="taskForm">
                  <label>{t('taskModule_createPage_form_name')}: </label>
                  <Input
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.name ? 'isError' : null)}
                    onChange={this.onChangeHandler}
                    name="name"
                    type="text"
                  />
                  <label> {t('taskModule_createPage_form_status')}: </label>
                  <Select
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.state ? 'isError' : null)}
                    onChange={this.onChangeHandlerSelectState}
                    name="state"
                    type="text"
                  >
                    {this.renderStatusList()}
                  </Select>
                  <label>{t('taskModule_createPage_form_priority')}: </label>
                  <Select
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.priority ? 'isError' : null)}
                    onChange={this.onChangeHandlerSelectPriority}
                    defaultValue="Средний"
                    name="priority"
                    type="text"
                  >
                    <Option value="Низкий">{t('taskModule_createPage_form_priorityList_low')}</Option>
                    <Option value="Средний">{t('taskModule_createPage_form_priorityList_medium')}</Option>
                    <Option value="Высокий">{t('taskModule_createPage_form_priorityList_high')}</Option>
                    <Option value="Критический">{t('taskModule_createPage_form_priorityList_hot')}</Option>
                  </Select>
                  <label>{t('taskModule_createPage_form_executor')}:</label>
                  <Select
                    className={clsx(!_.isEmpty(errorBundle) && errorBundle.editor ? 'isError' : null)}
                    onChange={this.onChangeHandlerSelectEditor}
                    name="editor"
                    mode="multiple"
                    placeholder={t('taskModule_createPage_form_selectExecutorPlaceholder')}
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
                  <label>${t('taskModule_createPage_form_aboutTask')}: </label>
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
                  <label>{t('taskModule_createPage_form_deadline')}: </label>
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
                    {t('taskModule_createPage_form_createTask')}
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

export default compose(withClientDb, withTranslation())(moduleContextToProps(CreateTask));
