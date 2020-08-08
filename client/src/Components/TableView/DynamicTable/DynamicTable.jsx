import React, { PureComponent } from 'react';
import { dynamicTableType } from '../types';
import moment from 'moment';
import Output from 'Components/Output';
import { Table, message, Input, Button, Icon, Empty } from 'antd';
import { getDataSource, findData } from 'Utils';
import ModelContext from 'Models/context';
import { connect } from 'react-redux';

class DynamicTable extends PureComponent {
  state = {
    pagination: {
      current: 1,
      pageSize: 10,
    },
    counter: null,
  };

  static contextType = ModelContext;
  static propTypes = dynamicTableType;
  static defaultProps = {
    counter: null,
    router: {},
    depDataKey: '',
    udata: {},
    filteredUsers: [],
    cachesAuthorList: [],
    cachesEditorList: [],
    onOpenPageWithData: null,
    setCurrentTab: null,
    routeParser: null,
    onAddRouteData: null,
    routePathNormalise: '',
  };

  static getDerivedStateFromProps = (props, state) => {
    const { counter } = props;
    const { counter: counterState = null } = state;
    if (counter !== null && counter !== counterState) {
      return {
        ...state,
        counter,
      };
    }

    return state;
  };

  getConfigColumns = () => {
    const {
      router: { path = '' } = {},
      router,
      depDataKey,
      udata,
      filteredUsers,
      cachesAuthorList,
      cachesEditorList,
    } = this.props;
    const {
      router: { routeData: { [path]: { saveData: { sortedInfo = [] } = {} } = {} } = {} } = {},
    } = this.props;
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
        dataIndex: 'authorName',
        key: 'authorName',
        onFilter: (value, record) => {
          return record.authorName.includes(value);
        },
        sorter: (a, b) => a.authorName.length - b.authorName.length,
        sortOrder: sortedInfo && sortedInfo.columnKey === 'author' && sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
        render: (text, row, index) => {
          return <Output key={`${text}${row}${index}authorName`}>{text}</Output>;
        },
        ...this.getColumn('authorName'),
      },
      {
        title: 'Исполнитель',
        className: 'editor',
        dataIndex: 'editor',
        key: 'editor',
        // onFilter: (value, record) => {
        //   return record.editor.includes(value);
        // },
        sorter: (a, b) => (a.editor && b.editor ? a.editor[0] - b.editor[0] : null),
        sortOrder: sortedInfo && sortedInfo.columnKey === 'editor' && sortedInfo.order,
        sortDirections: ['descend', 'ascend'],
        render: (text, row, index) => {
          return (
            <Output
              key={`${text}${row}${index}editor`}
              depDataKey={depDataKey}
              router={router}
              links={filteredUsers?.length ? filteredUsers : cachesEditorList}
              isLink={filteredUsers?.length ? Boolean(filteredUsers) : Boolean(cachesAuthorList)}
              list={true}
              udata={udata}
              isLoad={true}
              isStaticList={true}
            >
              {text.split('-')}
            </Output>
          );
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

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({ searchText: selectedKeys[0], searchedColumn: dataIndex });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  getColumn = (dataIndex) => ({
    filterDropdown:
      dataIndex !== 'editor'
        ? ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
            return (
              <div className="dynamicTable-controllers">
                <Input
                  className="searchInput-popover"
                  ref={(node) => {
                    this.searchInput = node;
                  }}
                  placeholder={`Поиск по ${dataIndex}`}
                  value={selectedKeys[0]}
                  onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                  onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
                />
                <Button
                  className="buttonSearch-popover"
                  type="primary"
                  onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
                  icon="search"
                  size="small"
                >
                  Искать
                </Button>
                <Button
                  className="buttonReset-popover"
                  onClick={() => this.handleReset(clearFilters)}
                  size="small"
                >
                  Сброс
                </Button>
              </div>
            );
          }
        : undefined,
    filterIcon: (filtered) => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      const filterText = record[dataIndex].toString().toLowerCase().includes(value.toLowerCase());
      return filterText;
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text, currentData) => {
      const { router, depDataKey, udata } = this.props;
      const isDateString = Array.isArray(text) && moment(text[0], 'DD.MM.YYYY')?._isValid;
      const isArrayEditors = Array.isArray(text) && !isDateString;
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

      const usersList = findData(router?.routeData, 'global')?.users;
      const listKeys = Object.keys(currentData);
      const index = listKeys.findIndex((key) => currentData[key] === text);
      const currentKey = listKeys[index] || null;
      const isEditor = currentKey === 'editor';
      let propsOutput = isEditor
        ? {
            typeOutput: 'default',
            depDataKey,
            router,
            links: usersList,
            list: true,
            udata: udata,
            isLoad: true,
            isStaticList: true,
          }
        : {};

      const children =
        isEditor && Array.isArray(text)
          ? text.reduce((ids, id) => {
              const findUser = usersList?.find((it) => it?._id === id);
              if (findUser) return [...ids, findUser];
              return ids;
            }, [])
          : isArrayEditors
          ? text.join(' , ')
          : isDateString
          ? text.join(' - ')
          : text;

      return (
        <Output {...propsOutput} className={className ? className : currentKey}>
          {children}
        </Output>
      );
    },
  });

