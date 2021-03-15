import React, { useEffect, useContext, useCallback } from 'react';
import { useState } from 'react';
import Loader from 'Components/Loader/Loader';
import NotFound from 'Modules/NotFound';
import ModelContext from 'Models/context';
import { Suspense } from 'react';

const withSystemConfig = (Component) => (props) => {
  const [isSideEffect, setUseSideEffect] = useState(false);
  const [trace, setTrace] = useState('');
  const [typeConfig, setTypeConfig] = useState({ prev: '', current: 'public' });
  const [isBlock, setBlock] = useState(false);
  const [coreConfig, setCoreConfig] = useState(null);
  const [queryId, setQueryId] = useState(null);
  const models = useContext(ModelContext);

  const onSetCoreConfig = useCallback((config = {}) => {
    if (!config || typeof config !== 'object') return;
    setCoreConfig(config);
  }, []);

  const onChangeType = useCallback(
    (type = 'public') => {
      if ([typeConfig?.current, typeConfig?.prev].some((stateType) => stateType !== type)) {
        setTypeConfig({ prev: typeConfig?.current, current: type });
      }
    },
    [typeConfig],
  );

  const fetchConfig = useCallback(
    async (newType = '', query = '') => {
      try {
        const { current: type = 'public' } = typeConfig;
        const loadType = newType ? newType : type;

        if (!queryId && query) setQueryId(query);

        const { Request } = models;

        if (newType && !isSideEffect) {
          setUseSideEffect(true);
        } else if (!newType && isSideEffect) return;

        const queryString = query && !queryId ? `?uid=${query}` : queryId ? `?uid=${queryId}` : '';

        const rest = new Request();

        const response = await rest.sendRequest(`/system/core/${loadType}/config${queryString}`, 'GET');

        const { data: configJson = null } = response;

        if (!configJson) throw new Error('Invalid system config');
        if (isSideEffect && newType) setUseSideEffect(false);

        onChangeType(loadType);
        onSetCoreConfig(configJson);
      } catch (error) {
        setTrace(error.stack);
        setBlock(true);
      }
    },
    [typeConfig, queryId, models, isSideEffect, onChangeType, onSetCoreConfig],
  );

  useEffect(() => {
    if (typeConfig?.prev === typeConfig?.current) return;
    fetchConfig();
  }, [fetchConfig, typeConfig]);

  const createFetchPrivateConfig = useCallback(() => fetchConfig.bind(this, 'private'), [fetchConfig]);

  if (!coreConfig && !isBlock) {
    return <Loader title="Loading settings" />;
  }

  if (isBlock) {
    return (
      <Suspense fallback="loading">
        <NotFound trace={trace} redirectType="hard" showRedirectIndexButton />
      </Suspense>
    );
  }

  return (
    <Component
      {...props}
      coreConfig={coreConfig}
      typeConfig={typeConfig?.current}
      fetchConfig={createFetchPrivateConfig()}
    />
  );
};

export default withSystemConfig;
