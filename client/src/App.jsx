// @ts-nocheck
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
import LandingPage from './Pages/LandingPage';
import Recovery from './Pages/Recovery';
import LoginPage from './Pages/LoginPage';
import Dashboard from './Pages/Dashboard';
import 'moment/locale/ru';
import modelContext from './Models/context';
// import { isMobile } from "react-device-detect";

class App extends React.Component {
  state = {
    loadState: false,
    isUser: false,
  };

  static contextType = modelContext;
  static propTypes = appType;

  loadAppSession = async () => {
    const {
      addTab,
      setCurrentTab,
      router: { currentActionTab = '', actionTabs = [] } = {},
      onLoadUdata,
      onLoadSettings,
    } = this.props;
    const { config = {}, Request, config: { appActive = true } = {} } = this.context;
    if (!appActive) return;
    const rest = new Request();

    try {
      const res = await rest.sendRequest('/userload', 'POST', null, true);

      if (res.status !== 200) {
        throw new Error('Bad user data');
      }

      let path = 'mainModule';
      const defaultModule = config.menu.find((item) => item['SIGN'] === 'default');
      if (defaultModule) path = defaultModule.EUID;

      const actionTabsCopy = [...actionTabs];
      const isFind = actionTabsCopy.findIndex((tab) => tab === path) !== -1;

      const { data: { user = {} } = {} } = res || {};

      const udata = Object.keys(user).reduce((accumulator, key) => {
        if (key !== 'token') {
          accumulator[key] = res.data['user'][key];
        }

        return accumulator || {};
      }, {});

      if (!isFind && config.tabsLimit <= actionTabsCopy.length)
        return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);
      const isUserData = udata && !_.isEmpty(udata);

      if (!isFind) {
        if (isUserData) {
          try {
            await onLoadUdata(udata);
            await onLoadSettings({ wishList: [{ name: 'statusList' }] });
            addTab(routeParser({ path }));
          } catch (error) {
            console.log(error);
          }
        } else rest.signOut();
      } else if (currentActionTab !== path) {
        if (isUserData) {
          try {
            await onLoadUdata(udata);
            await onLoadSettings({ wishList: [{ name: 'statusList' }] });
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

  loadApp = () => {
    return this.setState({ loadState: true });
  };

  componentDidMount = () => {
    const { config = {}, Request, config: { appActive = true } = {} } = this.context;

    if (!appActive) return;

    if (window.location.pathname === '/') {
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
        <Route exact path="/admin/recovory" render={(props) => <Recovery {...props} />} />
        <PrivateRoute exact path="/admin/dashboard" {...privateActions} component={Dashboard} />
        <Route exact path="/admin" render={(props) => <LoginPage {...props} authLoad={authLoad} />} />
        <Route exact path="/" render={(props) => <LandingPage {...props} />} />
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
