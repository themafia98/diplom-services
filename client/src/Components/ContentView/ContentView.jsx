import React, { Component } from 'react';
import { getComponentByKey, parseModuleKey, getModuleTypeByParsedKey } from 'Utils';
import { contentViewType } from './ContentView.types';
import _ from 'lodash';
import { Layout } from 'antd';

import ActionPortal from 'Components/ActionPortal';
import Chat from 'Modules/ContactModule/Chat';
import TabContainer from 'Components/TabContainer';
import { v4 as uuid } from 'uuid';
import types from 'types.modules';

const { Content } = Layout;

class ContentView extends Component {
  state = {
    visibilityPortal: false,
    key: null,
  };

  static propTypes = contentViewType;
  static defaultProps = {
    dashboardStrem: null,
    shouldRenderMenu: true,
    path: '',
    activeTabs: [],
    router: {},
    statusApp: 'online',
    rest: null,
    webSocket: null,
    onChangeVisibleAction: null,
    isToolbarActive: false,
    visibilityPortal: false,
  };

  static getDerivedStateFromProps = (props, state) => {
    const { isToolbarActive } = props;
    const { visibilityPortal } = state;

    if (isToolbarActive !== visibilityPortal) {
      return {
        ...state,
        visibilityPortal: isToolbarActive,
      };
    }
    return state;
  };

  componentDidMount = () => {
    const { dashboardStrem, shouldRenderMenu } = this.props;
    const { key = null } = this.state;
    document.addEventListener('keydown', this.disableF5);
    dashboardStrem.on('EventUpdate', this.updateFunction);
    if (key !== null && !shouldRenderMenu) return;

    this.setState({ key: uuid() });
  };

  shouldComponentUpdate = (
    { path: nextPath, appConfig: prevAppConfig, activeTabs: prevActiveTabs = [] },
    { key: nextKey, visibilityPortal: nextVisibilityPortal },
  ) => {
    const { menu: prevMenu = [] } = prevAppConfig || {};
    const { path: currentPath, appConfig, activeTabs } = this.props;
    const { menu = [] } = appConfig || {};
    const { key: currentKey, visibilityPortal } = this.state;
    if (
      nextPath !== currentPath ||
      nextKey !== currentKey ||
      nextVisibilityPortal !== visibilityPortal ||
      !_.isEqual(prevAppConfig, appConfig) ||
      activeTabs?.length !== prevActiveTabs?.length ||
      prevMenu?.length !== menu?.length
    ) {
      return true;
    } else return false;
  };

  componentWillUnmount = () => {
    const { dashboardStrem = null } = this.props;
    document.removeEventListener('keydown', this.disableF5);
    dashboardStrem.off('EventUpdate', this.updateFunction);
  };

  getBackground = (moduleName) => {
    const { path } = this.props;
    return !path?.includes(moduleName) && this.checkBackground(moduleName);
  };

  /**
   * @param {string} path
   */
  checkBackground = (path) => {
    const { activeTabs = [], router: { currentActionTab = '' } = {} } = this.props;
    /**
     * @param {string} actionTab
     */
    return activeTabs.some(
      (actionTab) => (actionTab.startsWith(path) || actionTab === path) && currentActionTab !== actionTab,
    );
  };

  updateFunction = _.debounce((forceUpdate) => {
    const { updateLoader } = this.props;
    this.setState({ ...this.state, key: uuid() }, () => {
      if (!forceUpdate) return;
      updateLoader();
    });
  }, 300);

  disableF5 = (event) => {
    if ((event.which || event.keyCode) === 116) {
      event.preventDefault();
      this.updateFunction(true);
    }
  };

  tabsCreate = () => {
    const { path, activeTabs, router, statusApp, rest, webSocket, onChangeVisibleAction } = this.props;
    const { visibilityPortal = false } = this.state;

    const tabProps = {
      getBackground: this.getBackground,
      activeTabs,
      visibilityPortal,
      onChangeVisibleAction,
      router,
      webSocket,
      statusApp,
      rest,
      path,
    };

    return activeTabs.reduce((tabsComponents, tabKey, index, tabs) => {
      const [moduleNameDirty = '', subModuleName = '', entityDataId = ''] = parseModuleKey(tabKey);

      const moduleName = moduleNameDirty.split('#')[0];
      const type = getModuleTypeByParsedKey(moduleNameDirty, subModuleName, entityDataId);
      const Component = getComponentByKey(tabKey, types.$entrypoint_module);
      const entrypointChildrenExist = !!tabs.find(
        (tab) => path.includes(moduleName) && tab !== tabKey && tab.includes(moduleName),
      );

      const isExistTab = tabs.slice(0, index + 1).some((tab) => tab?.includes(moduleName));
      const isExsistModule = tabsComponents.find(({ type: typeModule = '', tabKey: key }) => {
        switch (typeModule) {
          case types.$entity_entrypoint:
            return key.includes(moduleName) && !key.includes(entityDataId) && isExistTab;
          default:
            return key.includes(moduleName) && isExistTab;
        }
      });

      const tabParams = {
        visible: entrypointChildrenExist || path === tabKey,
        type,
      };

      tabParams.isBackground = !tabParams?.visible && this.getBackground(tabKey);
      const isLink = type === types.$link_entrypoint;

      if (tabsComponents.length && ((isExsistModule && !isLink) || (isLink && entrypointChildrenExist))) {
        return tabsComponents;
      }
      const validModuleName = entityDataId ? moduleName : tabKey;
      return [
        ...tabsComponents,
        {
          tabKey,
          type,
          component: (
            <TabContainer key={`${validModuleName}-tab`} actualParams={tabParams}>
              <Component key={validModuleName} type={type} tabParams={tabParams} {...tabProps} />
            </TabContainer>
          ),
        },
      ];
    }, []);
  };

  render() {
    const { key, visibilityPortal } = this.state;
    const { webSocket, path, appConfig } = this.props;

    if (!key) return <div>Not available application, not found content key</div>;

    const isBackgroundChat = this.getBackground('contactModule_chat');
    const tabs = this.tabsCreate();

    return (
      <Content key={key}>
        {tabs.map(({ component = null }) => component)}
        <ActionPortal appConfig={appConfig} visible={visibilityPortal}>
          <Chat
            key="chatModule"
            isBackground={isBackgroundChat}
            webSocket={webSocket}
            type="modal"
            visible={visibilityPortal || path === 'contactModule_chat'}
          />
        </ActionPortal>
      </Content>
    );
  }
}

export { ContentView };
export default ContentView;
