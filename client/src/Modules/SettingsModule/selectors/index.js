// @ts-nocheck
import { createSelector } from 'reselect';
import _ from 'lodash';
import { cache } from './selectors';

const settingsLogsSelector = createSelector(cache, (caches) => {
  const cahceLogs = Object.keys(caches).reduce((logs, key) => {
    if (key.includes('user_settings_log') && !_.isEmpty(caches[key])) {
      logs[key] = { ...caches[key] };
    }
    return logs;
  }, {});

  if (_.isEmpty(cahceLogs)) return [];

  const settingsLogs = Object.keys(cahceLogs)
    .map((logKey) => {
      return {
        ...cahceLogs[logKey],
        date: new Date(cahceLogs[logKey].date),
      };
    })
    .sort((a, b) => b.date - a.date);

  return settingsLogs;
});

export { settingsLogsSelector };
