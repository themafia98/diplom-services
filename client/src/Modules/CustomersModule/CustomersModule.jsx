import React, { memo, useCallback } from 'react';
import { customersModuleType } from './CustomersModule.types';
import { useSelector } from 'react-redux';
import withRouter from 'Components/Helpers/withRouter/withRouter';
import entityRender from 'Utils/Tools/entityRender';
import types from 'types.modules';

const CustomersModule = memo(
  ({ activeTabs, path, statusApp, webSocket, visibilityPortal, entitysList, type }) => {
    const router = useSelector(({ router }) => router);

    const { routeData } = router;

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
    }, [checkBackground, entitysList, path, routeData, router, statusApp, type, visibilityPortal, webSocket]);

    return <div className="customersModule">{renderCustomers()}</div>;
  },
);

CustomersModule.defaultProps = {
  visible: false,
  activeTabs: [],
  statusApp: '',
  webSocket: null,
  visibilityPortal: false,
  entitysList: [],
};

CustomersModule.propTypes = customersModuleType;

export default withRouter(CustomersModule);
