import React, { Component } from 'react';
import { appType } from './types';
import _ from 'lodash';
import { connect } from 'react-redux';
import RenderInBrowser from 'react-render-in-browser';
import { Switch, Route } from 'react-router-dom';
import { message, notification } from 'antd';
import { PrivateRoute } from './Components/Helpers';
import { forceUpdateDetectedInit } from './Utils';
import { settingsLoadAction } from './Redux/actions/publicActions/middleware';
import { setStatus, loadUdata, loadCoreConfigAction } from './Redux/actions/publicActions';
import { addTabAction, setActiveTabAction, logoutAction } from './Redux/actions/routerActions';

import { routeParser } from './Utils';

import Loader from './Components/Loader';
import Recovery from './Pages/Recovery';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import 'moment/locale/ru';
import ModelContext from './Models/context';
import Demo from './Pages/Demo';
import worker from 'workerize-loader!worker'; // eslint-disable-line import/no-webpack-loader-syntax
import actionsTypes from 'actions.types';
import { compose } from 'redux';
import ClientSideDatabase, { ClientDbContext } from 'Models/ClientSideDatabase';
import withSystemConfig from 'Components/Helpers/withSystemConfig';

const workerInstanse = worker();

class App extends Component {
  state = {
    loadState: false,
    isUser: false,
    sync: false,
  };

  static contextType = ModelContext;
  static propTypes = appType;
  loadingSettingsLoop = null;
  client = null;

  componentDidMount = async () => {
    const {
      coreConfig: { appActive = true, forceUpdate = false, clientDB: { name = '', version = '' } = {} } = {},
      coreConfig = {},
      onLoadCoreConfig,
    } = this.props;
    const { Request } = this.context;
    if (!appActive) return;

    if (onLoadCoreConfig && coreConfig && typeof coreConfig === 'object') {
      onLoadCoreConfig({ ...coreConfig });
    }

    this.client = name && version ? new ClientSideDatabase(name, version) : null;
    if (this.client) await this.client.init();

    if (window.location.pathname === '/demoPage') {
      return this.loadApp();
    }

    const rest = new Request();
    rest
      .authCheck()
      .then((res) => {
        if (res.status === 200) {
          this.loadAppSession();
        } else {
          throw new Error(res.message);
        }
      })
      .catch((error) => {
        console.warn(error);
        this.loadApp();
      });
    if (forceUpdate === true || forceUpdate === 'true') forceUpdateDetectedInit();
  };

  componentDidUpdate = async (prevProps) => {
    const { typeConfig: prevTypeConfig = '', coreConfig: prevCoreConfig = {} } = prevProps;
    const {
      onLoadCoreConfig,
      coreConfig,
      typeConfig = '',
      coreConfig: { clientDB: { name = '', version = '' } = {} } = {},
      appConfig = {},
      udata = {},
    } = this.props;
    const { sync } = this.state;

    if (!sync && localStorage.getItem('token') && udata && !_.isEmpty(udata) && this.client) {
      this.setState(
        {
          sync: true,
        },
        () => {
          workerInstanse.runSync(localStorage.getItem('token'), this.client);
        },
      );
    }

    if (!this.client && name && version) {
      this.client = new ClientSideDatabase(name, version);
      await this.client.init();
    }

    if (prevTypeConfig === typeConfig && _.isEqual(appConfig, coreConfig)) return;

    if (
      typeof coreConfig === 'object' &&
      coreConfig &&
      !_.isEqual(coreConfig, prevCoreConfig) &&
      onLoadCoreConfig
    ) {
      onLoadCoreConfig({ ...coreConfig });
    }
  };

  loadAppSession = async () => {
    const { router: { currentActionTab = '', activeTabs = [] } = {}, coreConfig = {} } = this.props;
    const { appActive = true, menu = [], tabsLimit = 20 } = coreConfig;
    const { Request } = this.context;
    if (!appActive) return;
    const rest = new Request();

    try {
      const res = await rest.sendRequest(
        '/userload',
        'POST',
        {
          actionType: actionsTypes.$LOAD_SESSION_USER,
        },
        true,
      );

      if (res?.status !== 200) throw new Error('Bad user data');

      let path = 'mainModule';
      const defaultModule = menu.find((item) => item?.SIGN === 'default');
      if (defaultModule) path = defaultModule?.EUID;

      const activeTabsCopy = [...activeTabs];
      const isFind = activeTabsCopy.findIndex((tab) => tab === path) !== -1;

      const { data = {} } = res || {};
      const { user = {} } = data;

      const udata = Object.keys(user).reduce((acc, key) => {
        return key !== 'token'
          ? {
              ...acc,
              [key]: res.data?.user[key],
            }
          : acc || {};
      }, {});

      if (!isFind && tabsLimit <= activeTabsCopy.length)
        return message.error(`Максимальное количество вкладок: ${tabsLimit}`);
      const isUserData = udata && !_.isEmpty(udata);

      if ((currentActionTab !== path || !isFind) && isUserData) this.initialSession(udata, path, true);
      else if (!isUserData) return rest.signOut();
    } catch (error) {
      const { response: { data = '' } = {}, message = '' } = error || {};
      this.showErrorMessage(data || message || error);
      console.error(error);
      return rest.signOut();
    }

    return this.setState({ authLoad: true, loadState: true });
  };

