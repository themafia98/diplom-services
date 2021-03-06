import React, { PureComponent, createRef } from 'react';
import { settingsModuleType } from './SettingsModule.types';
import { connect } from 'react-redux';
import {
  selectSettingsLogs,
  selectSettingsStatus,
  selectSettingsArtifacts,
  selectSettingsTasksPriority,
} from 'Redux/selectors';
import { message, Select } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import { middlewareCaching } from 'Redux/middleware/publicReducer.thunk';
import ObserverTime from 'Components/ObserverTime';
import Title from 'Components/Title';
import PanelPassword from './Panels/PanelPassword';
import PanelCommon from './Panels/PanelCommon';
import PanelAdmin from './Panels/PanelAdmin';
import PanelProfile from './Panels/PanelProfile';
import actionsTypes from 'actions.types';
import regExpRegister from 'Utils/Tools/regexpStorage';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { withClientDb } from 'Models/ClientSideDatabase';
import { requestTemplate, paramsTemplate } from 'Utils/Api/api.utils';
import { withTranslation } from 'react-i18next';
import { showSystemMessage } from 'Utils';
import { loadSettings, setAppStatus, updateUserData } from 'Redux/reducers/publicReducer.slice';

const { Option } = Select;

class SettingsModule extends PureComponent {
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

  refWrapper = createRef();
  refColumn = createRef();

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
    const { udata } = props;
    const { email: emailValue, phone: telValue, isHideEmail, isHidePhone } = udata;

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
    const { path, udata, onCaching, onSetStatus, clientDB, routeData } = this.props;
    const { _id: uid } = udata;

    if (routeData[path] && routeData[path]?.haveChanges) {
      this.setState({ ...this.state, ...routeData[path] });
    }

    await onSetStatus(false);

