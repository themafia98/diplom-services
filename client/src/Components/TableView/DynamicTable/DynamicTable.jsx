// @ts-nocheck
import React from 'react';
import { dynamicTableType } from '../types';
import _ from 'lodash';
import moment from 'moment';
import Output from '../../Output';
import { Table, message, Input, Button, Icon, Empty } from 'antd';
import { getDataSource } from '../../../Utils';
import modelContext from '../../../Models/context';

class DynamicTable extends React.PureComponent {
  state = {
    pagination: {
      current: 1,
      pageSize: 5,
    },
  };

  static contextType = modelContext;
  static propTypes = dynamicTableType;

  getConfigColumns = () => {
    const { router: { path = '' } = {} } = this.props;
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

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({ searchText: selectedKeys[0], searchedColumn: dataIndex });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  getColumn = (dataIndex) => ({
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
      return (
        <div style={{ padding: 8 }}>
          <Input
            ref={(node) => {
              this.searchInput = node;
            }}
            placeholder={`Поиск по ${dataIndex}`}
            value={selectedKeys[0]}
            onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
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
    render: (text) => {
      const isDateString = _.isArray(text) && moment(text[0], 'DD.MM.YYYY')?._isValid;
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

  onClickRow = (record) => {
    return {
      onClick: () => {
        const {
          onOpenPageWithData,
          router: { currentActionTab: path, actionTabs = [] },
          setCurrentTab,
          routeParser,
          routePathNormalise,
        } = this.props;
        const { config = {} } = this.context;

        const { key = '' } = record || {};
        if (!key) return;

        if (config.tabsLimit <= actionTabs.length)
          return message.error(`Максимальное количество вкладок: ${config.tabsLimit}`);

        const { moduleId = '', page = '' } = routeParser({ path });
        if (!moduleId || !page) return;

        const index = actionTabs.findIndex((tab) => tab.includes(page) && tab.includes(key));
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
          setCurrentTab(actionTabs[index]);
        }
      },
    };
  };

  /**
   * @param {any} pagination
   * @param {any} filters
   * @param {any} sorter
   */
  handleTableChange = (pagination, filteredInfo, sortedInfo) => {
    const {
      router: { path = '' },
      onAddRouteData,
    } = this.props;
    onAddRouteData({
      path,
      loading: true,
      saveData: { pagination, filteredInfo, sortedInfo },
    });
  };

  render() {
    /** sizes: "small" | "default" | "middle"  */
    const { config: { task: { tableSize = 'default' } = {} } = {} } = this.context;
    const { pagination: paginationDefault = {} } = this.state;

    const {
      dataSource = [],
      filterBy = '',
      udata: { _id: uid },
      height,
      loading,
      router: { path, routeData: { [path]: currentModuleData = {} } = {} } = {},
    } = this.props;
    const { saveData: { pagination = null } = {} } = currentModuleData || {};
    const pager = pagination ? pagination : paginationDefault;
    pager.paginationState = { ...pager };

    let source = dataSource && dataSource?.length ? getDataSource(dataSource, filterBy, uid) : dataSource;
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
        loading={loading}
        onRow={this.onClickRow}
      />
    );
  }
}

export default DynamicTable;
