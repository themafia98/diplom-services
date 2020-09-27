import React, { memo, useCallback } from 'react';
import { customersModuleType } from './CustomersModule.types';
import { connect } from 'react-redux';
import { compose } from 'redux';
import withRouter from 'Components/Helpers/withRouter/withRouter';
import entityRender from 'Utils/Tools/entityRender';
import types from 'types.modules';

const CustomersModule = memo(
  ({ activeTabs, path, statusApp, router, udata, webSocket, visibilityPortal, entitysList, type }) => {
    const { routeData = {} } = router || {};

    const checkBackground = useCallback(
      (path) => {
        return activeTabs.some((actionTab) => actionTab.startsWith(path) || actionTab === path);
      },
      [activeTabs],
    );

    const renderCustomers = useCallback(() => {
      const subTabProps = {
        isPortal: visibilityPortal,
        webSocket: webSocket,
        type,
        path,
        udata,
        statusApp,
        router,
      };

      const config = {
        moduleName: 'customersModule',
        validation: checkBackground,
        path,
        parentType: type,
        type: types.$sub_entrypoint_module,
      };

      const entityList = entityRender(entitysList, routeData, subTabProps, config);
      return entityList.map(({ component = null }) => component);
    }, [
      checkBackground,
      entitysList,
      path,
      routeData,
      router,
      statusApp,
      type,
      udata,
      visibilityPortal,
      webSocket,
    ]);

    return <div className="customersModule">{renderCustomers()}</div>;
  },
);

CustomersModule.propTypes = customersModuleType;

const mapStateToProps = (state) => {
  const { publicReducer } = state;
  const { appConfig, udata } = publicReducer;
  return { appConfig, udata };
};

export default compose(connect(mapStateToProps), withRouter)(CustomersModule);
