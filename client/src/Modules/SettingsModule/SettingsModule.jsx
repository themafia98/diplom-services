import React, { PureComponent, createRef } from 'react';
import { settingsModuleType } from './SettingsModule.types';
import { connect } from 'react-redux';
import { settingsLogsSelector, settingsStatusSelector, settingsArtifactsSelector } from 'Redux/selectors';
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
import { withClientDb } from 'Models/ClientSideDatabase';
import { requestTemplate, paramsTemplate } from 'Utils/Api/api.utils';
import { withTranslation } from 'react-i18next';

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
    const { router, path, udata: { _id: uid = '' } = {}, onCaching, onSetStatus, clientDB } = this.props;

    if (router?.routeData[path] && router?.routeData[path]?.haveChanges) {
      this.setState({ ...this.state, ...router.routeData[path] });
    }

    await onSetStatus(false);

    onCaching({
      uid,
      actionType: 'get_user_settings_log',
      depStore: 'settings',
      type: 'logger',
      clientDB,
    });
  };

  componentDidUpdate = async () => {
    const { showScrollbar, emailValue = '', telValue = '' } = this.state;
    const { udata = {}, router, path, onCaching, onSetStatus, moduleContext, clientDB } = this.props;
    const { shouldUpdate = false, routeData = {} } = router;
    const { _id: uid = '' } = udata;
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
      const { udata: { _id: uid = '' } = {}, onUpdateUdata = null, modelsContext, appConfig, t } = this.props;
      const { isHideEmail = false, isHidePhone = false } = state;
      const {
        settings: { includeChangeProfile = false },
      } = appConfig;
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
      udata: { _id: uid = '' } = {},
      onUpdateUdata = null,
      onCaching = null,
      modelsContext,
      clientDB,
      appConfig,
      t,
    } = this.props;

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
    const { t, udata: { _id: uid = '' } = {}, onCaching, modelsContext, clientDB } = this.props;
    try {
      const { Request = {} } = modelsContext;

      const { oldPassword = '', newPassword = '' } = state;
      if (!oldPassword || !newPassword) {
        message.warning(t('settingsModule_messsages_badPassword'));
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

  render() {
    const { emailValue, telValue, oldPassword, newPassword, isHideEmail, isHidePhone } = this.state;
    const {
      settingsLogs = null,
      udata: { departament = '', rules = '' } = {},
      settings = [],
      appConfig,
      isLoad,
      t,
    } = this.props;
    const { settings: settingsConfig = {} } = appConfig;
    const { includeRulesSettings = false } = settingsConfig;

    const isAdmin = departament === 'Admin' && rules === 'full';
    return (
      <div className="settingsModule">
        <TitleModule classNameTitle="settingsModuleTitle" title={t('settingsModule_title')} />
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
  const { publicReducer, router } = state;
  const { shouldUpdate = false, currentActionTab = '' } = router;
  const { udata = {}, caches, appConfig } = publicReducer;

  const isLoad = Object.keys(caches).some((key) => key.includes('get_user_settings_log'));

  return {
    router,
    udata,
    settings: settingsStatusSelector(state, props),
    artifacts: settingsArtifactsSelector(state, props),
    settingsLogs: settingsLogsSelector(state, props),
    shouldUpdate: shouldUpdate && currentActionTab.includes('settings'),
    isLoad,
    appConfig,
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
export default compose(
  moduleContextToProps,
  withClientDb,
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
)(SettingsModule);
