import React, { useEffect, useCallback, useState } from 'react';
import { tableViewType } from './TableView.types';
import { useSelector } from 'react-redux';
import { Empty, Spin, Tooltip, Icon } from 'antd';
import Scrollbars from 'react-custom-scrollbars';

import { routePathNormalise, routeParser } from 'Utils/utils.global';
import Output from 'Components/Output';
import DynamicTable from './DynamicTable';

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
}) => {
  const [isScroll, setIsScroll] = useState(null);

  const { router, udata, requestError } = useSelector((state) => {
    const { udata = {}, requestError } = state.publicReducer;
    return {
      router: state.router,
      requestError,
      udata,
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

  const getRowsTable = useCallback(
    (arrayData) => {
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
              udata={udata}
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
    },
    [router, udata],
  );

  const getComponentByPath = useCallback(
    (path) => {
      const { routeData, currentActionTab = '' } = router;
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
        const countPagination = counter ? counter : statusApp === 'offline' && !counter ? 0 : counter;
        return (
          <DynamicTable
            key={currentActionTab}
            routePathNormalise={routePathNormalise}
            routeParser={routeParser}
            dataSource={tasks}
            router={router}
            udata={udata}
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
      filterBy,
      getRowsTable,
      height,
      loading,
      requestError,
      router,
      statusApp,
      tableViewHeight,
      udata,
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
  filterBy: '',
  user: {},
  height: 300,
  loading: false,
  counter: null,
  tableViewHeight: window?.innerHeight / 2 - 70,
};

export default TableView;
