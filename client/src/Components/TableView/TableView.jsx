// @ts-nocheck
import React from 'react';
import { tableViewType } from './types';
import { connect } from 'react-redux';
import _ from 'lodash';
import { Empty, Spin, Tooltip, Icon } from 'antd';
import Scrollbars from 'react-custom-scrollbars';

import { routePathNormalise, routeParser } from '../../Utils';
import Output from '../Output';
import DynamicTable from './DynamicTable';

import {
  openPageWithDataAction,
  removeTabAction,
  addToRouteDataAction,
} from '../../Redux/actions/routerActions';
import { loadCurrentData } from '../../Redux/actions/routerActions/middleware';
import modelContext from '../../Models/context';

class TableView extends React.Component {
  state = {
    sortedInfo: null,
    searchText: null,
    isScroll: null,
  };

  static contextType = modelContext;
  static propTypes = tableViewType;
  static defaultProps = {
    tasks: [],
    filterBy: '',
    visible: false,
  };

  componentDidUpdate = (prevProps) => {
    const { path, onLoadCurrentData, visible = false } = this.props;
    const { path: validPath = '', page = '', itemId = '' } = routeParser({
      pageType: 'moduleItem',
      path,
    });

    if (prevProps.visible !== visible && page === 'mainModule' && itemId === 'table') {
      if (visible)
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

  setSizeWindow = (event) => {
    if (window.innerWidth <= 1450 && _.isNull(this.state.isScroll)) this.setState({ isScroll: true });
    else if (this.state.isScroll && window.innerWidth > 1200) this.setState({ isScroll: null });
  };

  /**
   * @param {string} path
   */
  getComponentByPath = (path) => {
    const {
      user,
      filterBy = '',
      router,
      publicReducer: { requestError },
      udata = {},
      height: heightProps,
      visible,
      onOpenPageWithData,
      setCurrentTab,
      loaderMethods = {},
      loading,
      counter = null,
      tableViewHeight = window?.innerHeight / 2 - 70,
      onAddRouteData,
      statusApp,
    } = this.props;

    const { routeData, currentActionTab = '' } = router;
    let currentData = routeData[currentActionTab];

    const height = heightProps - 250;

    if (path === 'mainModule__table' && visible) {
      currentData = path && routeData[path] ? routeData[path] : currentData;
      const isUsers = currentData && currentData.users;
      const isLoad = currentData && currentData.load;
      const scrollStyle = { height: `${tableViewHeight}px` };
      return (
        <Scrollbars hideTracksWhenNotNeeded={true} style={scrollStyle}>
          <table key="mainModule__table">
            <thead className="header-table">
              <tr>
                <td className="status">Статус</td>
                <td className="employee">Сотрудник</td>
                <td className="department">Отдел</td>
                <td className="position">Должность</td>
                <td />
              </tr>
            </thead>
            <tbody className="table-body">
              {isUsers ? (
                this.getRowsTable(currentData.users)
              ) : isLoad || requestError ? (
                <tr>
                  <td colSpan={5}>
                    <Empty description={<span>Данных нету</span>} className="emptyTable" />
                  </td>
                </tr>
              ) : (
                <tr>
                  <td colSpan={5}>
                    <Spin size="large" />
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot />
          </table>
        </Scrollbars>
      );
    } else if (path === 'searchTable') {
      const { tasks = [] } = currentData || {};
      const countPagination = counter ? counter : statusApp === 'offline' && !counter ? 0 : counter;
      return (
        <DynamicTable
          key={currentActionTab}
          routePathNormalise={routePathNormalise}
          routeParser={routeParser}
          dataSource={tasks}
          onOpenPageWithData={onOpenPageWithData}
          router={router}
          setCurrentTab={setCurrentTab}
          udata={udata}
          counter={countPagination}
          filterBy={filterBy}
          user={user}
          visible={visible}
          loading={loading}
          loaderMethods={loaderMethods}
          onAddRouteData={onAddRouteData}
          height={height}
        />
      );
    }

    return null;
  };

  onMail = (email) => {
    if (!email || !_.isString(email)) return;
    const a = document.createElement('a');
    a.href = `mailto:${email}`;
    a.click();
    a.remove();
  };

  getRowsTable = (arrayData) => {
    const { router, removeTab, onOpenPageWithData, setCurrentTab, udata = {} } = this.props;
    return arrayData.map((it, id) => {
      return (
        <tr className="content-row-table" key={`${id}content-row-table`}>
          <Output key={`${id}${it.status}status`} type="table" className="status">
            {it.status || 'Скрыт'}
          </Output>
          <Output
            id={it?._id}
            action={'cabinet'}
            typeOutput="link"
            router={router}
            removeTab={removeTab}
            currentData={it}
            udata={udata}
            onOpenPageWithData={onOpenPageWithData}
            setCurrentTab={setCurrentTab}
            key={`${id}${it.displayName}}nameSurname`}
            type="table"
            className="nameSurname"
          >
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
              <Tooltip title={it.email}>
                {!it?.isHideEmail ? <Icon onClick={this.onMail.bind(this, it.email)} type="mail" /> : null}
              </Tooltip>
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

const mapStateToProps = (state) => {
  const { udata = {} } = state.publicReducer;
  return {
    router: state.router,
    publicReducer: state.publicReducer,
    udata,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    removeTab: (tab) => dispatch(removeTabAction(tab)),
    onOpenPageWithData: (data) => dispatch(openPageWithDataAction(data)),
    onAddRouteData: (data) => dispatch(addToRouteDataAction(data)),
    onLoadCurrentData: (props) => dispatch(loadCurrentData({ ...props })),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TableView);
