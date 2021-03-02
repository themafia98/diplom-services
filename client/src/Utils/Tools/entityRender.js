import React from 'react';
import _ from 'lodash';
import TabContainer from 'Components/TabContainer';
import { getComponentByKey } from 'Utils/utils.global';
import types from 'types.modules';
import regExpRegister from './regexpStorage';

const entityRender = (entitysList = [], routeData = {}, subTabProps = {}, config = {}) => {
  const {
    validation = null,
    path = '',
    viewModuleName = '',
    moduleName = '',
    type: typeEntity = [],
    exclude = [],
  } = config || {};

  const validPath = !!path?.includes(moduleName) && !exclude?.some((it) => it === path) ? path : null;
  const entitys = _.uniq([...entitysList, validPath]);

  return entitys.reduce((components, entityKey) => {
    if (!entityKey) return components;
    const { uuid = '', router: { routeData = {} } = {}, data: dataTab = {} } = subTabProps || {};
    const isCheckerType = typeof typeEntity === 'function';
    if (
      components.some(({ type = Symbol(''), tabKey = '' }) => {
        return (
          tabKey?.includes(entityKey.split(regExpRegister.MODULE_ID)[1]) &&
          type === (isCheckerType ? typeEntity(type) : typeEntity)
        );
      })
    )
      return components;

    const [, moduleViewKey] = entityKey?.split(regExpRegister.MODULE_ID);
    const isView = entityKey?.includes(moduleName) && !!moduleViewKey;

    const type = isView
      ? isCheckerType
        ? typeEntity(types.$entity_entrypoint)
        : typeEntity
      : isCheckerType
      ? typeEntity(types.$sub_entrypoint_module)
      : typeEntity;

    const Component = getComponentByKey(isView ? viewModuleName : entityKey, type);

    const data =
      isView && uuid && routeData
        ? routeData[uuid]
        : routeData && moduleViewKey && Object.keys(routeData).some((key) => key === moduleViewKey)
        ? routeData[moduleViewKey]
        : dataTab;

    const bgArgs = [entityKey, path.includes(moduleName) && path === entityKey];
    const tabParams = {
      visible:
        path.includes(moduleName) && (path === entityKey || (moduleViewKey && path.includes(moduleViewKey))),
      isHasChildren: path === entityKey,
      isBackground: validation ? validation(...bgArgs) : false,
    };

    const propsModuleViewKey =
      !uuid && moduleViewKey && data
        ? {
            listdata: data,
            ...data,
          }
        : {};

    if (Component)
      return [
        ...components,
        {
          tabKey: entityKey,
          type,
          component: (
            <TabContainer key={`${entityKey}-container`} actualParams={tabParams}>
              <Component
                key={`${entityKey}_${Symbol.keyFor(type)}`}
                {...subTabProps}
                {...propsModuleViewKey}
                type={type}
              />
            </TabContainer>
          ),
        },
      ];

    return components;
  }, []);
};

export default entityRender;
