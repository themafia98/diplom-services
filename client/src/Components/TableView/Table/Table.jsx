import React, { createRef, PureComponent } from 'react';
import { tableType } from '../TableView.types';
import moment from 'moment';
import Output from 'Components/Output';
import { Table as AntTable, message, Empty } from 'antd';
import { getDataSource, findData } from 'Utils';
import ModelContext from 'Models/context';
import { connect } from 'react-redux';
import {
  addToRouteDataAction,
  openPageWithDataAction,
  setActiveTabAction,
} from 'Redux/actions/routerActions';
import { createTableConfig } from './Table.utils';
import { TABLE_TYPE } from './Table.constant';
import { getStatusByTitle } from './Table.utils';

class Table extends PureComponent {
  state = {
    pagination: {
      current: 1,
      pageSize: 10,
    },
    counter: null,
  };

  searchInputRef = createRef(null);

  static contextType = ModelContext;
  static propTypes = tableType;
  static defaultProps = {
    counter: null,
    router: {},
    depDataKey: '',
    udata: {},
    filteredUsers: [],
    cachesAuthorList: [],
    cachesEditorList: [],
    routeParser: null,
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

  getTaskConfigColumns = () => {
    const { router } = this.props;
    const routerData = router.routeData[router.path] || {};
    const { saveData = {} } = routerData;
    const { sortedInfo = [] } = saveData;

    const columns = [
      {
        name: 'Статус',
        dataValue: 'status',
        render: this.getColumnRender.call(this, 'status'),
      },
      {
        name: 'Наименование',
        dataValue: 'name',
        render: this.getColumnRender.call(this, 'name'),
      },
      {
        name: 'Приоритет',
        dataValue: 'priority',
        render: this.getColumnRender.call(this, 'priority'),
      },
      {
        name: 'Автор',
        dataValue: 'author',
        render: this.getColumnRender.call(this, 'author'),
      },
      {
        name: 'Исполнитель',
        dataValue: 'editor',
        customSorter: (a, b) => (a.editor && b.editor ? a.editor[0] - b.editor[0] : null),
        render: this.getColumnRender.call(this, 'author'),
      },
      {
        name: 'Сроки',
        dataValue: 'date',
        customSorter: (a, b) => {
          if (a.date && b.date) {
            return moment(a.date[0], 'DD:MM:YYYY') - moment(b.date[0], 'DD:MM:YYYY');
          }
        },
        render: this.getColumnRender.call(this, 'data'),
      },
    ];

    return createTableConfig(
      columns,
      sortedInfo,
      this.searchInputRef,
      this.handleSearch.bind(this),
      this.handleReset.bind(this),
    );
  };

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({ searchText: selectedKeys[0], searchedColumn: dataIndex });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  getColumnRender = () => (text, currentData) => {
    const { router, depDataKey, udata } = this.props;
    const isDateString = Array.isArray(text) && moment(text[0], 'DD.MM.YYYY')?._isValid;
    const isArrayEditors = Array.isArray(text) && !isDateString;
    const className = getStatusByTitle(text);

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
  };

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
    const { pagination: paginationDefault = {}, counter = null } = this.state;

    const {
      type = '',
      dataSource = [],
      filterBy = '',
      udata: { _id: uid },
      height,
      loading,
      router = {},
      appConfig = {},
    } = this.props;
    const { path, routeData: { [path]: currentModuleData = {} } = {} } = router;
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

    const columns = type === TABLE_TYPE.TASK ? this.getTaskConfigColumns() : [];

    return (
      <AntTable
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

const mapDispatchToProps = (dispatch) => ({
  onOpenPageWithData: (payload) => dispatch(openPageWithDataAction(payload)),
  setCurrentTab: (tab) => dispatch(setActiveTabAction(tab)),
  onAddRouteData: (data) => dispatch(addToRouteDataAction(data)),
});

export default connect(mapStateTopProps, mapDispatchToProps)(Table);
