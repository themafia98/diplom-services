import namespaceCacheHook from './cacheHook';
import namespaceCoreHook from './coreHook';

const { cachingHook, getterCacheHook, putterCacheHook } = namespaceCacheHook;
const { coreUpdaterDataHook, errorHook } = namespaceCoreHook;

/** Hooks exports */

const namespaceHooks = {
  errorHook,
  coreUpdaterDataHook,
  cachingHook,
  getterCacheHook,
  putterCacheHook,
};

export default namespaceHooks;
