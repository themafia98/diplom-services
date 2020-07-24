import React from 'react';
import { appType } from './types';
import _ from 'lodash';
import { connect } from 'react-redux';
import RenderInBrowser from 'react-render-in-browser';
import { Switch, Route } from 'react-router-dom';
import { message } from 'antd';
import { PrivateRoute } from './Components/Helpers';
import { forceUpdateDetectedInit } from './Utils';
import { settingsLoader } from './Redux/actions/publicActions/middleware';
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
import { withSystemConfig } from 'Models/context';
import ClientSideDatabase, { ClientDbContext } from 'Models/ClientSideDatabase';

const workerInstanse = worker();

class App extends React.Component {
  state = {
    loadState: false,
    isUser: false,
  };

  static contextType = ModelContext;
  static propTypes = appType;
  loadingSettingsLoop = null;
  client = null;

  componentDidMount = async () => {
    const {
      coreConfig: { appActive = true, forceUpdate = false, clientDB: { name = '', version = '' } } = {},
      coreConfig = {},
      onLoadCoreConfig,
    } = this.props;
    const { Request } = this.context;
    if (!appActive) return;

    if (onLoadCoreConfig && coreConfig && typeof coreConfig === 'object') {
      onLoadCoreConfig({ ...coreConfig });
    }

    this.client = new ClientSideDatabase(name, version);
    await this.client.init();

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
      .catch((err) => {
        this.loadApp();
      });
    if (forceUpdate === true || forceUpdate === 'true') forceUpdateDetectedInit();
  };

  loadAppSession = async () => {
    const {
      addTab,
      setCurrentTab,
      router: { currentActionTab = '', activeTabs = [] } = {},
      onLoadUdata,
      coreConfig = {},
    } = this.props;
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

      if (res?.status !== 200) {
        throw new Error('Bad user data');
      }

      let path = 'mainModule';
      const defaultModule = menu.find((item) => item?.SIGN === 'default');
      if (defaultModule) path = defaultModule?.EUID;

      const activeTabsCopy = [...activeTabs];
      const isFind = activeTabsCopy.findIndex((tab) => tab === path) !== -1;

      const { data: { user = {} } = {} } = res || {};

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

      if (!isFind) {
        if (isUserData) {
          try {
            await onLoadUdata(udata);
            this.loadSettings();
            addTab(routeParser({ path }));

            workerInstanse.runSync(localStorage.getItem('token'), this.client);
          } catch (error) {
            console.log(error);
          }
        } else rest.signOut();
      } else if (currentActionTab !== path) {
        if (isUserData) {
          try {
            await onLoadUdata(udata);
            this.loadSettings();

            workerInstanse.runSync(localStorage.getItem('token'), this.client);
            setCurrentTab(path);
          } catch (error) {
            console.log(error);
          }
        } else return rest.signOut();
      }
    } catch (error) {
      console.error(error);
      return rest.signOut();
    }

    return this.setState({ authLoad: true, loadState: true });
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

    if (loadState)
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
    onLoadSettings: async (payload) => await dispatch(settingsLoader(payload)),
    onLoadCoreConfig: (payload) => dispatch(loadCoreConfigAction(payload)),
  };
};

export default compose(withSystemConfig, connect(mapStateToProps, mapDispatchToProps))(App);
