import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import data from './data.json';
import { loadCurrentData } from '../../../Redux/actions/routerActions/middleware';
import Bar from './Charts/Bar';
import TitleModule from '../../TitleModule';

class StatisticsModule extends React.PureComponent {
  static propTypes = {
    onErrorRequstAction: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
  };

  componentDidMount = () => {
    const { onLoadCurrentData, visible } = this.props;
    if (visible) {
      onLoadCurrentData({
        path: 'taskModule',
        storeLoad: 'tasks',
        useStore: true,
        methodRequst: 'POST',
        options: {
          limitList: 20,
        },
      });
    }
  };

  componentDidUpdate = () => {
    const {
      onLoadCurrentData,
      visible,
      router: { shouldUpdate = false },
    } = this.props;
    if (shouldUpdate && visible)
      onLoadCurrentData({
        path: 'taskModule',
        storeLoad: 'tasks',
        useStore: true,
        methodRequst: 'GET',
      });
  };

  render() {
    const { router: { routeData: { taskModule: { tasks = [] } = {} } = {} } = {} } = this.props;

    return (
      <div className="statisticsModule">
        <TitleModule classNameTitle="statisticsModuleTitle" title="Статистика" />
        <div className="statisticsModule__main">
          <div className="col-6">
            <Bar data={tasks} dateList={data.date} />
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
