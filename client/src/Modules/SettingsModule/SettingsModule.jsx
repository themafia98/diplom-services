// @ts-nocheck
import React from 'react';
import { settingsModuleType } from './types';
import _ from 'lodash';
import { connect } from 'react-redux';
import { settingsLogsSelector } from './selectors';
import { saveComponentStateAction } from '../../Redux/actions/routerActions';
import { updateUdata, setStatus } from '../../Redux/actions/publicActions';
import { Collapse, Switch, Input, Button, message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import { middlewareCaching } from '../../Redux/actions/publicActions/middleware';
import modelContext from '../../Models/context';
import ObserverTime from '../../Components/ObserverTime';
import TitleModule from '../../Components/TitleModule';
const { Panel } = Collapse;

class SettingsModule extends React.PureComponent {
  state = {
    haveChanges: [],
    showScrollbar: false,
    emailValue: null,
    isLoadingLogs: false,
    telValue: null,
    newPassword: '',
    oldPassword: '',
    isHideEmail: null,
    isHidePhone: null,
  };

  static propTypes = settingsModuleType;
  static contextType = modelContext;
  static defaultProps = {
    settingsLogs: [],
  };

  static getDerivedStateFromProps = (props, state) => {
    const {
      udata: {
        email: emailValue = null,
        phone: telValue = null,
        isHideEmail = null,
        isHidePhone = null,
      } = {},
    } = props;
    const enumState = [state.emailValue, state.telValue, state.isHideEmail, state.isHidePhone];
    if (enumState.every((value) => _.isNull(value))) {
      return {
        ...state,
        emailValue,
        telValue,
        isHideEmail,
        isHidePhone,
      };
    }
    return state;
  };

  componentDidMount = () => {
    const { isLoadingLogs = false } = this.state;
    const { router, path, settingsLogs = [], udata: { _id: uid = '' } = {}, onCaching } = this.props;

    if (router && router.routeData[path] && router.routeData[path].haveChanges) {
      this.setState({ ...this.state, ...router.routeData[path] });
    }

    if (!Object.keys(settingsLogs).length && !isLoadingLogs && onCaching) {
      onCaching({
        uid,
        actionType: 'get_user_settings_log',
        depStore: 'settings',
        type: 'logger',
      });
    }
  };

  componentDidUpdate = (props, state) => {
    const { showScrollbar, emailValue = '', telValue = '', isLoadingLogs = false } = this.state;
    const {
      settingsLogs = [],
      udata: { _id: uid = '' } = {},
      onCaching,
      shouldUpdate = false,
      onSetStatus,
    } = this.props;

    if (onCaching && ((!Object.keys(settingsLogs).length && !isLoadingLogs) || shouldUpdate)) {
      onCaching({
        uid,
        actionType: 'get_user_settings_log',
        depStore: 'settings',
        type: 'logger',
      });
      onSetStatus(false);
      this.setState({
        ...this.state,
        isLoadingLogs: true,
      });
    }

    if (this.refWrapper && this.refColumn) {
      const heightWrapper = this.refWrapper.getBoundingClientRect().height;
      const heightColumn = this.refColumn.getBoundingClientRect().height;

      const isShow = heightWrapper > heightColumn;

      if (isShow !== showScrollbar) {
        return this.setState({
          showScrollbar: isShow,
        });
      }
    } else if (!_.isNull(emailValue) || !_.isNull(telValue)) {
      this.setState({ emailValue: null, telValue: null });
    }
  };

  componentWillUnmount = () => {
    const { haveChanges } = this.state;
    const { onSaveComponentState, path, router } = this.props;
    if (haveChanges && !_.isEqual(router.routeData[path], this.state))
      return onSaveComponentState({ ...this.state, path: path });
  };

  hideMail = (key, event) => {
    const { isHideEmail = false, haveChanges = [] } = this.state;
    if (event !== isHideEmail) {
      const filterChanges = [...haveChanges];
      if (!filterChanges.includes(key)) {
        filterChanges.push(key);
      }
      this.setState({
        ...this.state,
        haveChanges: !filterChanges.length ? [key] : filterChanges,
        isHideEmail: event,
      });
    }
  };

  hidePhone = (key, event) => {
    const { isHidePhone = false, haveChanges = [] } = this.state;
    if (event !== isHidePhone) {
      const filterChanges = [...haveChanges];
      if (!filterChanges.includes(key)) {
        filterChanges.push(key);
      }
      this.setState({
        ...this.state,
        haveChanges: !filterChanges.length ? [key] : filterChanges,
        isHidePhone: event,
      });
    }
  };

  onChangeInput = ({ target = {} }, key) => {
    const { config: { settings: { includeChangeEmail = false } = {} } = {} } = this.context;
    const { haveChanges = [] } = this.state;
    const filterChanges = [...haveChanges];
    if (!filterChanges.includes(key)) {
      filterChanges.push(key);
    }

    if (includeChangeEmail && target?.dataset?.id === 'email') {
      this.setState({
        ...this.state,
        haveChanges: !filterChanges.length ? [key] : filterChanges,
        emailValue: target.value,
      });
    } else if (target?.dataset?.id === 'tel') {
      this.setState({
        ...this.state,
        haveChanges: !filterChanges.length ? [key] : filterChanges,
        telValue: target.value,
      });
    } else if (target?.dataset?.id === 'newPassword') {
      this.setState({
        ...this.state,
        haveChanges: !filterChanges.length ? [key] : filterChanges,
        newPassword: target.value,
      });
    } else if (target?.dataset?.id === 'oldPassword') {
      this.setState({
        ...this.state,
        haveChanges: !filterChanges.length ? [key] : filterChanges,
        oldPassword: target.value,
      });
    }
  };

  onSaveSettings = async (event, settingsKey) => {
    if (settingsKey.includes('password')) {
      this.onChangePassword(settingsKey);
    } else if (settingsKey === 'common') {
      this.onChangeCommon(settingsKey);
    } else if (settingsKey === 'profile') {
      this.onChangeProfile(settingsKey);
    }
  };

  onChangeProfile = async (keyChange) => {
    try {
      const { udata: { _id: uid = '' } = {}, onUpdateUdata = null, onCaching = null } = this.props;
      const { isHideEmail = false, isHidePhone = false, haveChanges } = this.state;
      const { config: { settings: { includeChangeProfile = false } = {} } = {} } = this.context;
      const { Request } = this.context;

      if (!includeChangeProfile) return;

      if (!uid) {
        message.error('Пользователь не найден');
        return;
      }

      const queryParams = {
        isHideEmail,
        isHidePhone,
        uid,
      };
      const rest = new Request();
      const res = await rest.sendRequest('/settings/profile', 'POST', { queryParams }, true);

      if (!res || res.status !== 200) {
        throw new Error('Bad request profile settings');
      }

      if (onUpdateUdata) {
        onUpdateUdata({ isHideEmail, isHidePhone });
      }

      this.setState({
        haveChanges: haveChanges.filter((it) => {
          if (['isHidePhone', 'isHideEmail'].every((key) => key !== it)) return true;
          else return false;
        }),
      });
    } catch (error) {
      if (error?.status !== 404) console.error(error);
    }
  };

  onChangeCommon = async (keyChange) => {
    try {
      const { Request = {} } = this.context;
      const { udata: { _id: uid = '' } = {}, onUpdateUdata = null, onCaching = null } = this.props;
      const { emailValue: newEmail = '', telValue: newPhone = '', haveChanges } = this.state;
      const { config: { settings: { includeChangeEmail = false } = {} } = {} } = this.context;
      if (includeChangeEmail && (!newEmail || !/\w+@\w+\.\D+/i.test(newEmail))) {
        message.error('Формат почты не соблюден');
        return;
      }

      if (!uid) {
        message.error('Пользователь не найден');
        return;
      }

      const queryParams = includeChangeEmail
        ? {
            newEmail,
            newPhone,
            uid,
          }
        : { newPhone, uid };
      const rest = new Request();
      const res = await rest.sendRequest('/settings/common', 'POST', { queryParams }, true);

      if (!res || res.status !== 200) {
        throw new Error('Bad request change password');
      }

      if (onUpdateUdata) {
        onUpdateUdata(includeChangeEmail ? { email: newEmail, phone: newPhone } : { phone: newPhone });
      }

      this.setState({
        haveChanges: haveChanges.filter((it) => {
          if (it !== keyChange) return true;
          else return false;
        }),
      });

      const isOnlyPhone = haveChanges.includes('commonPhone') && !haveChanges.includes('commonEmail');
      const isOnlyEmail = haveChanges.includes('commonEmail') && !haveChanges.includes('commonPhone');

      const msg = isOnlyPhone
        ? 'Телефон обновлен.'
        : isOnlyEmail
        ? 'Почта обновлена.'
        : 'Почта и телефон обновлены.';

      if (!onCaching) return;

      onCaching({
        uid,
        item: {
          uid,
          date: new Date(),
          message: msg,
          depKey: 'settings',
        },
        actionType: 'save_user_settings_log',
        depStore: 'settings',
        type: 'logger',
      });

      this.setState(
        {
          ...this.state,
          haveChanges: [],
        },
        () => {
          message.success('Настройки успешно обновлены.');
        },
      );
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error('Ошибка смены пароля');
    }
  };

  onChangePassword = async (keyChange) => {
    try {
      const { Request = {} } = this.context;
      const { udata: { _id: uid = '' } = {}, onCaching } = this.props;
      const { oldPassword = '', newPassword = '', haveChanges = {} } = this.state;
      if (!oldPassword || !newPassword) {
        message.warning('Формат пароля не верен');
        return;
      }

      if (!uid) {
        message.error('Пользователь не найден');
        return;
      }

      const queryParams = {
        oldPassword,
        newPassword,
        uid,
      };
      const rest = new Request();
      const res = await rest.sendRequest('/settings/password', 'POST', { queryParams }, true);

      if (!res || res.status !== 200) {
        throw new Error('Bad request change password');
      }

      this.setState({
        haveChanges: haveChanges.filter((it) => it !== keyChange),
      });

      const msg = 'Изменение пароля.';

      if (!onCaching) return;

      onCaching({
        uid,
        item: {
          uid,
          date: new Date(),
          message: msg,
          depKey: 'settings',
        },
        actionType: 'save_user_settings_log',
        depStore: 'settings',
        type: 'logger',
      });

      this.setState(
        {
          ...this.state,
          haveChanges: [],
        },
        () => {
          message.success('Пароль изменен.');
        },
      );
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error('Ошибка смены пароля');
    }
  };

  refWrapper = null;
  refColumn = null;
  refFunc = (node) => (this.refWrapper = node);
  refColumnFunc = (node) => (this.refColumn = node);

  render() {
    const {
      emailValue,
      telValue,
      haveChanges,
      oldPassword,
      newPassword,
      isHideEmail,
      isHidePhone,
      isLoadingLogs = false,
    } = this.state;
    const {
      settingsLogs = null,
      shouldUpdate,
      udata: { departament = '', rules = '' },
    } = this.props;
    const {
      config: { settings: { includeChangeEmail = false, includeRulesSettings = false } = {} } = {},
    } = this.context;
    const isLoading = !isLoadingLogs && (!settingsLogs || (settingsLogs && !settingsLogs?.length));
    const text = ` A dog is a type of domesticated animal.`;

    const readonlyPassword = haveChanges.includes('password_new') && haveChanges.includes('password_old');
    const readonlyCommon = haveChanges.includes('commonEmail') || haveChanges.includes('commonPhone');
    const readonlyProfile = haveChanges.includes('isHideEmail') || haveChanges.includes('isHidePhone');
    const isAdmin = departament === 'Admin' && rules === 'full';
    const settingsBlock = (
      <>
        <div ref={this.refFunc}>
          <Collapse defaultActiveKey={['common']}>
            <Panel onChange={this.onUpdate} header="Смена пароля" key="password">
              <div className="configWrapper flexWrapper">
                <span>Старый пароль:</span>
                <Input
                  data-id="oldPassword"
                  type="password"
                  allowClear
                  value={oldPassword}
                  onChange={(e) => this.onChangeInput(e, 'password_old')}
                />
              </div>
              <div className="configWrapper flexWrapper">
                <span>Новый пароль:</span>
                <Input
                  data-id="newPassword"
                  type="password"
                  allowClear
                  value={newPassword}
                  onChange={(e) => this.onChangeInput(e, 'password_new')}
                />
              </div>
              <Button
                onClick={(e) => this.onSaveSettings(e, 'password')}
                className="submit"
                type="primary"
                disabled={!readonlyPassword}
              >
                Принять изменения
              </Button>
            </Panel>
            <Panel onChange={this.onUpdate} header="Общие настройки" key="common">
              <div className="settingsPanel--center-flex">
                {includeChangeEmail ? (
                  <div className="configWrapper flexWrapper">
                    <span>Сменить почту:</span>
                    <Input
                      data-id="email"
                      allowClear
                      value={emailValue}
                      onChange={(e) => this.onChangeInput(e, 'commonEmail')}
                    />
                  </div>
                ) : null}
                <div className="configWrapper flexWrapper">
                  <span>Сменить телефон:</span>
                  <Input
                    data-id="tel"
                    type="tel"
                    allowClear
                    value={telValue}
                    onChange={(e) => this.onChangeInput(e, 'commonPhone')}
                  />
                </div>
              </div>
              <Button
                onClick={(e) => this.onSaveSettings(e, 'common')}
                className="submit"
                type="primary"
                disabled={!readonlyCommon}
              >
                Принять изменения
              </Button>
            </Panel>

            <Panel header="Настройки профиля" key="profile">
              <div className="configWrapper">
                <Switch defaultChecked={isHideEmail} onChange={this.hideMail.bind(this, 'isHideEmail')} />
                <span className="configTitle">Скрывать почту</span>
              </div>
              <div className="configWrapper">
                <Switch defaultChecked={isHidePhone} onChange={this.hidePhone.bind(this, 'isHidePhone')} />
                <span className="configTitle">Скрывать телефон</span>
              </div>
              <Button
                onClick={(e) => this.onSaveSettings(e, 'profile')}
                className="submit"
                type="primary"
                disabled={!readonlyProfile}
              >
                Принять изменения
              </Button>
            </Panel>
            {isAdmin && includeRulesSettings ? (
              <Panel header="Настройки уровней доступа" key="access">
                <Collapse bordered={false}>
                  <Panel header="Администратор" key="admin">
                    {text}
                  </Panel>
                  <Panel header="Начальник отдела" key="headDepartament">
                    {text}
                  </Panel>
                  <Panel header="Сотрудник" key="solider">
                    {text}
                  </Panel>
                </Collapse>
                <Button
                  onClick={(e) => this.onSaveSettings(e, 'access')}
                  className="submit"
                  type="primary"
                  disabled={!haveChanges.includes('profile')}
                >
                  Принять изменения
                </Button>
              </Panel>
            ) : null}
          </Collapse>
        </div>
      </>
    );

    return (
      <div className="settingsModule">
        <TitleModule classNameTitle="settingsModuleTitle" title="Настройки" />
        <div className="settingsModule__main">
          <div ref={this.refColumnFunc} className="col-6">
            <Scrollbars>{settingsBlock}</Scrollbars>
          </div>
          <div className="col-6">
            <ObserverTime isLoading={isLoading} settingsLogs={settingsLogs} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const {
    publicReducer: { udata = {} } = {},
    router: { shouldUpdate = false, currentActionTab = '' } = {},
    router = {},
  } = state;

  return {
    router,
    udata,
    settingsLogs: settingsLogsSelector(state, props),
    shouldUpdate: shouldUpdate && currentActionTab.includes('settings'),
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSaveComponentState: (data) => dispatch(saveComponentStateAction(data)),
    onUpdateUdata: (payload) => dispatch(updateUdata(payload)),
    onCaching: (props) => dispatch(middlewareCaching(props)),
    onSetStatus: (props) => dispatch(setStatus(props)),
  };
};

export { SettingsModule };
export default connect(mapStateToProps, mapDispatchToProps)(SettingsModule);
