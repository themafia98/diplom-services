import namespaceCacheHook from './cacheHook';
import namespaceCoreHook from './coreHook';

const { cachingHook, getterCacheHook } = namespaceCacheHook;
const { coreUpdaterDataHook, errorHook } = namespaceCoreHook;

/** Hooks exports */

const namespaceHooks = {
  errorHook,
  coreUpdaterDataHook,
  cachingHook,
  getterCacheHook,
};

export default namespaceHooks;