  showErrorMessage = (error = '') => {
    notification.error({
      message: 'Ошибка',
      description: error,
    });
  };

  initialSession = async (udata = null, path = '') => {
    const { addTab, onLoadUdata, fetchConfig } = this.props;

    try {
      if (!udata || !path) {
        this.showErrorMessage('Ошибка загрузки рабочего стола.');
        return;
      }
      await fetchConfig('private');
      await onLoadUdata(udata);
      await this.loadSettings();

      await addTab(routeParser({ path }));
    } catch (error) {
      const { response: { data = '' } = {}, message = '' } = error || {};
      this.showErrorMessage(data || message || error);
      console.log(error);
    }
  };

  loadSettings = async () => {
    const { onLoadSettings = null } = this.props;

    if (this.loadingSettingsLoop) clearInterval(this.loadingSettingsLoop);
    await onLoadSettings({ wishList: [{ name: 'statusList' }] });

    this.loadingSettingsLoop = setInterval(async () => {
      await onLoadSettings({ wishList: [{ name: 'statusList' }] });
    }, 30000);
  };

  loadApp = () => {
    return this.setState({ loadState: true });
  };

  withoutIE = (children) => {
    return (
      <>
        <RenderInBrowser ie only>
          <div className="ie-only">
            <p>Приложение не поддерживает браузер IE, предлагаем установить другой браузер.</p>
          </div>
        </RenderInBrowser>
        <RenderInBrowser except ie>
          {children}
        </RenderInBrowser>
      </>
    );
  };

  getCoreConfig = () => {
    const { coreConfig = null } = this.props;
    return coreConfig;
  };

  render() {
    const { loadState, authLoad } = this.state;
    const {
      onLogoutAction,
      onSetStatus,
      coreConfig: { supportIE = true, appActive = true, unactiveAppMsg = '' } = {},
    } = this.props;

    if (!appActive) {
      return <div className="app-unactive">{unactiveAppMsg}</div>;
    }

    const publicActions = {
      getCoreConfig: this.getCoreConfig,
      initialSession: this.initialSession,
    };

    const privateActions = {
      onSetStatus,
      onLogoutAction,
      getCoreConfig: this.getCoreConfig,
    };

    const route = (
      <Switch>
        <Route exact path="/recovory" render={(props) => <Recovery {...props} {...publicActions} />} />
        <PrivateRoute exact path="/dashboard" {...privateActions} component={Dashboard} />
        <Route exact path="/demoPage" render={(props) => <Demo {...props} {...publicActions} />} />
        <Route
          exact
          path="*"
          render={(props) => <LoginPage {...props} {...publicActions} authLoad={authLoad} />}
        />
      </Switch>
    );

    if (loadState && this.client)
      return (
        <ClientDbContext.Provider value={this.client}>
          {!supportIE ? this.withoutIE(route) : route}
        </ClientDbContext.Provider>
      );
    else return <Loader title="Загрузка состояния приложения" />;
  }
}

const mapStateToProps = (state) => {
  const { router, publicReducer, publicReducer: { udata = {} } = {} } = state;
  return {
    router,
    publicReducer,
    udata,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addTab: async (tab) => await dispatch(addTabAction(tab)),
    onSetStatus: (status) => dispatch(setStatus({ statusRequst: status })),
    setCurrentTab: (tab) => dispatch(setActiveTabAction(tab)),
    onLogoutAction: async () => await dispatch(logoutAction()),
    onLoadUdata: async (udata) => await dispatch(loadUdata(udata)),
    onLoadSettings: async (payload) => await dispatch(settingsLoadAction(payload)),
    onLoadCoreConfig: (payload) => dispatch(loadCoreConfigAction(payload)),
  };
};

export default compose(withSystemConfig, connect(mapStateToProps, mapDispatchToProps))(App);
