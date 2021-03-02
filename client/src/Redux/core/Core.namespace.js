import namespaceCache from './cache';
import namespaceCore from './updater';

const { cachingThunk, getterCacheThunk, putterCacheThunk } = namespaceCache;
const { coreDataUpdater, errorThunk, updateEntityThunk } = namespaceCore;

export default {
  errorThunk,
  coreDataUpdater,
  cachingThunk,
  getterCacheThunk,
  putterCacheThunk,
  updateEntityThunk,
};
