import React, { useEffect, useContext, useCallback } from 'react';
import { useState } from 'react';
import Loader from 'Components/Loader/Loader';
import NotFound from 'Modules/NotFound';
import ModelContext from 'Models/context';

const withSystemConfig = (Component) => (props) => {
  const [isSideEffect, setUseSideEffect] = useState(false);
  const [trace, setTrace] = useState('');
  const [typeConfig, setTypeConfig] = useState({ prev: '', current: 'public' });
  const [isBlock, setBlock] = useState(false);
  const [coreConfig, setCoreConfig] = useState(null);
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
    async (newType = '') => {
      try {
        const { current: type = 'public' } = typeConfig;
        const loadType = newType ? newType : type;

        const { Request } = models;

        if (newType && !isSideEffect) {
          setUseSideEffect(true);
        } else if (!newType && isSideEffect) return;

        const rest = new Request();
        const { data: configJson = null } = await rest.sendRequest(`/system/core/${loadType}/config`, 'GET');

        if (!configJson) throw new Error('Invalid system config');
        if (isSideEffect && newType) setUseSideEffect(false);

        onChangeType(loadType);
        onSetCoreConfig(configJson);
      } catch (error) {
        setTrace(error.stack);
        setBlock(true);
      }
    },
    [models, onSetCoreConfig, typeConfig, onChangeType, isSideEffect],
  );

  useEffect(() => {
    if (typeConfig?.prev === typeConfig?.current) return;
    fetchConfig();
  }, [fetchConfig, typeConfig]);

  if (!coreConfig && !isBlock) return <Loader title="Загрузка настроек" />;
  else if (isBlock)
    return (
      <NotFound
        message="Недостаточно прав для просмотра данной страницы"
        trace={trace}
        redirectType="hard"
        showRedirectIndexButton
      />
    );

  return (
    <Component
      {...props}
      coreConfig={coreConfig}
      typeConfig={typeConfig?.current}
      fetchConfig={fetchConfig.bind(this, 'private')}
    />
  );
};

export default withSystemConfig;
