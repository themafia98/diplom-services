import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import data from './data.json';
import { loadCurrentData } from '../../../Redux/actions/routerActions/middleware';
import Bar from './Charts/Bar';
import TitleModule from '../../TitleModule';

import modelContext from '../../../Models/context';

class StatisticsModule extends React.PureComponent {
  static propTypes = {
    onErrorRequstAction: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
  };

  static contextType = modelContext;

  componentDidMount = () => {
    const {
      router: { routeData = {} },
      onLoadCurrentData,
      visible,
    } = this.props;
    const { config: { statist: { limitListTasks = 5000 } = {} } = {} } = this.context;

    if (visible) {
      onLoadCurrentData({
        path: 'taskModule',
        storeLoad: 'tasks',
        useStore: true,
        methodRequst: 'POST',
        options: {
          limitList: limitListTasks,
        },
      });
    }
  };

  componentDidUpdate = () => {
    const {
      onLoadCurrentData,
      visible,
      router: { shouldUpdate = false, routeData = {} },
    } = this.props;

    if (shouldUpdate && visible && routeData['taskModule']?.load) {
      onLoadCurrentData({
        path: 'taskModule',
        storeLoad: 'tasks',
        useStore: true,
        methodRequst: 'GET',
      });
    }
  };

  render() {
    const {
      router: { isPartData = false, routeData: { taskModule: { tasks = [] } = {} } = {} } = {},
    } = this.props;

    return (
      <div className="statisticsModule">
        <TitleModule classNameTitle="statisticsModuleTitle" title="Статистика" />
        <div className="statisticsModule__main">
          <div className="col-6">
            <Bar isPartData={isPartData} data={tasks} dateList={data.date} />
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  return { router: state.router };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadCurrentData: props => dispatch(loadCurrentData({ ...props })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StatisticsModule);
