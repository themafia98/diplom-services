import React, { createContext, useEffect, useContext, useCallback } from 'react';
import Request from 'Models/Rest';
import Schema from 'Models/Schema';
import TreeBuilder from './TreeBuilder';
import { useState } from 'react';
import { message } from 'antd';
import Loader from 'Components/Loader/Loader';

export const modelMethods = {
  TreeBuilder,
  Schema,
  Request,
  rest: new Request(),
  schema: new Schema('no-strict'),
};

const ModelContext = createContext(modelMethods);

const withSystemConfig = (Component) => (props) => {
  const [coreConfig, setCoreConfig] = useState(null);
  const models = useContext(ModelContext);

  const onSetCoreConfig = useCallback(
    (config = {}) => {
      if (coreConfig || !config || typeof config !== 'object') return;

      setCoreConfig(config);
    },
    [coreConfig],
  );

  const fetchConfig = useCallback(async () => {
    try {
      const { Request } = models;
      const rest = new Request();
      const { data: configJson = null } = await rest.sendRequest('/system/core/config', 'GET');

      if (!configJson) throw new Error('Invalid system config');

      onSetCoreConfig(configJson);
    } catch (error) {
      console.error(error);
      message.error(error?.message || 'Invalid');
    }
  }, [models, onSetCoreConfig]);

  useEffect(() => {
    if (coreConfig) return;

    fetchConfig();
  }, [coreConfig, fetchConfig]);

  if (!coreConfig) return <Loader title="Загрузка настроек" />;

  return <Component {...props} coreConfig={coreConfig} />;
};

export { withSystemConfig };
export default ModelContext;
