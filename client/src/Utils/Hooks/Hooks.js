import namespaceCacheHook from './cacheHook';
import namespaceCoreHook from './coreHook';

const { cachingHook, getterCacheHook, putterCacheHook } = namespaceCacheHook;
const { coreUpdaterDataHook, errorHook, updateEntityHook } = namespaceCoreHook;

/** Hooks exports */

const namespaceHooks = {
  errorHook,
  coreUpdaterDataHook,
  cachingHook,
  getterCacheHook,
  putterCacheHook,
  updateEntityHook,
};

export default namespaceHooks;
