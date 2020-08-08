import React, { memo, useCallback, useEffect, useState, useMemo } from 'react';
import clsx from 'clsx';
import { statisticsModuleType } from './types';
import moment from 'moment';
import { connect } from 'react-redux';
import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import Bar from './Charts/Bar';
import TitleModule from 'Components/TitleModule';
import { settingsStatusSelector } from 'Utils/selectors';
import FixedToolbar from 'Components/FixedToolbar';
import { Button } from 'antd';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { withClientDb } from 'Models/ClientSideDatabase';
import actionPath from 'actions.path';

const StatisticsModule = memo(
  ({ moduleContext, router, path, onLoadCurrentData, statusList, appConfig, clientDB }) => {
    const { settings = [] } = statusList || {};
    const { routeData = {}, shouldUpdate = false } = router || {};
    const { [path]: currentModule = {} } = routeData;

    const { statistic = [], loading = false } = currentModule || {};
    const { bar: barData = {} } = statistic[0] || {};

    const [dateConfig, setDateConfig] = useState([2, 'weeks']);
    const [textContent, setTextContent] = useState('');

    const fetchStatistics = useCallback(
      (shouldSetLoading = false) => {
        const statsListFields = settings.reduce((list, { value = '' }) => {
          if (value) return [...list, value];
          return list;
        }, []);

        const { statistics: { limitListTasks = 5000 } = {} } = appConfig;

        let limits = {};

        if (dateConfig[0] === 'full') {
          limits = {
            limitList: limitListTasks,
          };
        }

        onLoadCurrentData({
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
        });
      },
      [appConfig, clientDB, dateConfig, onLoadCurrentData, path, settings],
    );

    useEffect(() => {
      const { visibility = false } = moduleContext;

      if (!path || (path && !path.includes('statistic'))) return;
      const shouldReload = currentModule && !currentModule?.loading && visibility && !currentModule?.load;

      if (!Array.isArray(dateConfig) || !shouldReload) return;

      fetchStatistics();
    }, [currentModule, dateConfig, fetchStatistics, moduleContext, path]);

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
  },
);

StatisticsModule.defaultProps = {
  moduleContext: {},
  router: {},
  path: '',
  onLoadCurrentData: null,
  statusList: [],
  appConfig: [],
  clientDB: null,
};

StatisticsModule.propTypes = statisticsModuleType;

const mapStateToProps = (state, props) => {
  const {
    router,
    publicReducer: { appConfig },
  } = state;
  return { router, statusList: settingsStatusSelector(state, props), appConfig };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadCurrentData: (props) => dispatch(loadCurrentData(props)),
  };
};

export default compose(
  moduleContextToProps,
  withClientDb,
  connect(mapStateToProps, mapDispatchToProps),
)(StatisticsModule);
