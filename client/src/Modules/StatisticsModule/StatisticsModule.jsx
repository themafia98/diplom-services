import React from 'react';
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

class StatisticsModule extends React.PureComponent {
  state = {
    dateConfig: [2, 'weeks'],
    textContent: '',
  };
  static propTypes = statisticsModuleType;

  componentDidMount = () => {
    const { moduleContext } = this.props;
    const { visibility = false } = moduleContext;
    const { dateConfig = [] } = this.state;

    if (visibility && Array.isArray(dateConfig)) {
      this.fetchStatistics();
    }
  };

  componentDidUpdate = () => {
    const {
      path,
      router: { routeData = {} },
      moduleContext,
    } = this.props;
    const { visibility = false } = moduleContext;

    if (!path || (path && !path.includes('statistic'))) return;
    const { dateConfig = [] } = this.state;
    const { [path]: currentModule = null } = routeData || {};
    const shouldReload = currentModule && !currentModule?.loading && visibility && !currentModule?.load;

    if (Array.isArray(dateConfig) && shouldReload) this.fetchStatistics();
  };

  fetchStatistics = (shouldSetLoading = false) => {
    const { onLoadCurrentData, path, statusList: { settings = [] } = {}, modelsContext } = this.props;
    const statsListFields = settings.reduce((list, { value = '' }) => {
      if (value) return [...list, value];
      return list;
    }, []);
    const { dateConfig = [] } = this.state;
    const { config: { statistics: { limitListTasks = 5000 } = {} } = {} } = modelsContext;

    let limits = {};
    if (dateConfig[0] === 'full') {
      limits = {
        limitList: limitListTasks,
      };
    }

    onLoadCurrentData({
      path,
      storeLoad: 'statistic',
      xhrPath: 'taskBar',
      methodQuery: 'get_stats',
      noCorsClient: true,
      useStore: true,
      shouldSetLoading,
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
    });
  };

  onChangeBar = ({ currentTarget: { textContent = '' } }, dateConfig = []) => {
    this.setState(
      {
        dateConfig,
        textContent,
      },
      () => {
        this.fetchStatistics(true);
      },
    );
  };

  getToolbarBody = (loading = false) => {
    const { dateConfig = [] } = this.state;

    return (
      <div className="toolbarBody">
        <div className="controllers">
          <p>Смена периода</p>
          <ul className="toolbar-actions-list">
            <li className="toolbar-action-item">
              <Button
                loading={loading && dateConfig[1] === 'day'}
                className={clsx(dateConfig[1] === 'day' ? 'active' : null)}
                onClick={(evt) => this.onChangeBar(evt, [1, 'day'])}
              >
                Статистика за день
              </Button>
            </li>
            <li className="toolbar-action-item">
              <Button
                loading={loading && dateConfig[1] === 'weeks'}
                className={clsx(dateConfig[1] === 'weeks' ? 'active' : null)}
                onClick={(evt) => this.onChangeBar(evt, [2, 'weeks'])}
              >
                Статистика за 2 недели
              </Button>
            </li>
            <li className="toolbar-action-item">
              <Button
                loading={loading && dateConfig[1] === 'month'}
                className={clsx(dateConfig[1] === 'month' ? 'active' : null)}
                onClick={(evt) => this.onChangeBar(evt, [1, 'month'])}
              >
                Статистика за 1 месяц
              </Button>
            </li>
            <li className="toolbar-action-item">
              <Button
                loading={loading && dateConfig[1] === 'year'}
                className={clsx(dateConfig[1] === 'year' ? 'active' : null)}
                onClick={(evt) => this.onChangeBar(evt, [1, 'year'])}
              >
                Статистика за 1 год
              </Button>
            </li>
            <li className="toolbar-action-item">
              <Button
                loading={loading && dateConfig[0] === 'full'}
                className={clsx(dateConfig[0] === 'full' ? 'active' : null)}
                onClick={(evt) => this.onChangeBar(evt, ['full'])}
              >
                Статистика за все время
              </Button>
            </li>
          </ul>
        </div>
      </div>
    );
  };

  render() {
    const { textContent = '' } = this.state;
    const {
      path = '',
      router: { routeData: { [path]: currentModule = {} } = {}, shouldUpdate = false } = {},
    } = this.props;
    const { statistic = [], loading = false } = currentModule || {};
    const { bar: barData = {} } = statistic[0] || {};
    const toolbarBody = this.getToolbarBody(loading);

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
  }
}

const mapStateToProps = (state, props) => {
  const { router } = state;
  return { router, statusList: settingsStatusSelector(state, props) };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadCurrentData: (props) => dispatch(loadCurrentData(props)),
  };
};

export default compose(moduleContextToProps, connect(mapStateToProps, mapDispatchToProps))(StatisticsModule);
