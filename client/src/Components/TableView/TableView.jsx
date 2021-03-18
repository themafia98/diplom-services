import React, { useEffect, useCallback, useState } from 'react';
import { tableViewType } from './TableView.types';
import { useSelector } from 'react-redux';
import { Empty, Spin, Tooltip, Icon } from 'antd';
import Scrollbars from 'react-custom-scrollbars';

import { routePathNormalise, routeParser } from 'Utils';
import Output from 'Components/Output';
import Table from './Table';
import { APP_STATUS } from 'App.constant';

const TableView = ({
  user,
  filterBy,
  height,
  visible,
  loading,
  counter,
  tableViewHeight,
  statusApp,
  path,
  type,
}) => {
  const [isScroll, setIsScroll] = useState(null);

  const { routeData, currentActionTab, requestError } = useSelector(({ router, publicReducer }) => {
    const { requestError } = publicReducer;
    const { routeData, currentActionTab } = router;
    return {
      routeData,
      currentActionTab,
      requestError,
    };
  });

  const setSizeWindow = useCallback(
    (event) => {
      if (window.innerWidth <= 1450 && isScroll === null) setIsScroll(true);
      else if (isScroll && window.innerWidth > 1200) setIsScroll(null);
    },
    [isScroll],
  );

  useEffect(() => {
    window.addEventListener('resize', setSizeWindow);
    return () => window.removeEventListener('resize', setSizeWindow);
  }, [setSizeWindow]);

  const getRowsTable = useCallback((arrayData) => {
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
                {!it?.isHideEmail ? <Icon onClick={onMail.bind(this, it.email)} type="mail" /> : null}
              </Tooltip>
            </td>
          ) : null}
        </tr>
      );
    });
  }, []);

  const getComponentByPath = useCallback(
    (path) => {
      let currentData = routeData[currentActionTab];

      if (path === 'mainModule__global' && visible) {
        currentData = path && routeData[path] ? routeData[path] : currentData;
        const isUsers = currentData && currentData.users;
        const isLoad = currentData && currentData.load;
        const scrollStyle = { height: `${tableViewHeight}px` };
        return (
          <Scrollbars autoHide hideTracksWhenNotNeeded style={scrollStyle}>
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
                  getRowsTable(currentData.users)
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
        const countPagination = counter ? counter : statusApp === APP_STATUS.OFF && !counter ? 0 : counter;
        return (
          <Table
            type={type}
            key={currentActionTab}
            routePathNormalise={routePathNormalise}
            routeParser={routeParser}
            dataSource={tasks}
            counter={countPagination}
            filterBy={filterBy}
            user={user}
            visible={visible}
            loading={loading}
            height={height}
          />
        );
      }

      return null;
    },
    [
      counter,
      currentActionTab,
      filterBy,
      getRowsTable,
      height,
      loading,
      requestError,
      routeData,
      statusApp,
      tableViewHeight,
      type,
      user,
      visible,
    ],
  );

  const onMail = (email) => {
    if (!email || typeof email !== 'string') return;
    const a = document.createElement('a');
    a.href = `mailto:${email}`;
    a.click();
    a.remove();
  };

  const component = getComponentByPath(path);
  return component;
};

TableView.propTypes = tableViewType;
TableView.defaultProps = {
  type: '',
  filterBy: '',
  user: {},
  height: 300,
  loading: false,
  counter: null,
  tableViewHeight: window?.innerHeight / 2 - 70,
};

export default TableView;
