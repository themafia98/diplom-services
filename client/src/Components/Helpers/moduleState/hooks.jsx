import { useContext } from 'react';
import { moduleContextState } from './context';
import { moduleContextActions } from './context';

const useModuleState = useContext(moduleContextState);
const useModuleActions = useContext(moduleContextActions);

export { useModuleActions, useModuleState };
