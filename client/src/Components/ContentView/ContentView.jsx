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
import { useSelector } from 'react-redux';

const { Content } = Layout;

const ContentView = memo(
  ({
    isToolbarActive,
    dashboardStream,
    path,
    activeTabs,
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

    const { currentActionTab } = useSelector(({ router }) => router);

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
        webSocket,
        statusApp,
        rest,
        path,
      };

      let tabsList = null;

      activeTabs.forEach((tabKey, index) => {
        const [moduleNameDirty = '', subModuleName = '', entityDataId = ''] = parseModuleKey(tabKey);
        const [moduleName] = moduleNameDirty.split('#');
        const type = getModuleTypeByParsedKey(moduleNameDirty, subModuleName, entityDataId);

        let childrensExistInEntrypointTypeTab = false;

        if (Array.isArray(activeTabs) && path && path.includes(moduleName)) {
          childrensExistInEntrypointTypeTab = !!activeTabs.some(
            (tabItem) => tabItem !== tabKey && tabItem && tabItem.includes(moduleName),
          );
        }

        const isExistTab = activeTabs.slice(0, index + 1).some((tab) => tab?.includes(moduleName));
        const isExsistModule =
          tabsList &&
          tabsList.find(({ type, tabKey }) => {
            switch (type) {
              case types.$entity_entrypoint:
                return tabKey && tabKey.includes(moduleName) && !tabKey.includes(entityDataId) && isExistTab;
              default:
                return tabKey && tabKey.includes(moduleName) && isExistTab;
            }
          });

        const tabParams = {
          visible: childrensExistInEntrypointTypeTab || path === tabKey,
          type,
        };

        tabParams.isBackground = !tabParams?.visible && getBackground(tabKey);
        const isLink = type === types.$link_entrypoint;

        const isEntrypointTabLink = isLink && childrensExistInEntrypointTypeTab;
        const isSimpleTab = isExsistModule && !isLink;

        if (tabsList && tabsList.length && (isSimpleTab || isEntrypointTabLink)) {
          return;
        }

        const normalizeName = entityDataId ? moduleName : tabKey;
        const Component = getComponentByKey(tabKey, types.$entrypoint_module);

        if (tabsList === null) {
          tabsList = [];
        }

        tabsList.push({
          tabKey,
          type,
          component: (
            <TabContainer key={`${normalizeName}-tab`} actualParams={tabParams}>
              <Component key={normalizeName} type={type} tabParams={tabParams} {...tabProps} />
            </TabContainer>
          ),
        });
      });

      if (tabsList) {
        return tabsList.map(({ component }) => component);
      }

      return tabsList;
    }, [
      activeTabs,
      getBackground,
      onChangeVisibleAction,
      path,
      rest,
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
        {tabs}
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
  statusApp: APP_STATUS.ON,
  rest: null,
  webSocket: null,
  onChangeVisibleAction: null,
  isToolbarActive: false,
  visibilityPortal: false,
};

export { ContentView };
export default ContentView;
