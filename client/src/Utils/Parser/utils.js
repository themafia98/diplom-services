import moment from 'moment';
import _ from 'lodash';
/** Utils parser */

const runNoCorsParser = (copyStore, sortBy, storeLoad, pathValid) => {
  const sortedCopyStore =
    !sortBy && copyStore.every((it) => it.createdAt)
      ? copyStore.sort((a, b) => {
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

/**
 *
 * @param {string} string
 * @returns {Symbol}
 */
const toSymbol = (string) => {
  if (_.isString(string)) return Symbol.for(string);
  else return Symbol.for('');
};

export { runNoCorsParser, toSymbol };
