import React, { PureComponent, createRef } from 'react';
import { dashboardType } from './types';
import { Redirect } from 'react-router-dom';
import { EventEmitter } from 'events';
import io from 'socket.io-client';
import { Layout, message, notification, Modal, Button } from 'antd';
import { connect } from 'react-redux';
import {
  addTabAction,
  setActiveTabAction,
  removeTabAction,
  logoutAction,
  loadSaveRouter,
} from 'Redux/actions/routerActions';

import { clearCache, showGuile } from 'Redux/actions/publicActions';
import { routeParser } from 'Utils';

import FixedToolbar from 'Components/FixedToolbar';
import Loader from 'Components/Loader';
import HeaderView from 'Components/HeaderView';
import ContentView from 'Components/ContentView';
import MenuView from 'Components/MenuView';
import ModelContext from 'Models/context';
import regExpRegister from 'Utils/Tools/regexpStorage';

let deferredPrompt = null;

class Dashboard extends PureComponent {
  dashboardStrem = new EventEmitter();
  state = {
    collapsed: true,
    guideVisible: true,
    visibleInstallApp: false,
    isToolbarActive: false,
    redirect: false,
    status: 'online',
    menuItems: this.props?.appConfig?.menu,
    counterError: 0,
    showLoader: false,
  };

  static contextType = ModelContext;
  static propTypes = dashboardType;

  dashboardRef = createRef();
  webSocket = null;

  componentDidMount = () => {
    const { onLoadSaveRouter } = this.props;

    this.webSocket = io('/', {
      path: '/socket.io',
      transports: ['websocket'],
      secure: window.location.protocol === 'https',
    });

    setInterval(this.autoSaveRoute, 10000);

    const saveRoute = localStorage.getItem('router');
    if (saveRoute) {
      const parsedRoute = JSON.parse(saveRoute);

      const isValid =
        typeof parsedRoute === 'object' &&
        parsedRoute &&
        Object.keys(parsedRoute).every((key) => {
          return [
            'path',
            'currentActionTab',
            'activeTabs',
            'routeDataActive',
            'routeData',
            'load',
            'partDataPath',
            'shouldUpdate',
          ].some((routeKey) => routeKey === key);
        });

      if (isValid) onLoadSaveRouter(parsedRoute);
    }

    if (!deferredPrompt) return;

    this.setState({
      ...this.state,
      visibleInstallApp: true,
    });
  };

  componentWillUnmount = () => {
    if (this.webSocket) this.webSocket.disconnect();
    clearInterval(this.autoSaveRoute);
  };

  componentDidUpdate = () => {
    const {
      publicReducer: { requestError = null, status = '' },
      router: { currentActionTab = '', routeData = {} },
    } = this.props;

    const { showLoader, status: statusState, counterError } = this.state;

    if (!showLoader && statusState !== status && status === 'online')
      notification.success({
        message: 'Удачно',
        description: 'Интернет соединение восстановлено.',
      });

    if (showLoader && requestError === null && status === 'online') {
      const [moduleName, entityKey] = currentActionTab.split(regExpRegister.MODULE_AND_ENTITYID);
      const existsModuleData = Object.keys(routeData).find((mdn) =>
        entityKey ? mdn.includes(entityKey) : mdn.includes(moduleName),
      );

      if (
        (existsModuleData && Object.keys(routeData).every((key) => routeData[key].load === true)) ||
        requestError === 'Network error'
      ) {
        setTimeout(() => {
          this.setState({
            ...this.state,
            status: status,
            showLoader: false,
          });
        }, 500);
        return;
      } else if (requestError === null && status === 'online') {
        setTimeout(() => {
          this.setState({
            counter: 0,
            status: status,
            showLoader: false,
          });
        }, 500);
        return;
      }
    } else if (showLoader && status === 'offline') {
      setTimeout(() => {
        this.setState({
          status: status,
          showLoader: false,
        });
        return;
      }, 500);
    }

    if (
      requestError !== null &&
      requestError[requestError?.length - 1] === 'Network error' &&
      status === 'offline' &&
      counterError === 0
    ) {
      this.setState({ counterError: counterError + 1 }, () =>
        notification.error({ message: 'Ошибка', description: 'Интернет соединение недоступно.' }),
      );
    }

    if (statusState !== status) {
      return this.setState({
        status,
      });
    }
  };

  autoSaveRoute = () => {
    const { router = {} } = this.props;

    const currentRouter = JSON.stringify(router);
    const saveRouter = localStorage.getItem('router');

    if (currentRouter !== saveRouter) localStorage.setItem('router', currentRouter);
  };

  onCollapse = (collapsed) => {
    this.setState({ ...this.state, collapsed });
  };

  logout = async (event) => {
    const { rest } = this.props;
    if (rest) {
      await rest.signOut();
    }
  };

