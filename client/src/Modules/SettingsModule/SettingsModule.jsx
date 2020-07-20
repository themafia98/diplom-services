import React from 'react';
import { settingsModuleType } from './types';
import { connect } from 'react-redux';
import { settingsLogsSelector, settingsStatusSelector, settingsArtifactsSelector } from 'Utils/selectors';
import { saveComponentStateAction } from 'Redux/actions/routerActions';
import { updateUdata, setStatus, onLoadSettings } from 'Redux/actions/publicActions';
import { message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import { middlewareCaching } from 'Redux/actions/publicActions/middleware';

import ObserverTime from 'Components/ObserverTime';
import TitleModule from 'Components/TitleModule';

import PanelPassword from './Panels/PanelPassword';
import PanelCommon from './Panels/PanelCommon';
import PanelAdmin from './Panels/PanelAdmin';
import PanelProfile from './Panels/PanelProfile';
import actionsTypes from 'actions.types';
import regExpRegister from 'Utils/Tools/regexpStorage';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';

class SettingsModule extends React.PureComponent {
  state = {
    showScrollbar: false,
    emailValue: null,
    telValue: null,
    newPassword: '',
    oldPassword: '',
    isHideEmail: null,
    isHidePhone: null,
    statusList: [],
  };

  refWrapper = React.createRef();
  refColumn = React.createRef();

  static propTypes = settingsModuleType;
  static defaultProps = {
    udata: {
      email: null,
      phone: null,
      isHideEmail: null,
      isHidePhone: null,
    },
    settingsLogs: [],
  };

  static getDerivedStateFromProps = (props, state) => {
    const { udata: { email: emailValue, phone: telValue, isHideEmail, isHidePhone } = {} } = props;

    if (
      [state.emailValue, state.telValue, state.isHideEmail, state.isHidePhone].every(
        (value) => value === null,
      )
    ) {
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

  componentDidMount = async () => {
    const { router, path, udata: { _id: uid = '' } = {}, onCaching, onSetStatus } = this.props;

    if (router?.routeData[path] && router?.routeData[path]?.haveChanges) {
      this.setState({ ...this.state, ...router.routeData[path] });
    }

    await onSetStatus(false);

    onCaching({
      uid,
      actionType: 'get_user_settings_log',
      depStore: 'settings',
      type: 'logger',
    });
  };

  componentDidUpdate = async () => {
    const { showScrollbar, emailValue = '', telValue = '' } = this.state;
    const {
      udata: { _id: uid = '' } = {},
      router: { shouldUpdate = false, routeData = {} } = {},
      path,
      onCaching,
      onSetStatus,
      moduleContext,
    } = this.props;
    const { visibility = false } = moduleContext;

    if (!visibility) return;

    const { shouldUpdate: shouldUpdateCurrentData = false } = routeData[path] || {};
    const isUnloadModule = shouldUpdate && !routeData[path]?.load;

    if (!isUnloadModule && !shouldUpdateCurrentData) return;

    await onSetStatus(false);
    onCaching({
      uid,
      actionType: 'get_user_settings_log',
      depStore: 'settings',
      type: 'logger',
    });

    if (this.refWrapper?.current && this.refColumn?.current) {
      const { current: wrapperNode } = this.refWrapper;
      const { current: columnNode } = this.refColumn;

      const heightWrapper = wrapperNode?.getBoundingClientRect()?.height || 0;
      const heightColumn = columnNode?.getBoundingClientRect()?.height || 0;

      const isShow = heightWrapper > heightColumn;

      if (isShow === showScrollbar) return;

      this.setState({ ...this.state, showScrollbar: isShow });
    } else if ([emailValue, telValue].some((type) => type !== null)) {
      this.setState({ ...this.state, emailValue: null, telValue: null });
    }
  };

  onChangeStatusList = async (state, callback = null) => {
    try {
      const { onSaveStatusList, modelsContext } = this.props;
      const { Request } = modelsContext;

      const queryParams = {
        idSettings: 'statusSettings',
        items: state,
      };

      const rest = new Request();
      const res = await rest.sendRequest(
        '/settings/statusList',
        'PUT',
        {
          actionType: actionsTypes.$SETTINGS_PUT,
          queryParams,
        },
        true,
      );

      if (!res || res.status !== 200) {
        throw new Error('Bad request profile settings');
      }

      const {
        data: {
          response: { metadata: { idSettings: saveSettingsId = '', settings = [] } = {}, metadata = {} } = {},
        } = {},
      } = res;

      if (saveSettingsId !== queryParams.idSettings) {
        throw new Error('Invalid saved settings id');
      }
      onSaveStatusList({ metadata, type: 'update', depKey: saveSettingsId });
      if (callback) callback(settings);
    } catch (error) {
      if (error?.status !== 404) console.error(error);
    }
  };

  onSaveSettings = (settingsKey = '', state = {}, callback = null) => {
    switch (settingsKey) {
      case 'password':
        return this.onChangePassword(state, callback);
      case 'common':
        return this.onChangeCommon(state, callback);
      case 'profile':
        return this.onChangeProfile(state, callback);
      case 'statusSettings':
        return this.onChangeStatusList(state, callback);

      default:
        return;
    }
  };

  onChangeProfile = async (state, callback) => {
    try {
      const { udata: { _id: uid = '' } = {}, onUpdateUdata = null, modelsContext } = this.props;
      const { isHideEmail = false, isHidePhone = false } = state;
      const { config: { settings: { includeChangeProfile = false } = {} } = {}, Request } = modelsContext;

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
      const res = await rest.sendRequest(
        '/settings/profile',
        'POST',
        {
          actionType: actionsTypes.$SETTINGS_PUT,
          queryParams,
        },
        true,
      );

      if (!res || res.status !== 200) {
        throw new Error('Bad request profile settings');
      }

      if (onUpdateUdata) {
        onUpdateUdata({ isHideEmail, isHidePhone });
      }

      if (callback) callback();
    } catch (error) {
      if (error?.status !== 404) console.error(error);
    }
  };

  onChangeCommon = async (state, callback) => {
    try {
      const {
        udata: { _id: uid = '' } = {},
        onUpdateUdata = null,
        onCaching = null,
        modelsContext,
      } = this.props;
      const { emailValue: newEmail = '', telValue: newPhone = '', haveChanges = [] } = state;
      const { config: { settings: { includeChangeEmail = false } = {} } = {}, Request } = modelsContext;
      if (includeChangeEmail && (!newEmail || !regExpRegister.VALID_EMAIL.test(newEmail))) {
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
      const res = await rest.sendRequest(
        '/settings/common',
        'POST',
        {
          actionType: actionsTypes.$SETTINGS_PUT,
          queryParams,
        },
        true,
      );

      if (!res || res.status !== 200) {
        throw new Error('Bad request change password');
      }

      if (onUpdateUdata) {
        onUpdateUdata(includeChangeEmail ? { email: newEmail, phone: newPhone } : { phone: newPhone });
      }

      if (callback) callback();

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

      message.success('Настройки успешно обновлены.');
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error('Ошибка смены пароля');
    }
  };

  onChangePassword = async (state, callback) => {
    try {
      const { udata: { _id: uid = '' } = {}, onCaching, modelsContext } = this.props;
      const { Request = {} } = modelsContext;

      const { oldPassword = '', newPassword = '' } = state;
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
      const res = await rest.sendRequest(
        '/settings/password',
        'POST',
        {
          actionType: actionsTypes.$SETTINGS_PUT,
          queryParams,
        },
        true,
      );

      if (!res || res.status !== 200) {
        throw new Error('Bad request change password');
      }

      if (callback) callback();

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

      message.success('Пароль изменен.');
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error('Ошибка смены пароля');
    }
  };

  render() {
    const { emailValue, telValue, oldPassword, newPassword, isHideEmail, isHidePhone } = this.state;
    const {
      settingsLogs = null,
      udata: { departament = '', rules = '' } = {},
      settings = [],
      modelsContext,
      isLoad,
    } = this.props;
    const { config: { settings: { includeRulesSettings = false } = {} } = {} } = modelsContext;

    const isAdmin = departament === 'Admin' && rules === 'full';
    return (
      <div className="settingsModule">
        <TitleModule classNameTitle="settingsModuleTitle" title="Настройки" />
        <div className="settingsModule__main">
          <div ref={this.refColumn} className="col-6">
            <Scrollbars autoHide hideTracksWhenNotNeeded>
              <div ref={this.refWrapper}>
                <PanelPassword
                  oldPassword={oldPassword}
                  newPassword={newPassword}
                  onSaveSettings={this.onSaveSettings}
                />
                <PanelCommon
                  onSaveSettings={this.onSaveSettings}
                  emailValue={emailValue}
                  telValue={telValue}
                />
                <PanelProfile
                  onSaveSettings={this.onSaveSettings}
                  isHideEmail={isHideEmail}
                  isHidePhone={isHidePhone}
                />
                {isAdmin && includeRulesSettings ? (
                  <PanelAdmin statusList={settings} onSaveSettings={this.onSaveSettings} />
                ) : null}
              </div>
            </Scrollbars>
          </div>
          <div className="col-6">
            <ObserverTime isLoading={!isLoad} settingsLogs={settingsLogs} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state, props) => {
  const {
    publicReducer: { udata = {}, caches } = {},
    router: { shouldUpdate = false, currentActionTab = '' } = {},
    router = {},
  } = state;

  const isLoad = Object.keys(caches).some((key) => key.includes('get_user_settings_log'));

  return {
    router,
    udata,
    settings: settingsStatusSelector(state, props),
    artifacts: settingsArtifactsSelector(state, props),
    settingsLogs: settingsLogsSelector(state, props),
    shouldUpdate: shouldUpdate && currentActionTab.includes('settings'),
    isLoad,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSaveComponentState: (data) => dispatch(saveComponentStateAction(data)),
    onUpdateUdata: (payload) => dispatch(updateUdata(payload)),
    onCaching: (props) => dispatch(middlewareCaching(props)),
    onSetStatus: (props) => dispatch(setStatus(props)),
    onSaveStatusList: (payload) => dispatch(onLoadSettings(payload)),
  };
};

export { SettingsModule };
export default compose(moduleContextToProps, connect(mapStateToProps, mapDispatchToProps))(SettingsModule);
