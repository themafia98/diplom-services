import React, { Component } from 'react';
import { appType } from './App.types';
import _ from 'lodash';
import { connect } from 'react-redux';
import RenderInBrowser from 'react-render-in-browser';
import { Switch, Route } from 'react-router-dom';
import { message } from 'antd';
import { PrivateRoute } from './Components/Helpers';
import { forceUpdateDetectedInit, showSystemMessage } from './Utils';
import { settingsLoadAction } from './Redux/middleware/publicReducer.thunk';
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
import { withTranslation } from 'react-i18next';
import { setSystemMessage } from 'Redux/reducers/systemReducer.slice';
import { loadCoreConfig, loadUserData, setAppStatus } from 'Redux/reducers/publicReducer.slice';
import { createTab, setActiveTab, setLogout } from 'Redux/reducers/routerReducer.slice';
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
    const { coreConfig = {}, onLoadCoreConfig } = this.props;

    const { appActive = true, forceUpdate = false, clientDB = {} } = coreConfig;
    const { name = '', version = '' } = clientDB;

    const { Request } = this.context;

    if (!appActive) {
      console.log('Application unactive');
      return;
    }

    if (onLoadCoreConfig && coreConfig && typeof coreConfig === 'object') {
      onLoadCoreConfig({ ...coreConfig });
    }

    this.client = name && version ? new ClientSideDatabase(name, version) : null;

    if (this.client) {
      await this.client.init();
    }

    if (window.location.pathname === '/demoPage') {
      return this.loadApp();
    }

    const rest = new Request();

    try {
      const response = await rest.authCheck();

      if (response.status === 200) {
        this.loadAppSession();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      console.error(error);
      this.loadApp();
    }

    if (forceUpdate === true || forceUpdate === 'true') {
      forceUpdateDetectedInit();
    }
  };

  componentDidUpdate = async (prevProps) => {
    const { typeConfig: prevTypeConfig = '', coreConfig: prevCoreConfig = {} } = prevProps;
    const {
      onLoadCoreConfig,
      typeConfig,
      coreConfig,
      appConfig,
      udata,
      onSetSystemMessage,
      systemMessage,
    } = this.props;
    const { clientDB: { name = '', version = '' } = {} } = coreConfig || {};
    const { sync } = this.state;

    if (systemMessage?.msg) {
      showSystemMessage(systemMessage?.type, systemMessage.msg);
      onSetSystemMessage({ msg: '' });
    }

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

    if (prevTypeConfig === typeConfig && _.isEqual(appConfig, coreConfig)) {
      return;
    }

    if (
      typeof coreConfig === 'object' &&
      coreConfig &&
      !_.isEqual(coreConfig, prevCoreConfig) &&
      onLoadCoreConfig
    ) {
      onLoadCoreConfig({ ...coreConfig });
    }
  };

  componentWillUnmount = () => {
    if (this.loadingSettingsLoop) {
      clearInterval(this.loadingSettingsLoop);
    }
  };

  loadAppSession = async () => {
    const { router, coreConfig = {}, dispatch } = this.props;
    const { currentActionTab = '', activeTabs = [] } = router;
    const { appActive = true, menu = [], tabsLimit = 20 } = coreConfig;
    const { Request } = this.context;

    if (!appActive) {
      console.log('Application unactive');
      return;
    }

    const rest = new Request();

    try {
      const response = await rest.sendRequest(
        '/userload',
        'POST',
        {
          actionType: actionsTypes.$LOAD_SESSION_USER,
        },
        true,
      );

      if (response.status !== 200) {
        throw new Error('Bad user data');
      }

      let path = 'mainModule';
      const defaultModule = menu.find((item) => item?.SIGN === 'default');
      if (defaultModule) path = defaultModule?.EUID;

      const activeTabsCopy = [...activeTabs];
      const isFind = activeTabsCopy.findIndex((tab) => tab === path) !== -1;

      const { data = {} } = response;
      const { user = {} } = data;

      const udata = Object.keys(user).reduce((acc, key) => {
        return key !== 'token'
          ? {
              ...acc,
              [key]: data?.user[key],
            }
          : acc || {};
      }, {});

      if (!isFind && tabsLimit <= activeTabsCopy.length) {
        message.error(`Максимальное количество вкладок: ${tabsLimit}`);
        return;
      }

      const isUserData = udata && !_.isEmpty(udata);

      const canInitialSession = (currentActionTab !== path || !isFind) && isUserData;

      if (canInitialSession) {
        this.initialSession(udata, path, true);
      } else if (!isUserData) {
        return rest.signOut();
      }
    } catch (error) {
      const { response: { data = '' } = {}, message = '' } = error || {};
      dispatch(setSystemMessage({ msg: data || message || error, type: 'error' }));

      console.error(error);
      return rest.signOut();
    }

    return this.setState({ authLoad: true, loadState: true });
  };

  initialSession = async (udata = null, path = '') => {
    const { addTab, onLoadUdata, fetchConfig, i18n, dispatch } = this.props;

    try {
      if (!udata || !path) {
        dispatch(setSystemMessage({ msg: 'Error load dashboard.', type: 'error' }));
        return;
      }

      if (udata.lang) {
        i18n.changeLanguage(udata.lang);
      }

      await fetchConfig(udata?._id);
      await onLoadUdata(udata);
      await this.loadSettings();

      if (!localStorage.getItem('router')) {
        await addTab(routeParser({ path }));
      }
    } catch (error) {
      const { response: { data = '' } = {}, message = '' } = error || {};
      dispatch(setSystemMessage({ msg: data || message || error, type: 'error' }));
      console.log(error);
    }
  };

  loadSettings = async () => {
    const { onLoadSettings = null } = this.props;

    if (this.loadingSettingsLoop) {
      clearInterval(this.loadingSettingsLoop);
    }

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
    const { onLogoutAction, onSetStatus, coreConfig = {} } = this.props;
    const { supportIE = true, appActive = true, unactiveAppMsg = '' } = coreConfig;

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

    if (loadState && this.client) {
      return (
        <ClientDbContext.Provider value={this.client}>
          {!supportIE ? this.withoutIE(route) : route}
        </ClientDbContext.Provider>
      );
    }

    return <Loader title="Loading application state" />;
  }
}

const mapStateToProps = ({ router, publicReducer, systemReducer }) => {
  const { udata } = publicReducer;
  const { systemMessage } = systemReducer;

  return {
    router,
    udata,
    systemMessage,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addTab: async (tab) => await dispatch(createTab(tab)),
    onSetStatus: (status) => dispatch(setAppStatus({ statusRequst: status })),
    setCurrentTab: (tab) => dispatch(setActiveTab(tab)),
    onLogoutAction: async () => await dispatch(setLogout()),
    onLoadUdata: async (udata) => await dispatch(loadUserData(udata)),
    onLoadSettings: async (payload) => await dispatch(settingsLoadAction(payload)),
    onLoadCoreConfig: (payload) => dispatch(loadCoreConfig(payload)),
    onSetSystemMessage: (message) => dispatch(setSystemMessage(message)),
  };
};

export default compose(
  withSystemConfig,
  withTranslation(),
  connect(mapStateToProps, mapDispatchToProps),
)(App);
