import React, { createRef, PureComponent } from 'react';
import { tableType } from '../TableView.types';
import moment from 'moment';
import Output from 'Components/Output';
import { Table as AntTable, message, Empty, Input, Button } from 'antd';
import { getDataSource, findData, checkPageAvailable } from 'Utils';
import ModelContext from 'Models/context';
import { connect } from 'react-redux';
import { createTableConfig } from './Table.utils';
import { TABLE_TYPE } from './Table.constant';
import { getStatusByTitle } from './Table.utils';
import { compose } from 'redux';
import { withTranslation } from 'react-i18next';
import { addToRouteData, openPageWithData, setActiveTab } from 'Redux/reducers/routerReducer.slice';
import Request from 'Models/Rest';

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
    depDataKey: '',
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

  getFilterDropdown = (dataValue) => ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => {
    return (
      <div className="Table-controllers">
        <Input
          className="searchInput-popover"
          ref={this.searchInputRef}
          placeholder={`Поиск по ${dataValue}`}
          value={selectedKeys[0]}
          onChange={(e) => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
        />
        <Button
          className="buttonSearch-popover"
          type="primary"
          onClick={() => this.handleSearch(selectedKeys, confirm, dataValue)}
          icon="search"
          size="small"
        >
          Искать
        </Button>
        <Button className="buttonReset-popover" onClick={() => this.handleReset(clearFilters)} size="small">
          Сброс
        </Button>
      </div>
    );
  };

  getTaskConfigColumns = () => {
    const { routerData, t } = this.props;
    const { saveData = {} } = routerData || {};
    const { sortedInfo = [] } = saveData || {};

    const columns = [
      {
        dataValue: 'status',
      },
      {
        dataValue: 'name',
      },
      {
        dataValue: 'priority',
      },
      {
        dataValue: 'author',
      },
      {
        dataValue: 'editor',
        customSorter: (a, b) => (a.editor && b.editor ? a.editor[0] - b.editor[0] : null),
      },
      {
        dataValue: 'date',
        customSorter: (a, b) => {
          if (a.date && b.date) {
            return moment(a.date[0], 'DD:MM:YYYY') - moment(b.date[0], 'DD:MM:YYYY');
          }
        },
      },
    ].map((column) => ({
      ...column,
      name: t(`components_table_taskConfig_${column.dataValue}`),
      render: this.getColumnRender.bind(this),
    }));

    return createTableConfig(columns, sortedInfo, this.searchInputRef, this.getFilterDropdown.bind(this));
  };

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({ searchText: selectedKeys[0], searchedColumn: dataIndex });
  };

  handleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  };

  getColumnRender = (text, currentData) => {
    const { routeData, depDataKey } = this.props;
    const isDateString = Array.isArray(text) && moment(text[0], 'DD.MM.YYYY')?._isValid;
    const isArrayEditors = Array.isArray(text) && !isDateString;
    const className = getStatusByTitle(text);

    const usersList = findData(routeData, 'global')?.users;
    const listKeys = Object.keys(currentData);
    const index = listKeys.findIndex((key) => currentData[key] === text);
    const currentKey = listKeys[index] || null;
    const isEditor = currentKey === 'editor';

    let propsOutput = isEditor
      ? {
          typeOutput: 'default',
          depDataKey,
          links: usersList,
          list: true,
          isLoad: true,
          isStaticList: true,
        }
      : null;

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

    if (!children && propsOutput === null) {
      return null;
    }

    return (
      <Output {...propsOutput} className={className ? className : currentKey}>
        {children}
      </Output>
    );
  };

  onClickRow = (record) => {
    return {
      onClick: async () => {
        const {
          onOpenPageWithData,
          currentActionTab: path,
          activeTabs,
          setCurrentTab,
          routeParser,
          routePathNormalise,
          appConfig: config,
          t,
        } = this.props;

        const { key: recordKey = '', _id: id = '' } = record || {};
        if (!id && !recordKey) return;
        const key = id ? id : recordKey;
        if (config.tabsLimit <= activeTabs.length)
          return message.error(`${t('globalMessages_maxTabs')} ${config.tabsLimit}`);

        const { moduleId = '', page = '' } = routeParser({ path });
        if (!moduleId || !page) return;

        const index = activeTabs.findIndex((tab) => tab.includes(page) && tab.includes(key));
        const isFind = index !== -1;

        const activePage = routePathNormalise({
          pathType: 'moduleItem',
          pathData: { page, moduleId, key },
        });

        if (!(await checkPageAvailable(activePage, new Request()))) {
          return;
        }

        if (isFind) {
          setCurrentTab(activeTabs[index]);
        }
        onOpenPageWithData({
          activePage,
          routeDataActive: record,
        });
      },
    };
  };

  /**
   * @param {any} pagination
   * @param {any} filters
   * @param {any} sorter
   */
  handleTableChange = (pagination, filtered, sorted) => {
    const { currentActionTab, onAddRouteData } = this.props;

    const filteredInfo = Object.keys(filtered).reduce((filter, key) => {
      if (filtered[key]?.length) filter[key] = filtered[key];
      return filter;
    }, {});

    const sortedInfo = Object.keys(sorted).reduce((sorter, key) => {
      if (sorted[key]?.length) sorter[key] = sorted[key];
      return sorter;
    }, {});

    onAddRouteData({
      path: currentActionTab,
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
      udata,
      height,
      loading,
      appConfig = {},
      routeData,
      currentActionTab = '',
    } = this.props;
    const { _id: uid } = udata;
    const { [currentActionTab]: currentModuleData = {} } = routeData || {};

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

    const columns = type === TABLE_TYPE.TASK ? this.getTaskConfigColumns() : null;

    if (!columns) {
      return <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} description="Not found data for display table" />;
    }

    return (
      <AntTable
        locale={{
          emptyText: <Empty image={Empty.PRESENTED_IMAGE_DEFAULT} description="Table is empty" />,
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

const mapStateTopProps = ({ publicReducer, router }) => {
  const { appConfig, udata } = publicReducer;
  const { routeData, path, activeTabs } = router;
  return {
    appConfig,
    udata,
    routeData,
    currentActionTab: path,
    activeTabs,
    routerData: routeData[path] || null,
  };
};

const mapDispatchToProps = (dispatch) => ({
  onOpenPageWithData: (payload) => dispatch(openPageWithData(payload)),
  setCurrentTab: (tab) => dispatch(setActiveTab(tab)),
  onAddRouteData: (data) => dispatch(addToRouteData(data)),
});

export default compose(connect(mapStateTopProps, mapDispatchToProps), withTranslation())(Table);