    onCaching({
      uid,
      actionType: actionsTypes.$GET_USER_SETTINGS_LOGS,
      depStore: 'settings',
      type: 'logger',
      clientDB,
    });
  };

  componentDidUpdate = async () => {
    const { showScrollbar, emailValue = '', telValue = '' } = this.state;
    const {
      udata,
      path,
      onCaching,
      onSetStatus,
      moduleContext,
      clientDB,
      shouldUpdateRoute,
      routeData,
    } = this.props;
    const { _id: uid } = udata;
    const { visibility = false } = moduleContext;

    if (!visibility) return;

    const { shouldUpdate: shouldUpdateCurrentData = false } = routeData[path] || {};
    const isUnloadModule = shouldUpdateRoute && !routeData[path]?.load;

    if (!isUnloadModule && !shouldUpdateCurrentData) return;

    await onSetStatus(false);
    onCaching({
      uid,
      actionType: actionsTypes.$GET_USER_SETTINGS_LOGS,
      depStore: 'settings',
      type: 'logger',
      clientDB,
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

  onChangePriorityList = async (items, callback = null) => {
    try {
      const { onSaveStatusList, modelsContext } = this.props;
      const { Request } = modelsContext;
      const query = 'tasksPriority';
      const rest = new Request();
      const res = await rest.sendRequest(
        '/settings/tasksPriority',
        'PUT',
        {
          ...requestTemplate,
          moduleName: 'settingsModule',
          actionType: actionsTypes.$SETTINGS_PUT,
          params: {
            ...paramsTemplate,
            query,
            items,
          },
        },
        true,
      );

      if (!res || res.status !== 200) {
        throw new Error('Bad request profile settings');
      }

      const { response = {} } = res.data;
      const { metadata = {} } = response;
      const { idSettings = '', settings = [] } = metadata;

      if (idSettings !== query) {
        throw new Error('Invalid saved settings id');
      }
      onSaveStatusList({ metadata, type: 'update', depKey: idSettings });
      if (callback) callback('tasksPriority', settings);
    } catch (error) {
      if (error?.status !== 404) console.error(error);
    }
  };

  onChangeStatusList = async (items, callback = null) => {
    try {
      const { onSaveStatusList, modelsContext } = this.props;
      const { Request } = modelsContext;
      const query = 'statusSettings';
      const rest = new Request();
      const res = await rest.sendRequest(
        '/settings/statusList',
        'PUT',
        {
          ...requestTemplate,
          moduleName: 'settingsModule',
          actionType: actionsTypes.$SETTINGS_PUT,
          params: {
            ...paramsTemplate,
            query,
            items,
          },
        },
        true,
      );

      if (!res || res.status !== 200) {
        throw new Error('Bad request profile settings');
      }

      const { response = {} } = res.data;
      const { metadata = {} } = response;
      const { idSettings = '', settings = [] } = metadata;

      if (idSettings !== query) {
        throw new Error('Invalid saved settings id');
      }
      onSaveStatusList({ metadata, type: 'update', depKey: idSettings });
      if (callback) callback('statusSettings', settings);
    } catch (error) {
      if (error?.status !== 404) console.error(error);
    }
  };

  onSaveSettings = async (settingsKey = '', state = {}, callback = null) => {
    const runChangeAction = async (key, customState = null) => {
      const values = customState ? customState : state;
      switch (key) {
        case 'password':
          return await this.onChangePassword(values, callback);
        case 'common':
          return await this.onChangeCommon(values, callback);
        case 'profile':
          return await this.onChangeProfile(values, callback);
        case 'statusSettings':
          return await this.onChangeStatusList(values, callback);
        case 'tasksPriority':
          return await this.onChangePriorityList(values, callback);
        default:
          return;
      }
    };

    if (Array.isArray(state)) {
      let index = 0;
      for await (const key of settingsKey) {
        await runChangeAction(key, state[index]);
        index++;
      }
      return;
    }

    if (Array.isArray(settingsKey)) {
      for await (const key of settingsKey) {
        await runChangeAction(key);
      }
      return;
    }

    runChangeAction(settingsKey);
  };

  onChangeProfile = async (state, callback) => {
    try {
      const { udata, onUpdateUdata = null, modelsContext, appConfig, t } = this.props;
      const { isHideEmail = false, isHidePhone = false } = state;
      const {
        settings: { includeChangeProfile = false },
      } = appConfig;
      const { _id: uid } = udata;
      const { Request } = modelsContext;

      if (!includeChangeProfile) return;

      if (!uid) {
        message.error(t('settingsModule_messages_userNotFound'));
        return;
      }

      const rest = new Request();
      const res = await rest.sendRequest(
        '/settings/profile',
        'POST',
        {
          ...requestTemplate,
          moduleName: 'settingsModule',
          actionType: actionsTypes.$SETTINGS_PUT,
          params: {
            ...paramsTemplate,
            options: {
              isHideEmail,
              isHidePhone,
              uid,
            },
          },
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
    const {
      udata,
      onUpdateUdata = null,
      onCaching = null,
      modelsContext,
      clientDB,
      appConfig,
      t,
    } = this.props;
    const { _id: uid } = udata;
    try {
      const { emailValue: newEmail = '', telValue: newPhone = '', haveChanges = [] } = state;
      const { settings: { includeChangeEmail = false } = {} } = appConfig;
      const { Request } = modelsContext;
      if (includeChangeEmail && (!newEmail || !regExpRegister.VALID_EMAIL.test(newEmail))) {
        message.error(t('settingsModule_messages_badEmail'));
        return;
      }

      if (!uid) {
        message.error(t('settingsModule_messages_userNotFound'));
        return;
      }

      const params = {
        ...paramsTemplate,
        options: includeChangeEmail
          ? {
              newEmail,
              newPhone,
              uid,
            }
          : { newPhone, uid },
      };

      const rest = new Request();
      const res = await rest.sendRequest(
        '/settings/common',
        'POST',
        {
          ...requestTemplate,
          actionType: actionsTypes.$SETTINGS_PUT,
          params,
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
        ? t('settingsModule_messages_phoneUpdate')
        : isOnlyEmail
        ? t('settingsModule_messages_emailUpdate')
        : t('settingsModule_messages_emailPhoneUpdate');

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
        clientDB,
      });

      message.success(t('settingsModule_messages_updateSettings'));
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error(t('settingsModule_messsages_invalidChangePassword'));
    }
  };

  onChangePassword = async (state, callback) => {
    const { t, udata, onCaching, modelsContext, clientDB } = this.props;
    const { _id: uid } = udata;
    try {
      const { Request = {} } = modelsContext;

      const { oldPassword = '', newPassword = '' } = state;
      if (!oldPassword || !newPassword) {
        message.warning(t('settingsModule_messages_badPassword'));
        return;
      }

      if (!uid) {
        message.error(t('settingsModule_messages_userNotFound'));
        return;
      }

      const rest = new Request();
      const res = await rest.sendRequest(
        '/settings/password',
        'POST',
        {
          ...requestTemplate,
          actionType: actionsTypes.$SETTINGS_PUT,
          params: {
            ...paramsTemplate,
            options: {
              oldPassword,
              newPassword,
              uid,
            },
          },
        },
        true,
      );

      if (!res || res.status !== 200) {
        throw new Error('Bad request change password');
      }

      if (callback) callback();

      const msg = t('settingsModule_messageChange');

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
        clientDB,
      });

      message.success(t('settingsModule_messages_passwordUpdate'));
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error(t('settingsModule_messages_errorChangePassword'));
    }
  };

  handleChangeLanguage = async (lang) => {
    const { i18n, modelsContext, udata } = this.props;
    const { Request } = modelsContext;
    const { _id: uid } = udata;

    if (i18n.language === lang) {
      return;
    }

    try {
      const rest = new Request();
      const res = await rest.sendRequest(
        '/settings/language',
        'POST',
        {
          ...requestTemplate,
          moduleName: 'settingsModule',
          actionType: actionsTypes.$SETTINGS_PUT,
          params: {
            ...paramsTemplate,
            options: {
              lang,
              uid,
            },
          },
        },
        true,
      );

      if (res.status !== 200) {
        throw new Error('Error action to save language');
      }
    } catch (error) {
      console.error(error);

      const message = typeof error === 'string' ? error : error?.message;

      showSystemMessage('error', message);
    } finally {
      i18n.changeLanguage(lang);
    }
  };

  render() {
    const { emailValue, telValue, oldPassword, newPassword, isHideEmail, isHidePhone } = this.state;
    const {
      settingsLogs = null,
      udata,
      settingsStatus = [],
      settingsTasksPriority = [],
      appConfig,
      isLoad,
      t,
      i18n,
    } = this.props;
    const { departament } = udata;
    const { settings: settingsConfig = {} } = appConfig;
    const { includeRulesSettings = false } = settingsConfig;

    const isAdmin = departament === 'Admin';
    return (
      <div className="settingsModule">
        <Title classNameTitle="settingsModuleTitle" title={t('settingsModule_title')} />
        <div className="settingsModule__main">
          <div ref={this.refColumn} className="col-6">
            <Scrollbars autoHide hideTracksWhenNotNeeded>
              <div ref={this.refWrapper}>
                <PanelPassword
                  oldPassword={oldPassword}
                  newPassword={newPassword}
                  appConfig={appConfig}
                  onSaveSettings={this.onSaveSettings}
                />
                <PanelCommon
                  onSaveSettings={this.onSaveSettings}
                  emailValue={emailValue}
                  appConfig={appConfig}
                  telValue={telValue}
                />
                <PanelProfile
                  onSaveSettings={this.onSaveSettings}
                  isHideEmail={isHideEmail}
                  appConfig={appConfig}
                  isHidePhone={isHidePhone}
                />
                {isAdmin && includeRulesSettings ? (
                  <PanelAdmin
                    statusList={settingsStatus}
                    settingsTasksPriority={settingsTasksPriority}
                    onSaveSettings={this.onSaveSettings}
                  />
                ) : null}
                <div className="settingsModule__language">
                  <Select defaultValue={i18n.language} onSelect={this.handleChangeLanguage}>
                    {i18n.languages.map((lang) => (
                      <Option key={lang} value={lang}>
                        {lang}
                      </Option>
                    ))}
                  </Select>
                </div>
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
  const { publicReducer, router } = state;
  const { shouldUpdate = false, currentActionTab = '', routeData } = router;
  const { udata, caches, appConfig } = publicReducer;

  const isLoad = Object.keys(caches).some((key) => key.includes(actionsTypes.$GET_USER_SETTINGS_LOGS));

  return {
    shouldUpdateRoute: shouldUpdate,
    routeData,
    udata,
    settingsStatus: selectSettingsStatus(state, props),
    settingsTasksPriority: selectSettingsTasksPriority(state, props),
    artifacts: selectSettingsArtifacts(state, props),
    settingsLogs: selectSettingsLogs(state, props),
    shouldUpdate: shouldUpdate && currentActionTab.includes('settings'),
    isLoad,
    appConfig,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onUpdateUdata: (payload) => dispatch(updateUserData(payload)),
    onCaching: (props) => dispatch(middlewareCaching(props)),
    onSetStatus: (props) => dispatch(setAppStatus(props)),
    onSaveStatusList: (payload) => dispatch(loadSettings(payload)),
  };
};

export { SettingsModule };
export default compose(
  moduleContextToProps,
  withClientDb,
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
)(SettingsModule);
