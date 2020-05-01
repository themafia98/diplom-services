// @ts-nocheck
import { createSelector } from 'reselect';
import _ from 'lodash';
import { cache } from './selectors';

const settingsLogsSelector = createSelector(cache, (caches) => {
  let settingsLogs = Object.keys(caches).reduce((logs, key) => {
    if (key.includes('user_settings_log') && !_.isEmpty(caches[key])) {
      logs[key] = { ...caches[key] };
    }
    return logs;
  }, {});
  if (!_.isEmpty(settingsLogs))
    settingsLogs = Object.keys(settingsLogs)
      .map((logKey) => {
        return {
          ...settingsLogs[logKey],
          date: new Date(settingsLogs[logKey].date),
        };
      })
      .sort((a, b) => b.date - a.date);

  return settingsLogs;
});

export { settingsLogsSelector };
