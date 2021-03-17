import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { getComponentByKey, parseModuleKey, getModuleTypeByParsedKey } from 'Utils';
import { contentViewType } from './ContentView.types';
import _ from 'lodash';
import { Layout, Spin } from 'antd';

import ActionPortal from 'Components/ActionPortal';
import Chat from 'Modules/ContactModule/Chat';
import TabContainer from 'Components/TabContainer';
import { v4 as uuid } from 'uuid';
import types from 'types.modules';
import { APP_STATUS } from 'App.constant';

const { Content } = Layout;

const ContentView = memo(
  ({
    isToolbarActive,
    dashboardStream,
    path,
    activeTabs,
    router,
    updateLoader,
    statusApp,
    rest,
    webSocket,
    onChangeVisibleAction,
    shouldShowSpinner,
    appConfig,
  }) => {
    const [visibilityPortal, setVisiblePortal] = useState(false);
    const [refreshKey, setRefreshKey] = useState(uuid);

    const { currentActionTab } = router;

    const updateFunction = useMemo(
      () =>
        _.debounce((forceUpdate) => {
          setRefreshKey(uuid());

          if (!forceUpdate) {
            return;
          }

          updateLoader();
        }, 300),
      [updateLoader],
    );

    const disableF5 = useCallback(
      (event) => {
        if ((event.which || event.keyCode) === 116) {
          event.preventDefault();
          updateFunction(true);
        }
      },
      [updateFunction],
    );

    useEffect(() => {
      if (isToolbarActive !== visibilityPortal) {
        setVisiblePortal(isToolbarActive);
      }
    }, [isToolbarActive, visibilityPortal]);

    useEffect(() => {
      document.addEventListener('keydown', disableF5);
      dashboardStream.on('EventUpdate', updateFunction);
      return () => {
        document.removeEventListener('keydown', disableF5);
        dashboardStream.off('EventUpdate', updateFunction);
      };
    }, [dashboardStream, disableF5, updateFunction]);

    const checkBackground = useCallback(
      (path) => {
        if (!activeTabs) {
          return false;
        }

        return activeTabs.some(
          (actionTab) => (actionTab.startsWith(path) || actionTab === path) && currentActionTab !== actionTab,
        );
      },
      [activeTabs, currentActionTab],
    );

    const getBackground = useCallback(
      (moduleName) => {
        return !path?.includes(moduleName) && checkBackground(moduleName);
      },
      [path, checkBackground],
    );

    const tabs = useMemo(() => {
      if (!activeTabs) {
        return null;
      }
      const tabProps = {
        getBackground,
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

        const [moduleName] = moduleNameDirty.split('#');
        const type = getModuleTypeByParsedKey(moduleNameDirty, subModuleName, entityDataId);
        const Component = getComponentByKey(tabKey, types.$entrypoint_module);
        const entrypointChildrenExist =
          tabs &&
          !!tabs.find((tab) => path.includes(moduleName) && tab !== tabKey && tab?.includes(moduleName));

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

        tabParams.isBackground = !tabParams?.visible && getBackground(tabKey);
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
    }, [
      activeTabs,
      getBackground,
      onChangeVisibleAction,
      path,
      rest,
      router,
      statusApp,
      visibilityPortal,
      webSocket,
    ]);

    const isBackgroundChat = useMemo(() => getBackground('contactModule_chat'), [getBackground]);

    if (!refreshKey) {
      return <div>Not available application, not found content key</div>;
    }

    if (shouldShowSpinner) {
      return (
        <Content className="contentView contentView--loader">
          <Spin size="large" tip="Content loading" />
        </Content>
      );
    }

    return (
      <Content className="contentView" key={refreshKey}>
        {tabs && tabs.map(({ component = null }) => component)}
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
  },
);

ContentView.propTypes = contentViewType;
ContentView.defaultProps = {
  dashboardStream: null,
  shouldRenderMenu: true,
  path: '',
  activeTabs: null,
  router: {},
  statusApp: APP_STATUS.ON,
  rest: null,
  webSocket: null,
  onChangeVisibleAction: null,
  isToolbarActive: false,
  visibilityPortal: false,
};

export { ContentView };
export default ContentView;
