import React from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { loadCurrentData } from '../../../Redux/actions/routerActions/middleware';
import { Tree, Button, Input, Select, Dropdown, Menu, message, Spin } from 'antd';

import WikiPage from './WikiPage';
import ModalWindow from '../../ModalWindow';
import TitleModule from '../../TitleModule';
import modalContext from '../../../Models/context';

const { TreeNode, DirectoryTree } = Tree;
const { Option } = Select;

const { Search } = Input;

class WikiModule extends React.PureComponent {
  static propTypes = {
    onErrorRequstAction: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
  };

  static contextType = modalContext;

  state = {
    isLoading: false,
    expanded: false,
    visibleModal: false,
    selectedNode: '',
    searchValue: '',
    expandedKeys: [],
    autoExpandParent: false,
    node: {
      title: '',
      accessGroup: [],
    },
  };

  componentDidMount = async () => {
    this.fetchTree('didMount');
  };

  componentDidUpdate = async () => {
    this.fetchTree();
  };

  onSelect = (keys, event) => {
    const { node: { props: { expanded = false } = {} } = {} } = event || {};
    const { metadata = [] } = this.props;

    if (expanded) {
      this.setState({
        ...this.state,
        selectedNode: null,
      });
      return;
    }

    const selectedNodeItem = metadata.find(node => node?.path === keys[0]);

    this.setState({
      ...this.state,
      selectedNode: selectedNodeItem ? { ...selectedNodeItem } : null,
    });
  };

  onVisibleModalChange = callback => {
    this.setState(
      state => {
        return {
          ...state,
          visibleModal: !state?.visibleModal,
          node: {
            title: '',
            accessGroup: [],
          },
        };
      },
      () => {
        if (_.isFunction(callback)) {
          callback();
        }
      },
    );
  };

  fetchTree = async (mode = '', forceUpdate = false) => {
    const { onLoadCurrentData, visible, router: { shouldUpdate = false, routeData = {} } = {} } = this.props;
    const { isLoading = false } = this.state;
    const isModuleUpdate = shouldUpdate && visible && !routeData['wikiModule']?.load;

    if (mode === 'didMount') {
      this.setState({
        ...this.state,
        isLoading: true,
      });
    }

    if (mode !== 'didMount' && isLoading && routeData['wikiModule']?.load) {
      this.setState({
        ...this.state,
        isLoading: false,
      });
    }

    if (forceUpdate || mode === 'didMount' || isModuleUpdate) {
      onLoadCurrentData({
        path: 'wikiModule',
        storeLoad: 'wiki',
        useStore: true,
        methodQuery: 'get_all',
        methodRequst: 'GET',
        sortBy: 'index',
      });
    }
  };

  onCreateNode = async (item = null, event) => {
    const { node } = this.state;
    const { metadata = [] } = this.props;
    const { Request } = this.context;
    if (!Request) return;
    try {
      const indexId = !item ? 'root' : item?.parentId;
      const index = ++metadata.filter(node => node && node.parentId === indexId).length;
      const rest = new Request();
      const res = await rest.sendRequest('/wiki/createLeaf', 'PUT', {
        type: 'wikiTree',
        item: !item
          ? {
              ...node,
              level: 1,
              path: `0-${index}`,
              index,
              parentId: 'root',
            }
          : item,
      });

      if (res.status !== 200) {
        throw new Error('Bad create');
      }

      if (!item) this.onVisibleModalChange(this.fetchTree.bind(this, '', true));
      else this.fetchTree('', true);
    } catch (error) {
      console.error(error);
      message.error('Ошибка создания новой ветки');
    }
  };

  onChangeSelect = value => {
    this.setState({
      ...this.state,
      node: {
        ...this.state.node,
        accessGroup: value,
      },
    });
  };

  onChangeTitleNode = ({ target: { value } }) => {
    this.setState({
      ...this.state,
      node: {
        ...this.state.node,
        title: value,
      },
    });
  };

  /**
   * @param {Array<object>} rootNodeList
   * @param {Array<object>} nodeListChildren
   */
  buildTree = (rootNodeList, nodeListChildren) => {
    const { TreeBuilder } = this.context;
    return new TreeBuilder(nodeListChildren).buildTree(rootNodeList);
  };

  /**
   * @param {Array<object>} nodeList
   */
  getTreeData = nodeList => {
    if (!Array.isArray(nodeList)) return [];

    const rootNodesList = nodeList.filter(node => node?.parentId === 'root');
    const nodeListChildren = nodeList.filter(node => node?.parentId !== 'root');

    return this.buildTree(rootNodesList, nodeListChildren);
  };