  closeGuild = (event) => {
    this.setState({
      guideVisible: false,
    });
  };

  updateLoader = (event) => {
    const {
      router,
      router: { currentActionTab, shouldUpdate },
    } = this.props;
    const { routeData = {} } = router;
    const copyRouteData = { ...routeData };
    let currentArray = currentActionTab.split(regExpRegister.MODULE_KEY);
    let regExp = new RegExp(currentArray[0], 'gi');
    let keys = Object.keys(copyRouteData).filter(
      (key) => regExpRegister.INCLUDE_MODULE.test(key) && regExp.test(key),
    );

    if (keys.length && !shouldUpdate) this.setState({ showLoader: true });
  };

  getTabName = (metadata = {}, DATAKEY = '') => {
    /** @type {Record<string, object | string>} */
    const { listdata = {}, title = '', name = '', displayName = '' } = metadata || {};
    const { title: titleListdata = '' } = listdata || {};
    const isName = DATAKEY && name;

    return isName
      ? name
      : title
      ? title
      : titleListdata
      ? titleListdata
      : displayName
      ? displayName
      : DATAKEY;
  };

  getactiveTabs = (tabs = [], menu) => {
    const { router: { routeData = {} } = {} } = this.props;
    const tabsCopy = [...tabs];
    const tabsArray = [];
    for (let i = 0; i < tabsCopy.length; i++) {
      let tabItem = Array.isArray(menu) ? menu.find((tab) => tab.EUID === tabsCopy[i]) : null;
      if (!tabItem) {
        const PAGEDATA = routeParser({ pageType: 'page', path: tabsCopy[i] });
        const PARENT_CODE = PAGEDATA['page'];
        const DATAKEY = PAGEDATA['pageChild'] || PAGEDATA['page'] || '';
        const VALUE = this.getTabName(routeData[DATAKEY], DATAKEY);
        tabItem = { EUID: PAGEDATA['path'] || tabsCopy[i], PARENT_CODE, DATAKEY, VALUE };
      }
      if (tabItem) tabsArray.push({ ...tabItem });
    }
    return tabsArray;
  };

  goHome = (event) => {
    const {
      addTab,
      setCurrentTab,
      router: { currentActionTab = '', activeTabs = [] } = {},
      appConfig = {},
    } = this.props;
    const { tabsLimit = 50 } = appConfig;

    if (currentActionTab === 'mainModule') return;

    if (tabsLimit <= activeTabs.length) return message.error(`Максимальное количество вкладок: ${tabsLimit}`);

    let tabItem = activeTabs.find((tab) => tab === 'mainModule');
    if (!tabItem) addTab('mainModule');
    else setCurrentTab('mainModule');
  };

  goCabinet = (event) => {
    const {
      addTab,
      setCurrentTab,
      router: { currentActionTab = '', activeTabs = [] } = {},
      appConfig = {},
    } = this.props;
    const { tabsLimit = 50 } = appConfig;
    if (currentActionTab === 'cabinetModule') return;

    if (tabsLimit <= activeTabs.length) return message.error(`Максимальное количество вкладок: ${tabsLimit}`);

    let tabItem = activeTabs.find((tab) => tab === 'cabinetModule');
    if (!tabItem) addTab('cabinetModule');
    else setCurrentTab('cabinetModule');
  };

  menuHandler = (event, key, mode = 'open') => {
    const path = event['key'] ? event['key'] : key;
    const {
      router: { currentActionTab, activeTabs = [], routeData } = {},
      addTab,
      setCurrentTab,
      removeTab,
      onClearCache,
      appConfig = {},
    } = this.props;

    const { tabsLimit = 50 } = appConfig;

    const activeTabsCopy = [...activeTabs];
    const isFind = activeTabsCopy.findIndex((tab) => tab === path) !== -1;

    if (mode === 'open') {
      if (!isFind && tabsLimit <= activeTabsCopy.length)
        return message.error(`Максимальное количество вкладок: ${tabsLimit}`);

      if (!isFind) addTab(routeParser({ path }));
      else if (currentActionTab !== path) {
        const { config = null } = routeData[path] || {};
        setCurrentTab({ tab: path, config });
      }
    } else if (mode === 'close') {
      const entityId = path.split(regExpRegister.MODULE_ID)[1];
      let type = 'deafult';
      if (entityId) type = 'itemTab';

      if (!isFind) return;

      removeTab({ path: path, type: type });
      onClearCache({ path, type: type, currentActionTab });
    }
  };

  onShowLoader = () => {
    this.setState({
      showLoader: true,
    });
  };

  onHideLoader = () => {
    this.setState({
      showLoader: false,
    });
  };

