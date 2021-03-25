import React, { memo, useCallback, useMemo } from 'react';
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

    const tabsCustomers = useMemo(() => {
      const subTabProps = {
        isPortal: visibilityPortal,
        webSocket: webSocket,
        type,
        path,
        statusApp,
        router,
        routeData,
      };

      const config = {
        moduleName: 'customersModule',
        validation: checkBackground,
        path,
        parentType: type,
        type: types.$sub_entrypoint_module,
      };

      return entityRender(entitysList, subTabProps, config);
    }, [checkBackground, entitysList, path, routeData, router, statusApp, type, visibilityPortal, webSocket]);

    return <div className="customersModule">{tabsCustomers}</div>;
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
