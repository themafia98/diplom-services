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
import { setStatus, loadUdata } from './Redux/actions/publicActions';
import { addTabAction, setActiveTabAction, logoutAction } from './Redux/actions/routerActions';

import { routeParser } from './Utils';

import Loader from './Components/Loader';
import Recovery from './Pages/Recovery';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import 'moment/locale/ru';
import modelContext from './Models/context';
import Demo from './Pages/Demo';
import worker from 'workerize-loader!worker'; // eslint-disable-line import/no-webpack-loader-syntax
import actionsTypes from 'actions.types';
const workerInstanse = worker();

class App extends React.Component {
  state = {
    loadState: false,
    isUser: false,
  };

  static contextType = modelContext;
  static propTypes = appType;
  loadingSettingsLoop = null;

  loadAppSession = async () => {
    const {
      addTab,
      setCurrentTab,
      router: { currentActionTab = '', activeTabs = [] } = {},
      onLoadUdata,
    } = this.props;
    const { config = {}, Request, config: { appActive = true } = {} } = this.context;
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

      if (res.status !== 200) {
        throw new Error('Bad user data');
      }

      let path = 'mainModule';
      const defaultModule = config.menu.find((item) => item?.SIGN === 'default');
      if (defaultModule) path = defaultModule?.EUID;

      const activeTabsCopy = [...activeTabs];
      const isFind = activeTabsCopy.findIndex((tab) => tab === path) !== -1;

      const { data: { user = {} } = {} } = res || {};

      const udata = Object.keys(user).reduce((accumulator, key) => {
        return key !== 'token'
          ? {
              ...accumulator,
              [key]: res.data?.user[key],
            }
          : accumulator || {};
      }, {});

      if (!isFind && config.tabsLimit <= activeTabsCopy.length)
        return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
      const isUserData = udata && !_.isEmpty(udata);

      if (!isFind) {
        if (isUserData) {
          try {
            await onLoadUdata(udata);
            this.loadSettings();
            addTab(routeParser({ path }));

            workerInstanse.runSync(localStorage.getItem('token'));
          } catch (error) {
            console.log(error);
          }
        } else rest.signOut();
      } else if (currentActionTab !== path) {
        if (isUserData) {
          try {
            await onLoadUdata(udata);
            this.loadSettings();
            workerInstanse.runSync(localStorage.getItem('token'));
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

  componentDidMount = () => {
    const { config = {}, Request, config: { appActive = true } = {} } = this.context;
    if (!appActive) return;
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
    if (config.forceUpdate === true || config.forceUpdate === 'true') forceUpdateDetectedInit();
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

  render() {
    const { loadState, authLoad } = this.state;
    const { config: { supportIE = true, appActive = true, unactiveAppMsg = '' } = {} } = this.context;
    const { onLogoutAction, onSetStatus } = this.props;

    if (!appActive) {
      return <div className="app-unactive">{unactiveAppMsg}</div>;
    }

    const privateActions = {
      onSetStatus,
      onLogoutAction,
    };

    const route = (
      <Switch>
        <Route exact path="/recovory" render={(props) => <Recovery {...props} />} />
        <PrivateRoute exact path="/dashboard" {...privateActions} component={Dashboard} />
        <Route exact path="/demoPage" render={(props) => <Demo {...props} />} />
        <Route exact path="*" render={(props) => <LoginPage {...props} authLoad={authLoad} />} />
      </Switch>
    );

    if (loadState) return !supportIE ? this.withoutIE(route) : route;
    else return <Loader />;
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
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(App);