  installApp = (event) => {
    const { onShowGuide = null } = this.props;
    Notification.requestPermission().then(function (result) {});

    if (!deferredPrompt) {
      return notification.error({
        message: 'Ошибка',
        description: 'Невозможно скачать приложение, возможно ваш браузер устарел.',
      });
    }
    deferredPrompt.prompt();

    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === 'accepted') {
        console.log('PWA setup accepted');
        // hide our user interface that shows our A2HS button
      } else {
        console.log('PWA setup rejected');
      }
      if (onShowGuide) onShowGuide(false);
      deferredPrompt = null;
    });
  };

  onChangeVisibleAction = (event, shouldChange = false, forceChangeState = true) => {
    const { isToolbarActive = false } = this.state;
    const isShoudChange = !event && shouldChange;

    if (!forceChangeState && isToolbarActive === shouldChange) {
      return;
    }

    if (!forceChangeState && isToolbarActive !== shouldChange) {
      this.setState({
        ...this.state,
        isToolbarActive: shouldChange,
      });
      return;
    }

    if (isShoudChange) {
      isToolbarActive !== !shouldChange &&
        this.setState({
          ...this.state,
          isToolbarActive: !shouldChange,
        });
      return;
    }

    this.setState((state) => {
      return {
        ...state,
        isToolbarActive: !state.isToolbarActive,
      };
    });
  };

  render() {
    const {
      menuItems = null,
      showLoader,
      redirect,
      guideVisible,
      visibleInstallApp = false,
      isToolbarActive = false,
    } = this.state;
    const {
      router: { activeTabs = [], currentActionTab, shouldUpdate = false } = {},
      router = {},
      rest,
      publicReducer = {},
      firstConnect = false,
      udata = {},
      appConfig: config = {},
    } = this.props;

    if (redirect) return <Redirect to={{ pathname: '/' }} />;

    const activeTabsData = this.getactiveTabs(activeTabs, menuItems);

    return (
      <div ref={this.dashboardRef} className="dashboard">
        {showLoader ? <Loader className="mainLoader" /> : null}
        <Layout className="layout_menu">
          <MenuView
            key="menu"
            items={menuItems}
            activeTabEUID={currentActionTab}
            cbMenuHandler={this.menuHandler}
            collapsed={this.state.collapsed}
            cbOnCollapse={this.onCollapse}
            cbGoMain={this.goHome}
          />
          <Layout key="main">
            <HeaderView
              key="header"
              dashboardStrem={this.dashboardStrem}
              cbMenuTabHandler={this.menuHandler}
              activeTabEUID={currentActionTab}
              tabs={activeTabsData ? activeTabsData : false}
              logout={this.logout}
              goCabinet={this.goCabinet}
            />
            <ContentView
              dashboardStrem={this.dashboardStrem}
              appConfig={config}
              activeTabs={activeTabs}
              udata={udata}
              isToolbarActive={isToolbarActive}
              webSocket={this.webSocket}
              shouldUpdate={shouldUpdate}
              onShowLoader={this.onShowLoader}
              onHideLoader={this.onHideLoader}
              router={router}
              onChangeVisibleAction={this.onChangeVisibleAction}
              statusApp={publicReducer.status}
              updateLoader={this.updateLoader}
              key="contentView"
              rest={rest}
              path={currentActionTab}
            />
            {visibleInstallApp ? (
              <Modal
                className="guideModal"
                okText="Закрыть"
                title="Добро пожаловать в систему."
                visible={guideVisible && firstConnect}
                onCancel={this.closeGuild}
                onOk={this.closeGuild}
              >
                <p>Спасибо что выбрали {config.title ? `${config.title}` : 'нашу систему!'}</p>

                <>
                  <p>Вы можете установить приложение на ваш компьютер</p>

                  <Button onClick={this.installApp} className="setupButton">
                    Установить приложение
                  </Button>
                </>
              </Modal>
            ) : null}
          </Layout>
        </Layout>
        <FixedToolbar key="toolbar-chat" onChangeVisibleAction={this.onChangeVisibleAction} name="Чат" />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { router, publicReducer } = state;
  const { firstConnect = false, udata = {}, appConfig } = publicReducer;
  return {
    router,
    publicReducer,
    firstConnect,
    udata,
    appConfig,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onShowGuide: (show) => dispatch(showGuile(show)),
    removeTab: (tab) => dispatch(removeTabAction(tab)),
    addTab: (tab) => dispatch(addTabAction(tab)),
    onClearCache: (props) => dispatch(clearCache(props)),
    setCurrentTab: (tab) => dispatch(setActiveTabAction(tab)),
    onLogoutAction: async () => await dispatch(logoutAction()),
    onLoadSaveRouter: (payload) => dispatch(loadSaveRouter(payload)),
  };
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

export default connect(mapStateToProps, mapDispatchToProps)(Dashboard);
export { Dashboard };
