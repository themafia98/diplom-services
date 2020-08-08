import React, { memo, useState, useEffect, useCallback } from 'react';
import { contactModuleType } from './types';
import { connect } from 'react-redux';

import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import entityRender from 'Utils/Tools/entityRender';
import withRouter from 'Components/Helpers/withRouter';
import types from 'types.modules';
import { oneOfType } from 'Utils';
import { setStatus } from 'Redux/actions/publicActions';
import { compose } from 'redux';
import { withClientDb } from 'Models/ClientSideDatabase';
import actionPath from 'actions.path';

const ContactModule = memo(
  ({
    onLoadCurrentData,
    path,
    type,
    clientDB,
    router,
    statusApp,
    udata,
    webSocket,
    visibilityPortal,
    onChangeVisibleAction,
    entitysList,
  }) => {
    const { shouldUpdate = false, routeData = {}, activeTabs = [] } = router;

    const [isLoading, setLoading] = useState(false);

    useEffect(() => {
      if (path === 'contactModule_feedback' && type === types.$sub_entrypoint_module) {
        onLoadCurrentData({
          action: actionPath.$LOAD_NEWS,
          path,
          optionsForParse: { noCorsClient: false },
          clientDB,
        });
      }
    }, [clientDB, onLoadCurrentData, path, type]);

    const onLoadingData = useCallback(async () => {
      await onLoadCurrentData({
        action: actionPath.$LOAD_NEWS,
        path,
        optionsForParse: { noCorsClient: false },
        clientDB,
      });
    }, [clientDB, onLoadCurrentData, path]);

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
      setLoading(false);
    }, [clientDB, isLoading, onLoadCurrentData, onLoadingData, path, routeData, shouldUpdate, type]);

    const checkBackground = useCallback(
      (path, visible, mode = 'default') => {
        if (mode === 'default') return !visible && activeTabs.some((actionTab) => actionTab === path);
      },
      [activeTabs],
    );

    const renderContactsModules = useCallback(() => {
      const data = routeData[path] || {};
      const { load = false, news = [] } = routeData[path] || {};

      const isVisibleChatModal = visibilityPortal && path !== 'contactModule_chat';

      const subTabProps = {
        isPortal: visibilityPortal,
        onChangeVisibleAction,
        isTab: path === 'contactModule_chat',
        webSocket: webSocket,
        type: isVisibleChatModal ? 'modal' : type,
        data,
        isLoading: !load && !news.length,
        path,
        udata,
        statusApp,
        router,
      };

      const config = {
        viewModuleName: 'newsViewPageModule',
        moduleName: 'contactModule',
        validation: checkBackground,
        path,
        parentType: type,
        type: oneOfType(types.$sub_entrypoint_module, types.$entity_entrypoint),
      };

      const entityList = entityRender(
        activeTabs.filter((tab) => tab === entitysList),
        routeData,
        subTabProps,
        config,
      );
      return entityList.map(({ component = null }) => component);
    }, [
      activeTabs,
      checkBackground,
      entitysList,
      onChangeVisibleAction,
      path,
      routeData,
      router,
      statusApp,
      type,
      udata,
      visibilityPortal,
      webSocket,
    ]);
    debugger;
    return (
      <div key="contactModule" className="contactModule">
        {renderContactsModules()}
      </div>
    );
  },
);

ContactModule.propTypes = contactModuleType;
ContactModule.defaultProps = {
  type: Symbol(''),
  statusApp: '',
  udata: {},
  router: {},
  webSocket: null,
  visibilityPorta: false,
  onChangeVisibleAction: null,
};

const mapStateToProps = (state) => {
  const {
    router = {},
    publicReducer: { udata = {}, appConfig },
  } = state;
  return { router, udata, appConfig };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadCurrentData: (props) => dispatch(loadCurrentData(props)),
    onSetStatus: (props) => dispatch(setStatus(props)),
  };
};

export default compose(connect(mapStateToProps, mapDispatchToProps), withClientDb, withRouter)(ContactModule);