  onDropdownEvent = (sign = '', id = '', event) => {
    if (!sign || !id) return;
    const { metadata = [] } = this.props;

    const item = metadata.find(node => node?._id === id);

    if (!item) {
      message.error('Ветка не найдена');
      return;
    }

    const index = ++metadata.filter(node => node?.parentId === id).length;

    if (sign === 'add') {
      this.onCreateNode(
        {
          title: `testLEaf${Math.random()}`,
          level: item.level ? item.level + 1 : 1,
          path: `${item?.path}-${index}`,
          index,
          parentId: id,
        },
        event,
      );
    }
  };

  renderTree = () => {
    const { searchValue, expandedKeys, autoExpandParent } = this.state;
    const { metadata = [] } = this.props;

    const listData = this.getTreeData(metadata);

    const loop = data =>
      data.map(it => {
        const item = {
          ...it,
          children: it?.children ? it.children : [],
        };

        const menu = (
          <Menu>
            <Menu.Item onMouseDown={this.onDropdownEvent.bind(this, 'add', it?._id)} key={`add${it?._id}`}>
              Добавить ветку
            </Menu.Item>
            <Menu.Item
              onMouseDown={this.onDropdownEvent.bind(this, 'delete', it?._id)}
              key={`delete${it?._id}`}
            >
              Удалить ветку
            </Menu.Item>
          </Menu>
        );

        const index = item.title.indexOf(searchValue);
        const beforeStr = item.title.substr(0, index);
        const afterStr = item.title.substr(index + searchValue.length);
        const title =
          index > -1 ? (
            <Dropdown overlay={menu} trigger={['contextMenu']}>
              <span>
                {beforeStr}
                <span style={{ color: 'blue' }} className="site-tree-search-value">
                  {searchValue}
                </span>
                {afterStr}
              </span>
            </Dropdown>
          ) : (
            <Dropdown overlay={menu} trigger={['contextMenu']}>
              <span>{item?.title}</span>
            </Dropdown>
          );
        if (item?.children) {
          return { title, key: item?.path, children: loop(item.children) };
        }
      });

    return loop(listData);
  };

  onSearch = ({ target: { value: searchValue = '' } }) => {
    this.setState({
      ...this.state,
      searchValue,
    });
  };

  render() {
    const {
      visibleModal = false,
      node: { title = '', accessGroup = [] },
      isLoading: isLoadingState,
      selectedNode = null,
    } = this.state;
    const { _id: key = '', path } = selectedNode || {};
    const { metadata = [], router: { shouldUpdate = false } = {} } = this.props;
    const isLoading = isLoadingState || (shouldUpdate && !metadata?.length);

    return (
      <React.Fragment>
        <div className="wikiModule">
          <TitleModule classNameTitle="wikiModuleTitle" title="Википедия системы" />
          <Button
            disabled={isLoadingState}
            onClick={this.onVisibleModalChange}
            type="primary"
            className="createNode"
          >
            Создать новую ветку
          </Button>
          <div className="wikiModule__main">
            <div className="col-6">
              {metadata.length ? (
                <React.Fragment>
                  <Search
                    className="wikiModule__searchInput"
                    placeholder="Поиск по дереву"
                    onChange={this.onSearch}
                  />
                  <Tree onSelect={this.onSelect} treeData={this.renderTree()} />
                </React.Fragment>
              ) : !isLoading ? (
                <p className="empty-tree">В Wiki ничего нет</p>
              ) : (
                <Spin size="large" />
              )}
            </div>
            <div className="col-6">
              {selectedNode ? <WikiPage key={key} selectedNode={selectedNode} /> : null}
            </div>
          </div>
        </div>
        <ModalWindow
          defaultView={true}
          visibility={visibleModal}
          onOkey={this.onCreateNode.bind(this, null)}
          onReject={this.onVisibleModalChange}
          content={
            <div className="modal-content">
              <Input
                value={title}
                onChange={this.onChangeTitleNode}
                type="text"
                placeholder="название ветки"
              />
              <Select
                placeholder="группы доступа"
                value={accessGroup}
                onChange={this.onChangeSelect}
                mode="multiple"
              >
                <Option value="full">Все</Option>
              </Select>
            </div>
          }
        />
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => {
  const {
    router,
    router: { routeData = {} } = {},
    publicReducer: { udata = {} },
  } = state;

  const { wiki: metadata = [] } = routeData['wikiModule'] || {};

  return {
    router,
    udata,
    metadata,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    onLoadCurrentData: props => dispatch(loadCurrentData(props)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(WikiModule);
