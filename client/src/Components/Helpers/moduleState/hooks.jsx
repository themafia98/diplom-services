import { useContext } from 'react';
import { ModuleContextState } from './context';
import { ModuleContextActions } from './context';

const useModuleState = () => useContext(ModuleContextState);
const useModuleActions = () => useContext(ModuleContextActions);

export { useModuleActions, useModuleState };
