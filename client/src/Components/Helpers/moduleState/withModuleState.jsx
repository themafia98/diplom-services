import React, { useReducer, useMemo } from 'react';
import ModelContext, { modelMethods } from 'Models/context';
import { contextReducer, contextState } from './state';
import { ModuleContextState } from './context';
import { ModuleContextActions } from './context';
import { SET_VISIBILITY } from './constants';

const withModuleState = (Component) => (props) => {
  const [moduleContextState, dispatch] = useReducer(contextReducer, contextState);

  const actions = useMemo(
    () => ({
      setVisibility: (payload) =>
        dispatch({
          type: SET_VISIBILITY,
          payload,
        }),
    }),
    [],
  );

  return (
    <ModelContext.Provider value={modelMethods}>
      <ModuleContextState.Provider value={moduleContextState}>
        <ModuleContextActions.Provider value={actions}>
          <Component {...props} />
        </ModuleContextActions.Provider>
      </ModuleContextState.Provider>
    </ModelContext.Provider>
  );
};

const moduleContextToProps = (Component) => (props) => (
  <ModelContext.Consumer>
    {(modelsContext) => (
      <ModuleContextState.Consumer>
        {(moduleContext) => (
          <ModuleContextActions.Consumer>
            {(moduleActionsContext) => (
              <Component
                moduleContext={moduleContext}
                modelsContext={modelsContext}
                moduleActionsContext={moduleActionsContext}
                {...props}
              />
            )}
          </ModuleContextActions.Consumer>
        )}
      </ModuleContextState.Consumer>
    )}
  </ModelContext.Consumer>
);

export { moduleContextToProps };
export default withModuleState;
