import React from 'react';
import TabContainer from 'Components/TabContainer';
import { getComponentByKey } from 'Utils';
import types from 'types.modules';
import regExpRegister from './regexpStorage';
import NotFound from 'Modules/NotFound/NotFound';

const entityRender = (entitysList, subTabProps, config) => {
  if (!entitysList || !config) {
    return <NotFound message="Invalid render page" error={new Error('entitysList || config not found')} />;
  }

  const { validation, path, viewModuleName, moduleName, type: typeEntity, exclude } = config;

  const entitys = [
    ...new Set([
      ...entitysList,
      !!path?.includes(moduleName) && !exclude?.some((it) => it === path) ? path : null,
    ]),
  ].filter(Boolean);

  return entitys.map((entityKey) => {
    const { uuid = '', data: dataTab = null } = subTabProps;
    const { routeData = null } = subTabProps.router;

    const isCheckerType = typeof typeEntity === 'function';

    // if (
    //   components.some(
    //     ({ type, tabKey }) =>
    //       tabKey?.includes(entityKey.split(regExpRegister.MODULE_ID)[1]) &&
    //       type === (isCheckerType ? typeEntity(type) : typeEntity),
    //   )
    // ) {
    //   return components;
    // }

    const [, moduleViewKey] = entityKey.split(regExpRegister.MODULE_ID);
    const isView = entityKey?.includes(moduleName) && !!moduleViewKey;

    let type = typeEntity;

    if (isView && isCheckerType) {
      type = typeEntity(types.$entity_entrypoint);
    }

    if (!isView && isCheckerType) {
      type = typeEntity(types.$sub_entrypoint_module);
    }

    const Component = getComponentByKey(isView ? viewModuleName : entityKey, type);

    let data = dataTab;

    if (isView && uuid && routeData) {
      data = routeData[uuid];
    } else if (routeData && moduleViewKey && Object.keys(routeData).some((key) => key === moduleViewKey)) {
      data = routeData[moduleViewKey];
    }

    const bgArgs = [entityKey, path.includes(moduleName) && path === entityKey];

    const isVisibileTab =
      path.includes(moduleName) && (path === entityKey || (moduleViewKey && path.includes(moduleViewKey)));

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
          <Component
            key={`${entityKey}_${Symbol.keyFor(type)}`}
            {...subTabProps}
            {...propsModuleView}
            type={type}
          />
        </TabContainer>
      );
    }
    return null;
  });
};

export default entityRender;
