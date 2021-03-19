import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { appType } from './App.types';
import _ from 'lodash';
import { batch, useDispatch, useSelector } from 'react-redux';
import RenderInBrowser from 'react-render-in-browser';
import { Switch, Route } from 'react-router-dom';
import { message } from 'antd';
import { PrivateRoute } from './Components/Helpers';
import { forceUpdateDetectedInit, isToken, showSystemMessage } from './Utils';
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
import ClientSideDatabase, { ClientDbContext } from 'Models/ClientSideDatabase';
import withSystemConfig from 'Components/Helpers/withSystemConfig';
import { setSystemMessage } from 'Redux/reducers/systemReducer.slice';
import { loadCoreConfig, loadUserData } from 'Redux/reducers/publicReducer.slice';
import { createTab } from 'Redux/reducers/routerReducer.slice';
import { useTranslation } from 'react-i18next';
const workerInstanse = worker();

const App = ({ coreConfig, fetchConfig, typeConfig }) => {
  const {
    appActive = true,
    menu = null,
    tabsLimit = 20,
    forceUpdate = false,
    clientDB = null,
    unactiveAppMsg,
    supportIE = true,
  } = coreConfig || {};

  const { i18n } = useTranslation();
  const dispatch = useDispatch();
  const context = useContext(ModelContext);

  const [appType, setAppType] = useState(typeConfig);
  const [authLoad, setAuth] = useState(false);
  const [loadState, setLoadApp] = useState(false);
  const [sync, setStartSync] = useState(false);

  const loadingSettingsLoop = useRef(null);
  const client = useRef(null);

  const { router, udata, systemMessage, appConfig } = useSelector(
    ({ router, publicReducer, systemReducer }) => {
      const { udata, appConfig } = publicReducer;
      const { systemMessage } = systemReducer;

      return {
        appConfig,
        router,
        udata,
        systemMessage,
      };
    },
  );

  const loadSettings = useCallback(async () => {
    dispatch(settingsLoadAction({ wishList: [{ name: 'statusList' }] }));

    loadingSettingsLoop.current = setInterval(async () => {
      dispatch(settingsLoadAction({ wishList: [{ name: 'statusList' }] }));
    }, 30000);

    return () => {
      if (loadingSettingsLoop.current) {
        clearInterval(loadingSettingsLoop.current);
      }
    };
  }, [dispatch]);

  const initialSession = useCallback(
    async (udata, path) => {
      try {
        if (!udata || !path) {
          dispatch(setSystemMessage({ msg: 'Error load dashboard.', type: 'error' }));
          return;
        }

        if (udata.lang) {
          i18n.changeLanguage(udata.lang);
        }

        batch(async () => {
          fetchConfig(udata?._id);
          dispatch(loadUserData(udata));
          await loadSettings();
        });

        if (!localStorage.getItem('router')) {
          dispatch(createTab(routeParser({ path })));
        }
      } catch (error) {
        const { response: { data = '' } = {}, message = '' } = error || {};
        dispatch(setSystemMessage({ msg: data || message || error, type: 'error' }));
        console.log(error);
      }
    },
    [dispatch, fetchConfig, i18n, loadSettings],
  );

  const loadAppSession = useCallback(async () => {
    const { currentActionTab = '', activeTabs = [] } = router;

    if (!appActive) {
      console.log('Application unactive');
      return;
    }

    const rest = new context.Request();

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
      const defaultModule = menu ? menu.find((item) => item?.SIGN === 'default') : null;
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

      if (!isFind && tabsLimit && tabsLimit <= activeTabsCopy.length) {
        message.error(`Максимальное количество вкладок: ${tabsLimit}`);
        return;
      }

      const isUserData = udata && !_.isEmpty(udata);

      const canInitialSession = (currentActionTab !== path || !isFind) && isUserData;

      if (canInitialSession) {
        initialSession(udata, path, true);
      } else if (!isUserData) {
        return rest.signOut();
      }
    } catch (error) {
      const { response: { data = '' } = {}, message = '' } = error || {};
      dispatch(setSystemMessage({ msg: data || message || error, type: 'error' }));

      console.error(error);
      return rest.signOut();
    }

    setAuth(true);
    setLoadApp(true);
  }, [appActive, context.Request, dispatch, initialSession, menu, router, tabsLimit]);

  const bootstrapApplication = useCallback(
    async (forceUpdate) => {
      const rest = new context.Request();

      try {
        const response = await rest.authCheck();

        if (response.status === 200) {
          loadAppSession();
        } else {
          throw new Error(response.message);
        }
      } catch (error) {
        console.error(error);
        setLoadApp(true);
      } finally {
        if (forceUpdate === true || forceUpdate === 'true') {
          forceUpdateDetectedInit();
        }
      }
    },
    [context.Request, loadAppSession],
  );

  const startClientDb = useCallback(async () => {
    if (!appActive) {
      return;
    }

    if (!client.current) {
      const { name = '', version = '' } = clientDB || {};
      client.current = name && version ? new ClientSideDatabase(name, version) : null;
    }

    if (client.current) {
      await client.current.init();
    }
  }, [appActive, clientDB]);

  useEffect(startClientDb, [startClientDb]);

  useEffect(() => {
    if (!appActive) {
      return;
    }

    if (appType === typeConfig && _.isEqual(appConfig, coreConfig)) {
      return;
    }

    if (coreConfig && typeof coreConfig === 'object') {
      dispatch(loadCoreConfig(coreConfig));
    }
  }, [appActive, appConfig, appType, coreConfig, dispatch, typeConfig]);

  useEffect(() => {
    if (!appActive) {
      return;
    }

    if (window.location.pathname === '/demoPage') {
      setLoadApp(true);
      return;
    }

    bootstrapApplication(forceUpdate);
  }, [appActive, bootstrapApplication, forceUpdate]);

  useEffect(() => {
    if (typeConfig !== appType) {
      setAppType(typeConfig);
    }
  }, [appType, typeConfig]);

  useEffect(() => {
    if (!appActive) {
      return;
    }

    if (systemMessage?.msg) {
      showSystemMessage(systemMessage?.type, systemMessage.msg);
      dispatch(setSystemMessage({ msg: '' }));
    }
  }, [systemMessage, dispatch, appActive]);

  useEffect(() => {
    if (!appActive) {
      return;
    }

    if (!sync && isToken() && udata && !_.isEmpty(udata) && client.current) {
      setStartSync(true);
      workerInstanse.runSync(localStorage.getItem('token'), client.current);
    }
  }, [appActive, udata, sync]);

  const publicActions = useMemo(
    () => ({
      initialSession,
    }),
    [initialSession],
  );

  if (!appActive) {
    return <div className="app-unactive">{unactiveAppMsg}</div>;
  }

  const route = (
    <Switch>
      <Route exact path="/recovory" render={(props) => <Recovery {...props} {...publicActions} />} />
      <PrivateRoute exact path="/dashboard" component={Dashboard} />
      <Route exact path="/demoPage" render={(props) => <Demo {...props} {...publicActions} />} />
      <Route
        exact
        path="*"
        render={(props) => <LoginPage {...props} {...publicActions} authLoad={authLoad} />}
      />
    </Switch>
  );

  if (loadState && client.current) {
    return (
      <ClientDbContext.Provider value={client.current}>
        {!supportIE ? (
          <>
            <RenderInBrowser ie only>
              <div className="ie-only">
                <p>Приложение не поддерживает браузер IE, предлагаем установить другой браузер.</p>
              </div>
            </RenderInBrowser>
            <RenderInBrowser except ie>
              {route}
            </RenderInBrowser>
          </>
        ) : (
          route
        )}
      </ClientDbContext.Provider>
    );
  }

  return <Loader title="Loading application state" />;
};

App.propTypes = appType;

export default withSystemConfig(App);
