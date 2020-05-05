// @ts-nocheck
import React from 'react';
import _ from 'lodash';
import clsx from 'clsx';
import { statisticsModuleType } from './types';
import moment from 'moment';
import { connect } from 'react-redux';
import { loadCurrentData } from '../../Redux/actions/routerActions/middleware';
import Bar from './Charts/Bar';
import TitleModule from '../../Components/TitleModule';

import modelContext from '../../Models/context';
import FixedToolbar from '../../Components/FixedToolbar';
import { Button } from 'antd';

class StatisticsModule extends React.PureComponent {
  state = {
    dateConfig: [2, 'weeks'],
    statsListFields: ['Открыт', 'Выполнен', 'Закрыт', 'В работе'],
    textContent: ''
  };
  static propTypes = statisticsModuleType;
  static contextType = modelContext;

  componentDidMount = () => {
    const {visible } = this.props;
    const { dateConfig = [] } = this.state;

    if (visible && _.isArray(dateConfig)) {
      this.fetchStatistics();
    }

  };

  componentDidUpdate = () => {
    const {
      visible,
      path,
      router: { routeData = {} },
    } = this.props;
    if (!path || (path && !path.includes('statistic'))) return;
    const { dateConfig = [] } = this.state;
    const { [path]: currentModule = null } = routeData || {};
    const shouldReload = currentModule && !currentModule?.loading && visible && !currentModule?.load;

    if (_.isArray(dateConfig) && shouldReload) this.fetchStatistics();
  };

  fetchStatistics = (shouldSetLoading = false) => {
    const {
      onLoadCurrentData,
      path,
    } = this.props;
    const { statsListFields = [], dateConfig = [] } = this.state;
    const { config: { statistics: { limitListTasks = 5000 } = {} } = {} } = this.context;

    let limits = {};
    if (dateConfig[0] === 'full'){
      limits = {
        limitList: limitListTasks
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
          ...limits
        },
        queryType: dateConfig[0],
        todayISO: dateConfig[0] === 'full'
          ? moment().toISOString()
          : moment().subtract(...dateConfig).toISOString(),
      },
    });
  }

  onChangeBar = ({ currentTarget: { textContent = '' } }, dateConfig = []) => {
    this.setState({
      dateConfig,
      textContent
    }, () => {
      this.fetchStatistics(true);
    })
  };

  getToolbarBody = (loading = false) => {
    const { dateConfig = [] } = this.state;

    return (
      <div className='toolbarBody'>
        <div className='controllers'>
          <p>Смена периода</p>
          <ul className='toolbar-actions-list'>
            <li className='toolbar-action-item'>
              <Button
                loading={loading && dateConfig[1] === 'day'}
                className={clsx(dateConfig[1] === 'day' ? 'active' : null)}
                onClick={(evt) => this.onChangeBar(evt, [1, 'day'])}
              >
                Статистика за день
              </Button>
            </li>
            <li className='toolbar-action-item'>
              <Button
                loading={loading && dateConfig[1] === 'weeks'}
                className={clsx(dateConfig[1] === 'weeks' ? 'active' : null)}
                onClick={(evt) => this.onChangeBar(evt, [2, 'weeks'])}
              >
                Статистика за 2 недели
              </Button>
            </li>
            <li className='toolbar-action-item'>
              <Button
                loading={loading && dateConfig[1] === 'month'}
                className={clsx(dateConfig[1] === 'month' ? 'active' : null)}
                onClick={(evt) => this.onChangeBar(evt, [1, 'month'])}
              >
                Статистика за 1 месяц
              </Button>
            </li>
            <li className='toolbar-action-item'>
              <Button
                loading={loading && dateConfig[1] === 'year'}
                className={clsx(dateConfig[1] === 'year' ? 'active' : null)}
                onClick={(evt) => this.onChangeBar(evt, [1, 'year'])}
              >
                Статистика за 1 год
              </Button>
            </li>
            <li className='toolbar-action-item'>
              <Button
                loading={loading && dateConfig[0] === 'full'}
                className={clsx(dateConfig[0] === 'full' ? 'active' : null)}
                onClick={(evt) => this.onChangeBar(evt, ['full'])}>
                Статистика за все время
              </Button>
            </li>
          </ul>
        </div>
      </div>
    )
  }

  render() {
    const { textContent = '' } = this.state;
    const {
      path = '',
      router: {
        routeData: {
          [path]: currentModule = {}
        } = {},
        shouldUpdate = false
      } = {}
    } = this.props;
    const { statistic = [], loading = false } = currentModule || {};
    const { bar: barData = {} } = statistic[0] || {};
    const toolbarBody = this.getToolbarBody(loading);

    return (
      <div className="statisticsModule">
        <TitleModule classNameTitle="statisticsModuleTitle" title="Статистика" />
        <div className="statisticsModule__main">
          <div className="col-6">{(
            <Bar
              data={barData}
              textContent={textContent}
              loading={loading || shouldUpdate}
              subDataList={Object.keys(barData)}
            />)}
          </div>
        </div>
        <FixedToolbar name = 'Настройки' customRender={toolbarBody} />
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  const { router } = state;
  return { router };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadCurrentData: (props) => dispatch(loadCurrentData({ ...props })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StatisticsModule);
