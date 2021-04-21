import React, { memo, useState, useEffect, useCallback, useMemo } from 'react';
import { contactModuleType } from './ContactModule.types';
import { useDispatch, useSelector } from 'react-redux';
import { loadCurrentData } from 'Redux/middleware/routerReducer.thunk';
import entityRender from 'Utils/Tools/entityRender';
import withRouter from 'Components/Helpers/withRouter';
import types from 'types.modules';
import { oneOfType, routeParser } from 'Utils';
import { compose } from 'redux';
import { withClientDb } from 'Models/ClientSideDatabase';
import actionPath from 'actions.path';

const ContactModule = memo(
  ({ path, type, clientDB, statusApp, webSocket, visibilityPortal, onChangeVisibleAction, entitysList }) => {
    const dispatch = useDispatch();

    const router = useSelector(({ router }) => router);

    const { shouldUpdate = false, routeData = {}, activeTabs = [] } = router;

    const [isLoading, setLoading] = useState(false);

    const onLoadingData = useCallback(async () => {
      dispatch(
        loadCurrentData({
          action: actionPath.$LOAD_NEWS,
          path,
          optionsForParse: { noCorsClient: false },
          clientDB,
        }),
      );
    }, [clientDB, dispatch, path]);

    useEffect(() => {
      if (path === 'contactModule_feedback' && type === types.$sub_entrypoint_module) {
        onLoadingData();
      }
    }, [type, path, onLoadingData]);

    useEffect(() => {
      const shouldUpdateList = routeData[path] && routeData[path]?.shouldUpdate;
      const isUnloadModule = shouldUpdate && !routeData[path]?.load;
      const { loading = false } = routeData[path] || {};

      const isCloseTabAction = !isUnloadModule && !shouldUpdateList && shouldUpdate && !loading;
      const isAvailable = path === 'contactModule_feedback' && type === types.$sub_entrypoint_module;

      if (!(isAvailable && !isLoading && (isUnloadModule || shouldUpdateList || isCloseTabAction))) {
        return;
      }

      setLoading(true);
      onLoadingData();
    }, [clientDB, isLoading, onLoadingData, path, routeData, shouldUpdate, type]);

    const checkBackground = useCallback(
      (path, visible, mode = 'default') => {
        if (mode === 'default') return !visible && activeTabs.some((actionTab) => actionTab === path);
      },
      [activeTabs],
    );

    const tabsContactModule = useMemo(() => {
      const data = routeData[path] || {};
      const { load = false, news = [] } = routeData[path] || {};

      const isVisibleChatModal = visibilityPortal && path !== 'contactModule_chat';
      const enitityId = routeParser({ pageType: 'moduleItem', path }).itemId;

      let normalizeData = data;

      if (news.length) {
        normalizeData = news.find((it) => it._id === enitityId) || data;
      }

      const subTabProps = {
        isPortal: visibilityPortal,
        onChangeVisibleAction,
        isTab: path === 'contactModule_chat',
        webSocket: webSocket,
        type: isVisibleChatModal ? 'modal' : type,
        data: normalizeData,
        isLoading: !load && !news.length,
        path,
        statusApp,
        router,
        onLoadingData,
      };

      const config = {
        viewModuleName: 'newsViewPageModule',
        moduleName: 'contactModule',
        validation: checkBackground,
        path,
        parentType: type,
        type: oneOfType(types.$sub_entrypoint_module, types.$entity_entrypoint),
      };

      return entityRender(activeTabs, subTabProps, config, entitysList);
    }, [
      onLoadingData,
      activeTabs,
      checkBackground,
      entitysList,
      onChangeVisibleAction,
      path,
      routeData,
      router,
      statusApp,
      type,
      visibilityPortal,
      webSocket,
    ]);

    return (
      <div key="contactModule" className="contactModule">
        {tabsContactModule}
      </div>
    );
  },
);

ContactModule.propTypes = contactModuleType;
ContactModule.defaultProps = {
  webSocket: null,
  visibilityPortal: false,
  onChangeVisibleAction: null,
};

export default compose(withClientDb, withRouter)(ContactModule);
