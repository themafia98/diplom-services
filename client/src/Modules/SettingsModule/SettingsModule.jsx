// @ts-nocheck
import React from 'react';
import { settingsModuleType } from './types';
import _ from 'lodash';
import { connect } from 'react-redux';
import {
  settingsLogsSelector,
  settingsStatusSelector,
  settingsArtifactsSelector,
} from '../../Utils/selectors';
import { saveComponentStateAction } from '../../Redux/actions/routerActions';
import { updateUdata, setStatus, onLoadSettings } from '../../Redux/actions/publicActions';
import { message } from 'antd';
import Scrollbars from 'react-custom-scrollbars';
import { middlewareCaching } from '../../Redux/actions/publicActions/middleware';
import modelContext from '../../Models/context';
import ObserverTime from '../../Components/ObserverTime';
import TitleModule from '../../Components/TitleModule';

import PanelPassword from './Panels/PanelPassword';
import PanelCommon from './Panels/PanelCommon';
import PanelAdmin from './Panels/PanelAdmin';
import PanelProfile from './Panels/PanelProfile';

class SettingsModule extends React.PureComponent {
  state = {
    showScrollbar: false,
    emailValue: null,
    isLoadingLogs: false,
    telValue: null,
    newPassword: '',
    oldPassword: '',
    isHideEmail: null,
    isHidePhone: null,
    statusList: [],
  };

  static propTypes = settingsModuleType;
  static contextType = modelContext;
  static defaultProps = {
    udata: {},
    settingsLogs: [],
  };

  refWrapper = null;
  refColumn = null;
  refFunc = (node) => (this.refWrapper = node);
  refColumnFunc = (node) => (this.refColumn = node);

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

  onChangeStatusList = async (state, callback = null) => {
    try {
      const { Request } = this.context;
      const { onSaveStatusList } = this.props;

      const queryParams = {
        idSettings: 'statusSettings',
        items: state,
      };

      const rest = new Request();
      const res = await rest.sendRequest('/settings/statusList', 'PUT', { queryParams }, true);

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
      const { udata: { _id: uid = '' } = {}, onUpdateUdata = null } = this.props;
      const { isHideEmail = false, isHidePhone = false } = state;
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

      if (callback) callback();
    } catch (error) {
      if (error?.status !== 404) console.error(error);
    }
  };

  onChangeCommon = async (state, callback) => {
    try {
      const { Request = {} } = this.context;
      const { udata: { _id: uid = '' } = {}, onUpdateUdata = null, onCaching = null } = this.props;
      const { emailValue: newEmail = '', telValue: newPhone = '', haveChanges = [] } = state;
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
      const { Request = {} } = this.context;
      const { udata: { _id: uid = '' } = {}, onCaching } = this.props;
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
      const res = await rest.sendRequest('/settings/password', 'POST', { queryParams }, true);

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
    const {
      emailValue,
      telValue,
      oldPassword,
      newPassword,
      isHideEmail,
      isHidePhone,
      isLoadingLogs = false,
    } = this.state;
    const { settingsLogs = null, udata: { departament = '', rules = '' } = {}, settings = [] } = this.props;
    const { config: { settings: { includeRulesSettings = false } = {} } = {} } = this.context;

    const isLoading = !isLoadingLogs && (!settingsLogs || (settingsLogs && !settingsLogs?.length));
    const isAdmin = departament === 'Admin' && rules === 'full';
    return (
      <div className="settingsModule">
        <TitleModule classNameTitle="settingsModuleTitle" title="Настройки" />
        <div className="settingsModule__main">
          <div ref={this.refColumnFunc} className="col-6">
            <Scrollbars>
              <div ref={this.refFunc}>
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
    settings: settingsStatusSelector(state, props),
    artifacts: settingsArtifactsSelector(state, props),
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
    onSaveStatusList: (payload) => dispatch(onLoadSettings(payload)),
  };
};

export { SettingsModule };
export default connect(mapStateToProps, mapDispatchToProps)(SettingsModule);
