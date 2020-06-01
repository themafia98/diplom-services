import moment from 'moment';
/** Utils parser */

const runNoCorsParser = (copyStore, sortBy, storeLoad, pathValid) => {
  debugger;
  const sortedCopyStore =
    !sortBy && copyStore.every((it) => it.createdAt)
      ? copyStore.sort((a, b) => {
          debugger;
          const aDate = moment(a.createdAt).unix();
          const bDate = moment(b.createdAt).unix();
          return bDate - aDate;
        })
      : sortBy
      ? copyStore.sort((a, b) => a[sortBy] - b[sortBy])
      : copyStore;

  const data = { [storeLoad]: sortedCopyStore, load: true, path: pathValid };
  return { data, shouldUpdateState: Boolean(storeLoad) };
};

export { runNoCorsParser };