  onClickRow = (record) => {
    return {
      onClick: () => {
        const {
          onOpenPageWithData,
          router: { currentActionTab: path, activeTabs = [] },
          setCurrentTab,
          routeParser,
          routePathNormalise,
          appConfig: config,
        } = this.props;

        const { key: recordKey = '', _id: id = '' } = record || {};
        if (!id && !recordKey) return;
        const key = id ? id : recordKey;
        if (config.tabsLimit <= activeTabs.length)
          return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

        const { moduleId = '', page = '' } = routeParser({ path });
        if (!moduleId || !page) return;

        const index = activeTabs.findIndex((tab) => tab.includes(page) && tab.includes(key));
        const isFind = index !== -1;

        if (!isFind) {
          onOpenPageWithData({
            activePage: routePathNormalise({
              pathType: 'moduleItem',
              pathData: { page, moduleId, key },
            }),
            routeDataActive: record,
          });
        } else {
          setCurrentTab(activeTabs[index]);
        }
      },
    };
  };

  /**
   * @param {any} pagination
   * @param {any} filters
   * @param {any} sorter
   */
  handleTableChange = (pagination, filtered, sorted) => {
    const {
      router: { path = '' },
      onAddRouteData,
    } = this.props;

    const filteredInfo = Object.keys(filtered).reduce((filter, key) => {
      if (filtered[key]?.length) filter[key] = filtered[key];
      return filter;
    }, {});

    const sortedInfo = Object.keys(sorted).reduce((sorter, key) => {
      if (sorted[key]?.length) sorter[key] = sorted[key];
      return sorter;
    }, {});

    onAddRouteData({
      path,
      loading: true,
      saveData: { pagination, filteredInfo, sortedInfo },
    });
  };

  render() {
    /** sizes: "small" | "default" | "middle"  */
    const { pagination: paginationDefault = {}, counter = null } = this.state;

    const {
      dataSource = [],
      filterBy = '',
      udata: { _id: uid },
      height,
      loading,
      router: { path, routeData: { [path]: currentModuleData = {} } = {} } = {},
      appConfig = {},
    } = this.props;
    const { task: { tableSize = 'default', frontFilter = true } = {} } = appConfig;

    const { saveData: { pagination = null } = {} } = currentModuleData || {};
    const pager = pagination ? pagination : paginationDefault;
    pager.paginationState = { ...pager };

    if (counter && pager) {
      pager.total = counter;
      pager.paginationState.total = counter;
    }
    const isExistsSource = dataSource && dataSource?.length;
    let source = isExistsSource && frontFilter ? getDataSource(dataSource, filterBy, uid) : dataSource;

    const columns = this.getConfigColumns();

    return (
      <Table
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} description="Журнал пуст" />,
        }}
        pagination={pager}
        size={tableSize}
        scroll={{ y: height }}
        onChange={this.handleTableChange}
        columns={columns}
        dataSource={source}
        loading={loading || this.state.counter === null}
        onRow={this.onClickRow}
      />
    );
  }
}

const mapStateTopProps = (state) => {
  const { appConfig } = state.publicReducer;
  return {
    appConfig,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {};
};

export default connect(mapStateTopProps, mapDispatchToProps)(DynamicTable);
