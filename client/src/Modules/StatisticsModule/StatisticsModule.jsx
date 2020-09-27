import React, { memo, useCallback, useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import { statisticsModuleType } from './StatisticsModule.types';
import moment from 'moment';
import { useDispatch, useSelector } from 'react-redux';
import Bar from './Charts/Bar';
import TitleModule from 'Components/TitleModule';
import { settingsStatusSelector } from 'Utils/selectors';
import FixedToolbar from 'Components/FixedToolbar';
import { Button } from 'antd';
import { withClientDb } from 'Models/ClientSideDatabase';
import actionPath from 'actions.path';
import { loadCurrentData } from 'Redux/actions/routerActions/middleware';

const StatisticsModule = memo(({ path, clientDB }) => {
  const dispatch = useDispatch();

  const [isLoad, setLoad] = useState(false);
  const [dateConfig, setDateConfig] = useState([2, 'weeks']);
  const [textContent, setTextContent] = useState('');

  const {
    statusValuesList,
    appConfig,
    data,
    shouldUpdate,
    loading,
    isUnloadModule,
    shouldUpdateList,
    barData,
  } = useSelector((state) => {
    const { router, publicReducer } = state;
    const { appConfig } = publicReducer;
    const { path, routeData } = router;
    const data = routeData[path] || null;
    const { shouldUpdate = false } = router;

    const shouldUpdateList = data && data?.shouldUpdate;
    const isUnloadModule = shouldUpdate && !data?.load;
    const loading = data?.loading;
    const { [path]: currentModule = {} } = routeData;

    const { tasks = [] } = currentModule;
    const { bar: barData = {} } = tasks[0] || {};

    const statusValuesList = settingsStatusSelector(state) || {};

    return {
      routeData,
      statusValuesList,
      appConfig,
      data,
      shouldUpdate,
      loading,
      isUnloadModule,
      shouldUpdateList,
      barData,
    };
  });

  const { settings = [] } = statusValuesList;

  const fetchStatistics = useCallback(
    (shouldSetLoading = false) => {
      const statsListFields = settings.reduce((list, { value = '' }) => {
        if (value) return [...list, value];
        return list;
      }, []);

      const { statistics = {} } = appConfig;
      const { limitListTasks = 5000 } = statistics;

      let limits = {};

      if (dateConfig[0] === 'full') {
        limits = {
          limitList: limitListTasks,
        };
      }

      dispatch(
        loadCurrentData({
          action: actionPath.$LOAD_STATISTICS_TASKS,
          path,
          options: {
            queryParams: {
              statsListFields,
              ...limits,
            },
            queryType: dateConfig[0],
            todayISO:
              dateConfig[0] === 'full'
                ? moment().toISOString()
                : moment()
                    .subtract(...dateConfig)
                    .toISOString(),
          },
          optionsForParse: {
            noCorsClient: true,
            shouldSetLoading,
          },
          clientDB,
        }),
      );
    },
    [appConfig, clientDB, dateConfig, dispatch, path, settings],
  );

  useEffect(() => {
    if (!path || !path?.includes('statistic')) return;

    const isInitialTab = !isLoad && isUnloadModule;
    const shouldFetch = isInitialTab || !isLoad || shouldUpdateList;

    if (!Array.isArray(dateConfig) || !shouldFetch) return;

    if (!isLoad) setLoad(true);

    fetchStatistics(!isUnloadModule);
  }, [data, dateConfig, fetchStatistics, isLoad, isUnloadModule, path, shouldUpdateList]);

  const onChangeBar = useCallback(
    ({ currentTarget: { textContent = '' } }, dateConfig = []) => {
      setDateConfig(dateConfig);
      setTextContent(textContent);

      fetchStatistics(true);
    },
    [fetchStatistics],
  );

  const toolbarBody = useMemo(
    () => (
      <div className="toolbarBody">
        <div className="controllers">
          <p>Смена периода</p>
          <ul className="toolbar-actions-list">
            <li className="toolbar-action-item">
              <Button
                loading={loading && dateConfig[1] === 'day'}
                className={clsx(dateConfig[1] === 'day' ? 'active' : null)}
                onClick={(evt) => onChangeBar(evt, [1, 'day'])}
              >
                Статистика за день
              </Button>
            </li>
            <li className="toolbar-action-item">
              <Button
                loading={loading && dateConfig[1] === 'weeks'}
                className={clsx(dateConfig[1] === 'weeks' ? 'active' : null)}
                onClick={(evt) => onChangeBar(evt, [2, 'weeks'])}
              >
                Статистика за 2 недели
              </Button>
            </li>
            <li className="toolbar-action-item">
              <Button
                loading={loading && dateConfig[1] === 'month'}
                className={clsx(dateConfig[1] === 'month' ? 'active' : null)}
                onClick={(evt) => onChangeBar(evt, [1, 'month'])}
              >
                Статистика за 1 месяц
              </Button>
            </li>
            <li className="toolbar-action-item">
              <Button
                loading={loading && dateConfig[1] === 'year'}
                className={clsx(dateConfig[1] === 'year' ? 'active' : null)}
                onClick={(evt) => onChangeBar(evt, [1, 'year'])}
              >
                Статистика за 1 год
              </Button>
            </li>
            <li className="toolbar-action-item">
              <Button
                loading={loading && dateConfig[0] === 'full'}
                className={clsx(dateConfig[0] === 'full' ? 'active' : null)}
                onClick={(evt) => onChangeBar(evt, ['full'])}
              >
                Статистика за все время
              </Button>
            </li>
          </ul>
        </div>
      </div>
    ),
    [dateConfig, loading, onChangeBar],
  );

  return (
    <div className="statisticsModule">
      <TitleModule classNameTitle="statisticsModuleTitle" title="Статистика" />
      <div className="statisticsModule__main">
        <div className="col-6">
          {
            <Bar
              data={barData}
              textContent={textContent}
              loading={loading || shouldUpdate}
              subDataList={Object.keys(barData)}
            />
          }
        </div>
      </div>
      <FixedToolbar name="Настройки" customRender={toolbarBody} />
    </div>
  );
});

StatisticsModule.defaultProps = {
  path: '',
  clientDB: null,
};

StatisticsModule.propTypes = statisticsModuleType;

export default withClientDb(StatisticsModule);
