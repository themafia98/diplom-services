import React from 'react';
import TabContainer from 'Components/TabContainer';
import { getComponentByKey } from 'Utils';
import types from 'types.modules';
import regExpRegister from './regexpStorage';
import NotFound from 'Modules/NotFound/NotFound';

const entityRender = (activeTabs, subTabProps, config, moduleEntitysList = null) => {
  const entitysList = Array.isArray(moduleEntitysList)
    ? activeTabs.filter((tab) => entitysList.some((entityName) => tab.includes(entityName)))
    : activeTabs;

  if (!entitysList || !config) {
    return <NotFound message="Invalid render page" error={new Error('entitysList || config not found')} />;
  }

  const { validation, viewModuleName, type: typeEntity, exclude } = config;
  const moduleName = config.moduleName || config.route.page || config.namePath;
  const path = config.path || config.currentActionTab || config.path;

  const entitys = [
    ...new Set([
      ...entitysList,
      !!path?.includes(moduleName) && !exclude?.some((it) => it === path) ? path : null,
    ]),
  ].filter(Boolean);

  return entitys.map((entityKey) => {
    const { uuid = '', data: dataTab = null, router = null } = subTabProps;
    const { routeData = null } = router || {};

    const isCheckerType = typeof typeEntity === 'function';

    const [, moduleViewKey] = entityKey.split(regExpRegister.MODULE_ID);
    const isView = entityKey?.includes(moduleName) && !!moduleViewKey;

    let type = types.$entrypoint_module;

    if (isView && isCheckerType) {
      type = typeEntity(types.$entity_entrypoint);
    }

    if (!isView && isCheckerType && entityKey.includes('_')) {
      type = typeEntity(types.$sub_entrypoint_module);
    }

    if (config.parentType === types.$sub_entrypoint_module && type === types.$entrypoint_module) {
      return null;
    }

    const Component = getComponentByKey(isView ? viewModuleName : entityKey, type);

    let data = dataTab;

    if (isView && uuid && routeData) {
      data = routeData[uuid];
    } else if (routeData && moduleViewKey && Object.keys(routeData).some((key) => key === moduleViewKey)) {
      data = routeData[moduleViewKey];
    }

    const bgArgs = [entityKey, !!path && path.includes(moduleName) && path === entityKey];

    const isVisibileTab =
      path &&
      path.includes(moduleName) &&
      (path === entityKey || (!!moduleViewKey && path.includes(moduleViewKey)));

    const tabParams = {
      visible: isVisibileTab,
      isHasChildren: path === entityKey,
      isBackground: validation ? validation(...bgArgs) : false,
    };

    let propsModuleView = {};

    if (!uuid && moduleViewKey && data) {
      propsModuleView = {
        listdata: data,
        ...data,
      };
    }

    if (Component) {
      return (
        <TabContainer key={`${entityKey}-container`} actualParams={tabParams}>
          <Component key={`${entityKey}-item`} {...subTabProps} {...propsModuleView} type={type} />
        </TabContainer>
      );
    }
    return null;
  });
};

export default entityRender;
