import React, { useRef, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { dashboardType } from './Dashboard.types';
import { Redirect } from 'react-router-dom';
import { EventEmitter } from 'events';
import io from 'socket.io-client';
import { Layout, message, Modal, Button } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import {
  addTabAction,
  setActiveTabAction,
  removeTabAction,
  loadSaveRouter,
} from 'Redux/actions/routerActions';

import { clearCache, showGuile } from 'Redux/actions/publicActions';
import { getAvailableTabNameKey, routeParser, saveAndNormalizeRoute, showSystemMessage } from 'Utils';

import FixedToolbar from 'Components/FixedToolbar';
import Loader from 'Components/Loader';
import HeaderView from 'Components/HeaderView';
import ContentView from 'Components/ContentView';
import MenuView from 'Components/MenuView';
import ModelContext from 'Models/context';
import regExpRegister from 'Utils/Tools/regexpStorage';
import { APP_STATUS } from 'App.constant';
import ws from 'config/ws.config';
import autoSaveConfig from 'config/autoSave.config';

let deferredPrompt = null;

const Dashboard = () => {
  const { rest } = useContext(ModelContext);
  const dispatch = useDispatch();

  const [collapsed, setCollapsed] = useState(true);
  const [guideVisible, setGuildVisible] = useState(true);
  const [visibleInstallApp, setVisibleInstallApp] = useState(false);
  const [isToolbarActive, setToolbarActive] = useState(false);
  const [redirect] = useState(false);
  const [status, setAppStatus] = useState(APP_STATUS.ON);
  const [counterError, setCounterError] = useState(0);
  const [showLoader, setShowLoader] = useState(false);

  const dashboardStream = useRef(new EventEmitter());

  const dashboardRef = useRef(null);
  const webSocket = useRef(null);

  const {
    router,
    firstConnect,
    udata,
    appConfig,
    requestError,
    status: statusProps,
    loader,
    router: { currentActionTab, shouldUpdate, routeData, activeTabs },
  } = useSelector(({ router, publicReducer, systemReducer }) => {
    const { firstConnect = false, udata, appConfig, requestError, status } = publicReducer;
    const { loader } = systemReducer;
    return {
      router,
      firstConnect,
      udata,
      appConfig,
      requestError,
      status,
      loader,
    };
  });

  const autoSaveRoute = useCallback(() => {
    const currentRouter = JSON.stringify(router);
    const saveRouter = localStorage.getItem('router');

    if (currentRouter !== saveRouter) {
      saveAndNormalizeRoute(router, appConfig);
    }
  }, [appConfig, router]);

  const onChangeLoaderVisibility = useCallback(
    (loader) => {
      if (loader === showLoader) return;

      setShowLoader(loader);
    },
    [showLoader],
  );

  useEffect(() => {
    if (!webSocket.current) {
      webSocket.current = io(ws.startUrl, ws.socketIO);
    }

    return () => {
      if (webSocket.current) {
        webSocket.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (appConfig && appConfig.autoSave) {
      setInterval(autoSaveRoute, autoSaveConfig.interval);
    }

    const saveRoute = localStorage.getItem('router');

    if (saveRoute) {
      const parsedRoute = JSON.parse(saveRoute);
      const keysRoute = Object.keys(parsedRoute);

      const isValid =
        typeof parsedRoute === 'object' &&
        parsedRoute &&
        keysRoute.every((key) => autoSaveConfig.validKeysRouteForSave.some((routeKey) => routeKey === key)) &&
        autoSaveConfig.validKeysRouteForSave?.length === keysRoute?.length;

      if (isValid) {
        showSystemMessage('loading', 'Session loading...');
        dispatch(loadSaveRouter(parsedRoute));
      } else {
        showSystemMessage('warn', 'Detect invalid session');
        dispatch(addTabAction(routeParser({ path: 'mainModule' })));
      }
    }

    return () => {
      if (autoSaveRoute) {
        clearInterval(autoSaveRoute);
      }
    };
  }, [appConfig, autoSaveRoute, dispatch]);

  useEffect(() => {
    if (!deferredPrompt) return;

    if (!visibleInstallApp) {
      setVisibleInstallApp(true);
    }
  }, [visibleInstallApp]);

  useEffect(() => {
    if (loader !== showLoader) {
      onChangeLoaderVisibility(loader);
    }

    if (!showLoader && status !== statusProps && statusProps === APP_STATUS.ON) {
      showSystemMessage('success', 'Интернет соединение восстановлено.');
    }

    if (showLoader && requestError === null && status === APP_STATUS.ON) {
      const [moduleName, entityKey] = currentActionTab.split(regExpRegister.MODULE_AND_ENTITYID);

      const existsModuleData = Object.keys(routeData).find((mdn) =>
        entityKey ? mdn.includes(entityKey) : mdn.includes(moduleName),
      );

      if (
        (existsModuleData && Object.keys(routeData).every((key) => routeData[key].load === true)) ||
        requestError === 'Network error'
      ) {
        setTimeout(() => {
          setAppStatus(statusProps);

          if (showLoader) {
            setShowLoader(false);
          }
        }, 500);
        return;
      } else if (requestError === null && status === APP_STATUS.ON) {
        setTimeout(() => {
          if (counterError !== 0) {
            setCounterError(0);
          }

          if (status !== statusProps) {
            setAppStatus(statusProps);
          }

          setShowLoader(false);
        }, 500);
        return;
      }
    } else if (showLoader && statusProps === APP_STATUS.OFF) {
      setTimeout(() => {
        if (status !== statusProps) {
          setAppStatus(statusProps);
        }

        if (showLoader) {
          setShowLoader(false);
        }
        return;
      }, 500);
    }

    if (
      requestError !== null &&
      requestError[requestError?.length - 1] === 'Network error' &&
      statusProps === APP_STATUS.OFF &&
      counterError === 0
    ) {
      setCounterError(counterError + 1);
      showSystemMessage('error', 'Интернет соединение недоступно.');
    }

    if (status !== statusProps) {
      setAppStatus(statusProps);
    }
  }, [
    counterError,
    currentActionTab,
    loader,
    onChangeLoaderVisibility,
    requestError,
    routeData,
    showLoader,
    status,
    statusProps,
  ]);

  const onCollapse = (collapsed) => setCollapsed(collapsed);

  const logout = () => {
    if (rest) {
      rest.signOut();
    }
  };

  const closeGuild = () => setGuildVisible(false);

  const updateLoader = useCallback(() => {
    const copyRouteData = { ...routeData };

    let currentArray = currentActionTab.split(regExpRegister.MODULE_KEY);
    let regExp = new RegExp(currentArray[0], 'gi');

    let keys = Object.keys(copyRouteData).filter(
      (key) => regExpRegister.INCLUDE_MODULE.test(key) && regExp.test(key),
    );

    if (keys.length && !shouldUpdate) {
      showLoader(true);
    }
  }, [currentActionTab, routeData, shouldUpdate, showLoader]);

  const activeTabsData = useMemo(() => {
    const { menuItems } = appConfig;
    const activeTabsData = [];

    if (!menuItems || !activeTabs) {
      return null;
    }

    for (const tab of activeTabs) {
      const tabItem = menuItems.find((menuItem) => menuItem.EUID === tab);

      if (tabItem) {
        activeTabsData.push({ ...tabItem });
        continue;
      }

      const { page, path, pageChild } = routeParser({ pageType: 'page', path: tab });
      const DATAKEY = pageChild || page || '';
      const VALUE = getAvailableTabNameKey(DATAKEY, routeData[DATAKEY]);
      activeTabsData.push({
        EUID: path || tab,
        PARENT_CODE: page,
        DATAKEY,
        VALUE,
      });
    }

    return activeTabsData;
  }, [activeTabs, appConfig, routeData]);

  const goHome = useCallback(() => {
    const { tabsLimit = 50 } = appConfig;

    if (currentActionTab === 'mainModule') {
      return;
    }

    if (tabsLimit <= activeTabs.length) {
      message.error(`Максимальное количество вкладок: ${tabsLimit}`);
      return;
    }

    if (!activeTabs.some((tab) => tab === 'mainModule')) {
      dispatch(addTabAction('mainModule'));
      return;
    }
    dispatch(setActiveTabAction('mainModule'));
  }, [activeTabs, appConfig, currentActionTab, dispatch]);

  const goCabinet = useCallback(() => {
    const { tabsLimit = 50 } = appConfig;

    if (currentActionTab === 'cabinetModule') {
      return;
    }

    if (tabsLimit <= activeTabs.length) {
      message.error(`Максимальное количество вкладок: ${tabsLimit}`);
      return;
    }

    if (!activeTabs.some((tab) => tab === 'cabinetModule')) {
      dispatch(addTabAction('cabinetModule'));
      return;
    }

    dispatch(setActiveTabAction('cabinetModule'));
  }, [activeTabs, appConfig, currentActionTab, dispatch]);

  const menuHandler = useCallback(
    (event, key, mode = 'open') => {
      const path = event['key'] ? event['key'] : key;
      const { tabsLimit = 50 } = appConfig;

      const activeTabsCopy = [...activeTabs];
      const isFind = activeTabsCopy.findIndex((tab) => tab === path) !== -1;

      if (mode === 'open') {
        if (!isFind && tabsLimit <= activeTabsCopy.length) {
          message.error(`Максимальное количество вкладок: ${tabsLimit}`);
          return;
        }

        if (!isFind) {
          dispatch(addTabAction(routeParser({ path })));
        } else if (currentActionTab !== path) {
          const { config = null } = routeData[path] || {};
          dispatch(setActiveTabAction({ tab: path, config }));
        }
      } else if (mode === 'close') {
        const [, entityId] = path.split(regExpRegister.MODULE_ID);

        let type = entityId ? 'itemTab' : 'deafult';

        if (entityId && !isFind) {
          return;
        }

        if (entityId) {
          dispatch(removeTabAction({ path: path, type: type }));
          dispatch(clearCache({ path, type: type, currentActionTab }));
        }
      }
    },
    [activeTabs, appConfig, currentActionTab, dispatch, routeData],
  );

  const installApp = () => {
    Notification.requestPermission();

    if (!deferredPrompt) {
      showSystemMessage('error', 'Невозможно скачать приложение, возможно ваш браузер устарел.');
      return;
    }

    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA setup accepted');
        // hide our user interface that shows our A2HS button
      } else {
        console.log('PWA setup rejected');
      }
      dispatch(showGuile(false));
      deferredPrompt = null;
    });
  };

  const onChangeVisibleAction = useCallback(
    (event, shouldChange = false, forceChangeState = true) => {
      const isShoudChange = !event && shouldChange;

      if (!forceChangeState && isToolbarActive === shouldChange) {
        return;
      }

      if (!forceChangeState && isToolbarActive !== shouldChange) {
        setToolbarActive(shouldChange);
        return;
      }

      if (isShoudChange && isToolbarActive !== !shouldChange) {
        setToolbarActive(shouldChange);
      }

      if (isShoudChange) {
        return;
      }

      setToolbarActive(!isToolbarActive);
    },
    [isToolbarActive],
  );

  if (redirect) {
    return <Redirect to={{ pathname: '/' }} />;
  }

  return (
    <div ref={dashboardRef} className="dashboard">
      {showLoader ? <Loader className="mainLoader" /> : null}
      <Layout className="layout_menu">
        <MenuView
          key="menu"
          items={appConfig?.menu}
          activeTabEUID={currentActionTab}
          cbMenuHandler={menuHandler}
          collapsed={collapsed}
          cbOnCollapse={onCollapse}
          cbGoMain={goHome}
        />
        <Layout key="main">
          <HeaderView
            key="header"
            dashboardStream={dashboardStream.current}
            cbMenuTabHandler={menuHandler}
            activeTabEUID={currentActionTab}
            tabs={activeTabsData}
            logout={logout}
            webSocket={webSocket}
            goCabinet={goCabinet}
          />
          <ContentView
            dashboardStream={dashboardStream.current}
            appConfig={appConfig}
            activeTabs={activeTabs}
            udata={udata}
            isToolbarActive={isToolbarActive}
            webSocket={webSocket.current}
            shouldUpdate={shouldUpdate}
            router={router}
            onChangeVisibleAction={onChangeVisibleAction}
            statusApp={statusProps}
            updateLoader={updateLoader}
            key="contentView"
            rest={rest}
            path={currentActionTab}
            shouldShowSpinner={!activeTabsData.length}
          />
          {visibleInstallApp ? (
            <Modal
              className="guideModal"
              okText="Закрыть"
              title="Добро пожаловать в систему."
              visible={guideVisible && firstConnect}
              onCancel={closeGuild}
              onOk={closeGuild}
            >
              <p>Спасибо что выбрали {appConfig.title ? `${appConfig.title}` : 'нашу систему!'}</p>

              <>
                <p>Вы можете установить приложение на ваш компьютер</p>

                <Button onClick={installApp} className="setupButton">
                  Установить приложение
                </Button>
              </>
            </Modal>
          ) : null}
        </Layout>
      </Layout>
      <FixedToolbar key="toolbar-chat" onChangeVisibleAction={onChangeVisibleAction} name="Чат" />
    </div>
  );
};

window.addEventListener('beforeinstallprompt', (e) => {
  // Prevent Chrome 67 and earlier from automatically showing the prompt
  e.preventDefault();
  // Stash the event so it can be triggered later.
  deferredPrompt = e;
  console.log('install');
});

window.addEventListener('appinstalled', (evt) => {
  console.log('appinstalled fired', evt);
});

Dashboard.propTypes = dashboardType;

export default Dashboard;
export { Dashboard };
