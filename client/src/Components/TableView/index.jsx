import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import moment from 'moment';
import _ from 'lodash';
import { Icon, Empty, Input, Button } from 'antd';

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
   * @param {any} pagination
   * @param {any} filters
   * @param {any} sorter
   */
  handleFilter = (pagination, filters, sorter) => {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter,
    });
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

    const { filteredInfo = [], sortedInfo = [] } = this.state;

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
                    <Loader classNameSpiner="tableLoader" className="wrapperLoaderTable" />
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot></tfoot>
          </table>
        </Scrollbars>
      );
    } else if (path === 'searchTable') {
      const columns = this.getConfigColumns();

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
          filteredInfo={filteredInfo}
          sortedInfo={sortedInfo}
          handleFilter={this.handleFilter}
          height={height}
          columns={columns}
        />
      );
    }

    return null;
  };

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({ searchText: selectedKeys[0], searchedColumn: dataIndex });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({ searchText: '' });
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

  getConfigColumns = () => {
    const { sortedInfo } = this.state;
    return [
      {
        title: 'Статус',
        className: 'status',
        dataIndex: 'status',
        sorter: (a, b) => a.status.length - b.status.length,
        sortOrder: sortedInfo && sortedInfo.columnKey === 'status' && sortedInfo.order,
        key: 'status',
        render: (text, row, index) => {
          let className = '';
          if (text === 'В работе') className = 'active';
          else if (text === 'Открыт') className = '';
          else if (text === 'Закрыт') className = 'close';
          else if (text === 'Выполнен') className = 'done';
          else className = '';

          return (
            <Output className={className} key={`${text}${row}${index}status`}>
              {text}
            </Output>
          );
        },
        ...this.getColumn('status'),
      },
      {
        title: 'Наименование',
        className: 'name',
        dataIndex: 'name',
        key: 'name',
        render: (text, row, index) => {
          return <Output key={`${text}${row}${index}name`}>{text}</Output>;
        },
        onFilter: (value, record) => record.name.includes(value),
        sorter: (a, b) => a.name.length - b.name.length,
        sortOrder: sortedInfo && sortedInfo.columnKey === 'name' && sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
        ...this.getColumn('name'),
      },
      {
        title: 'Приоритет',
        className: 'priority',
        dataIndex: 'priority',
        key: 'priority',
        onFilter: (value, record) => record.priority.includes(value),
        render: (text, row, index) => {
          return <Output key={`${text}${row}${index}priority`}>{text}</Output>;
        },
        sorter: (a, b) => a.priority.length - b.priority.length,
        sortOrder: sortedInfo && sortedInfo.columnKey === 'priority' && sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
        ...this.getColumn('priority'),
      },
      {
        title: 'Автор',
        className: 'author',
        dataIndex: 'author',
        key: 'author',
        onFilter: (value, record) => {
          return record.author.includes(value);
        },
        sorter: (a, b) => a.author.length - b.author.length,
        sortOrder: sortedInfo && sortedInfo.columnKey === 'author' && sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
        render: (text, row, index) => {
          return <Output key={`${text}${row}${index}author`}>{text}</Output>;
        },
        ...this.getColumn('author'),
      },
      {
        title: 'Исполнитель',
        className: 'editor',
        dataIndex: 'editor',
        key: 'editor',
        onFilter: (value, record) => {
          return record.editor.includes(value);
        },
        sorter: (a, b) => (a.editor && b.editor ? a.editor[0] - b.editor[0] : null),
        sortOrder: sortedInfo && sortedInfo.columnKey === 'editor' && sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
        render: (text, row, index) => {
          return <Output key={`${text}${row}${index}editor`}>{text}</Output>;
        },
        ...this.getColumn('editor'),
      },
      {
        title: 'Сроки',
        className: 'date',
        dataIndex: 'date',
        key: 'date',
        onFilter: (value, record) => record.date.includes(value),
        sorter: (a, b) => {
          if (a.date && b.date) {
            const sortA = moment(a.date[0], 'DD:MM:YYYY');
            const sortB = moment(b.date[0], 'DD:MM:YYYY');
            return sortA - sortB;
          }
        },
        sortOrder: sortedInfo && sortedInfo.columnKey === 'date' && sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
        render: (text, row, index) => {
          return <Output key={`${text}${row}${index}date`}> {text}</Output>;
        },
        ...this.getColumn('date'),
      },
    ];
  };

  getColumn = dataIndex => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      return (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => {
              this.searchInput = node;
            }}
            placeholder={`Поиск по ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Искать
          </Button>
          <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Сброс
          </Button>
        </div>
      );
    },
    filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      const filterText = record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase());
      return filterText;
    },
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: text => {
      const isDateString = _.isArray(text) && moment(text[0], 'DD.MM.YYYY')._isValid;
      const isArrayEditors = _.isArray(text) && !isDateString;
      const className =
        text === 'В работе'
          ? 'active'
          : text === 'Открыт'
          ? ''
          : text === 'Закрыт'
          ? 'close'
          : text === 'Выполнен'
          ? 'done'
          : null;

      return (
        <Output className={className}>
          {isArrayEditors ? text.join(' , ') : isDateString ? text.join(' - ') : text}
        </Output>
      );
    },
  });

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
