import { createSelector } from 'reselect';
import _ from 'lodash';
import { cache, settings, artifacts } from './selectors';

const selectSettingsLogs = createSelector(cache, (caches) => {
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

const selectSettingsStatus = createSelector(settings, (list) => {
  return list.find((item) => item?.idSettings && item?.idSettings === 'statusSettings') || {};
});

const selectSettingsTasksPriority = createSelector(settings, (list) => {
  return list.find((item) => item?.idSettings && item?.idSettings === 'tasksPriority') || {};
});

const selectSettingsArtifacts = createSelector(artifacts, (list) => {
  return list;
});

export { selectSettingsLogs, selectSettingsStatus, selectSettingsArtifacts, selectSettingsTasksPriority };
