import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Icon, Empty, Spin } from 'antd';

import Loader from '../Loader';
import Scrollbars from 'react-custom-scrollbars';

import { routePathNormalise, routeParser } from '../../Utils';
import Output from '../Output';
import DynamicTable from './DynamicTable';

import { openPageWithDataAction } from '../../Redux/actions/routerActions';
import { loadCurrentData } from '../../Redux/actions/routerActions/middleware';
import modelContext from '../../Models/context';

class TableView extends React.Component {
  state = {
    sortedInfo: null,
    searchText: null,
    isScroll: null,
  };

  static contextType = modelContext;

  static propTypes = {
    setCurrentTab: PropTypes.func,
    height: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    tasks: PropTypes.array,
    path: PropTypes.string,
    data: PropTypes.object,
    flag: PropTypes.bool,
    user: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    router: PropTypes.object.isRequired,
    publicReducer: PropTypes.object.isRequired,
  };

  componentDidUpdate = prevProps => {
    const { path, onLoadCurrentData } = this.props;
    const { path: validPath = '', page = '', itemId = '' } = routeParser({
      pageType: 'moduleItem',
      path,
    });

    if (prevProps.visible !== this.props.visible && page === 'mainModule' && itemId === 'table') {
      if (this.props.visible)
        onLoadCurrentData({
          path: validPath ? validPath : '',
          xhrPath: 'userList',
          startPath: 'system',
          storeLoad: 'users',
          methodRequst: 'GET',
        });
    }
  };

  componentDidMount = () => {
    const { path, onLoadCurrentData, visible } = this.props;
    const parsePath = routeParser({ pageType: 'moduleItem', path });

    if (visible && parsePath && parsePath.page === 'mainModule' && parsePath.itemId === 'table') {
      const { path: validPath = '' } = parsePath;
      onLoadCurrentData({
        path: validPath ? validPath : '',
        startPath: 'system',
        xhrPath: 'userList',
        storeLoad: 'users',
        methodRequst: 'GET',
      });
    }
    window.addEventListener('resize', this.setSizeWindow);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.setSizeWindow);
  };

  setSizeWindow = event => {
    if (window.innerWidth <= 1450 && _.isNull(this.state.isScroll)) this.setState({ isScroll: true });
    else if (this.state.isScroll && window.innerWidth > 1200) this.setState({ isScroll: null });
  };

  /**
   * @param {string} path
   */
  getComponentByPath = path => {
    const {
      user,
      flag,
      router,
      publicReducer: { requestError },
      height: heightProps,
      visible,
      onOpenPageWithData,
      setCurrentTab,
      udata = {},
      loaderMethods = {},
    } = this.props;

    const { routeData } = router;
    const routePathData = router.currentActionTab.split('_')[0];
    const currentData = routeData[routePathData];
    const tasks = currentData ? currentData.tasks : null;

    const height = heightProps - 250;

    if (path === 'mainModule__table' && visible) {
      const isUsers = currentData && currentData.users;
      const isLoad = currentData && currentData.load;
      // const isOffline = currentData && currentData.mode && currentData.mode === "offlineLoading";

      return (
        <Scrollbars>
          <table key="mainModule__table">
            <thead>
              <tr>
                <td>Статус</td>
                <td>Сотрудник</td>
                <td>Отдел</td>
                <td>Должность</td>
                <td></td>
              </tr>
            </thead>
            <tbody>
              {isUsers ? (
                this.getRowsTable(currentData.users)
              ) : isLoad || requestError ? (
                <tr>
                  <td colSpan="5">
                    <Empty description={<span>Данных нету</span>} className="emptyTable" />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan="5">
                    <Spin size="large" />
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot></tfoot>
          </table>
        </Scrollbars>
      );
    } else if (path === 'searchTable') {
      return (
        <DynamicTable
          key="dynamicTable"
          routePathNormalise={routePathNormalise}
          routeParser={routeParser}
          tasks={tasks}
          onOpenPageWithData={onOpenPageWithData}
          router={router}
          setCurrentTab={setCurrentTab}
          udata={udata}
          flag={flag}
          user={user}
          visible={visible}
          loaderMethods={loaderMethods}
          height={height}
        />
      );
    }

    return null;
  };

  getRowsTable = arrayData => {
    return arrayData.map((it, id) => {
      return (
        <tr className="contentTr" key={`${id}contentTr`}>
          <Output key={`${id}${it.status}status`} type="table" className="status">
            {it.status || 'Скрыт'}
          </Output>
          <Output key={`${id}${it.displayName}}nameSurname`} type="table" className="nameSurname">
            {`${it.displayName}`}
          </Output>
          <Output key={`${id}${it.departament}departament`} type="table" className="departament">
            {it.departament}
          </Output>
          <Output key={`${id}departament`} type="table" className="departament">
            {it.position}
          </Output>
          {it.email ? (
            <td>
              <Icon type="mail" />
            </td>
          ) : null}
        </tr>
      );
    });
  };

  render() {
    const { path } = this.props;
    const component = this.getComponentByPath(path);
    return component;
  }
}

const mapStateToProps = state => {
  return {
    router: state.router,
    publicReducer: state.publicReducer,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onOpenPageWithData: data => dispatch(openPageWithDataAction(data)),
    onLoadCurrentData: props => dispatch(loadCurrentData({ ...props })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableView);
