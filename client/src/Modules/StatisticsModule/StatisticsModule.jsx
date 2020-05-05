// @ts-nocheck
import React from 'react';
import { statisticsModuleType } from './types';
import { connect } from 'react-redux';
import { loadCurrentData } from '../../Redux/actions/routerActions/middleware';
import Bar from './Charts/Bar';
import TitleModule from '../../Components/TitleModule';

import modelContext from '../../Models/context';

class StatisticsModule extends React.PureComponent {
  state = {
    statsListFields: ['Открыт', 'Выполнен', 'Закрыт', 'В работе'],
  };
  static propTypes = statisticsModuleType;

  static contextType = modelContext;

  componentDidMount = () => {
    const { onLoadCurrentData, visible, path = '' } = this.props;
    const { statsListFields = [] } = this.state;
    // const { config: { statist: { limitListTasks = 5000 } = {} } = {} } = this.context;

    if (visible) {
      /** TODO: remove hard-code status */
      onLoadCurrentData({
        path,
        storeLoad: 'statistic',
        xhrPath: 'taskBar',
        methodQuery: 'get_stats',
        noCorsClient: true,
        useStore: true,
        options: {
          queryParams: {
            statsListFields,
          },
        },
      });
    }
  };

  componentDidUpdate = () => {
    const {
      onLoadCurrentData,
      visible,
      path,
      router: { routeData = {} },
    } = this.props;
    if (!path || (path && !path.includes('statistic'))) return;

    const { statsListFields = [] } = this.state;
    const { [path]: currentModule = null } = routeData || {};

    if (currentModule && !currentModule?.loading && visible && !currentModule?.load) {
      onLoadCurrentData({
        path,
        storeLoad: 'statistic',
        xhrPath: 'taskBar',
        methodQuery: 'get_stats',
        noCorsClient: true,
        useStore: true,
        options: {
          queryParams: {
            statsListFields,
          },
        },
      });
    }
  };

  render() {
    const { path = '' } = this.props;
    const { router: { routeData: { [path]: currentModule = {} } = {} } = {} } = this.props;

    const { statistic = [] } = currentModule || {};
    const { bar: barData = {} } = statistic[0] || {};

    return (
      <div className="statisticsModule">
        <TitleModule classNameTitle="statisticsModuleTitle" title="Статистика" />
        <div className="statisticsModule__main">
          <div className="col-6">{<Bar data={barData} subDataList={Object.keys(barData)} />}</div>
        </div>
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
