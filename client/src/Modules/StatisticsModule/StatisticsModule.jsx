// @ts-nocheck
import React from 'react';
import { statisticsModuleType } from './types';
import { connect } from 'react-redux';
import data from './data.json';
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
      router: { shouldUpdate = false, routeData = {} },
    } = this.props;
    const { statsListFields = [] } = this.state;

    if (shouldUpdate && visible && routeData[path]?.load) {
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

    return (
      <div className="statisticsModule">
        <TitleModule classNameTitle="statisticsModuleTitle" title="Статистика" />
        <div className="statisticsModule__main">
          <div className="col-6">
            {JSON.stringify(statistic)}
            {/* <Bar isPartData={isPartData} data={tasks} dateList={data.date} /> */}
          </div>
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
