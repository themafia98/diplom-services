import React from 'react';
import { wikiModuleType } from './types';
import { connect } from 'react-redux';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import { loadCurrentData } from '../../../Redux/actions/routerActions/middleware';
import { Tree, Button, Input, Select, Dropdown, Menu, message, Spin } from 'antd';

import WikiPage from './WikiPage';
import ModalWindow from '../../ModalWindow';
import TitleModule from '../../TitleModule';
import modalContext from '../../../Models/context';

const { Option } = Select;
const { Search } = Input;

class WikiModule extends React.PureComponent {
  static propTypes = wikiModuleType;
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
    visbileDropdownId: null,
    visbileDropdown: false,
    selectedNodeMetadta: null,
  };

  titleRef = React.createRef();

  componentDidMount = async () => {
    this.fetchTree('didMount');
  };

  componentDidUpdate = async () => {
    this.fetchTree();
  };

  onSelect = (keys, event) => {
    const { metadata = [] } = this.props;
    let selectedNodeMetadata = null;
    let selectedNode = null;

    if (keys?.length) {
      selectedNode = keys[0];
      selectedNodeMetadata = metadata.find(meta => meta?.path === selectedNode);
    }

    this.setState({
      ...this.state,
      selectedNode,
      selectedNodeMetadata,
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
        indStoreName: 'wikiTree',
      });
    }
  };

  onCreateNode = async (item = null) => {
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
              accessGroups: node?.accessGroups?.length ? [...node.accessGroups] : ['full'],
            }
          : item,
      });

      if (res.status !== 200) {
        throw new Error('Bad create');
      }

      if (!item) this.onVisibleModalChange(this.fetchTree.bind(this, null, true));
      else this.fetchTree('', true);
    } catch (error) {
      console.error(error);
      message.error('Ошибка создания новой ветки');
    }
  };

  onDeleteNode = async (body, event) => {
    try {
      const { Request } = this.context;
      const rest = new Request();

      const res = await rest.sendRequest('/wiki/deleteLeafs', 'DELETE', body, true);

      if (!res || res?.status !== 200) {
        throw new Error('Bad delete leaf');
      }

      const { data: { response: { metadata: { deletedCount = 0, ok = 0 } = {} } = {} } = {} } = res;

      if (deletedCount && ok) this.fetchTree('', true);
      message.success('Ветка удалена');
    } catch (error) {
      console.error(error);
      message.error('Ошибка удаления ветки');
    }
  };

  onChangeSelect = value => {
    this.setState(state => {
      return {
        ...state,
        node: {
          ...state.node,
          accessGroup: value,
        },
      };
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
    event.stopPropagation();

    if (!sign || !id) return;

    const { metadata = [] } = this.props;

    const item = metadata.find(node => node?._id === id);

    if (!item) {
      message.error('Ветка не найдена');
      return;
    }

    if (sign === 'add') {
      const { current: { state: { value: title = '' } = {} } = {} } = this.titleRef || {};
      if (!title) return;
      const index = ++metadata.filter(node => node?.parentId === id).length;

      this.onCreateNode(
        {
          title,
          level: item.level ? item.level + 1 : 1,
          path: `${item?.path}-${index}`,
          index,
          parentId: id,
        },
        event,
      );
    } else if (sign === 'delete') {
      const childrensIds = metadata
        .map(node => {
          if (node?.parentId === id) {
            return node?._id;
          }
          return null;
        })
        .filter(Boolean);

      const parentId = item?._id;

      this.onDeleteNode(
        {
          queryParams: {
            ids: _.uniq([...childrensIds, parentId]),
          },
        },
        event,
      );
    }
  };

  onVisibleChange = (id, visible) => {
    this.setState({
      ...this.state,
      visbileDropdownId: visible ? id : null,
      visbileDropdown: visible,
    });
  };

  renderTree = () => {
    const { searchValue, visbileDropdownId = null, visbileDropdown = false } = this.state;
    const { metadata = [] } = this.props;

    const listData = this.getTreeData(metadata);

    const loop = data =>
      data.map(it => {
        const item = {
          ...it,
          children: it?.children ? it.children : [],
        };

        const menu = (
          <Menu className="dropdown-action">
            <Menu.Item key={`add${it?._id}`}>
              <Input autoFocus placeholder="название новой ветки" type="text" ref={this.titleRef} />
              <Button
                type="primary"
                className="item-action"
                onClick={this.onDropdownEvent.bind(this, 'add', it?._id)}
              >
                Добавить ветку
              </Button>
            </Menu.Item>
            <Menu.Item key={`delete${it?._id}`}>
              <Button type="link" onClick={this.onDropdownEvent.bind(this, 'delete', it?._id)}>
                Удалить выбраную ветку
              </Button>
            </Menu.Item>
          </Menu>
        );

        const index = item.title.indexOf(searchValue);
        const beforeStr = item.title.substr(0, index);
        const afterStr = item.title.substr(index + searchValue.length);
        const title =
          index > -1 ? (
            <Dropdown
              visible={visbileDropdownId === it?._id && visbileDropdown}
              onVisibleChange={this.onVisibleChange.bind(this, it?._id)}
              overlay={menu}
              trigger={['contextMenu']}
            >
              <span>
                {beforeStr}
                <span style={{ color: 'blue' }} className="site-tree-search-value">
                  {searchValue}
                </span>
                {afterStr}
              </span>
            </Dropdown>
          ) : (
            <Dropdown
              visible={visbileDropdownId === it?._id && visbileDropdown}
              onVisibleChange={this.onVisibleChange.bind(this, it?._id)}
              overlay={menu}
              trigger={['contextMenu']}
            >
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
      selectedNodeMetadata = null,
      selectedNode = '',
    } = this.state;
    const { _id: key = '', path = '' } = selectedNodeMetadata || {};
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
                  <Scrollbars>
                    <Tree onSelect={this.onSelect} treeData={this.renderTree()} />
                  </Scrollbars>
                </React.Fragment>
              ) : !isLoading ? (
                <p className="empty-tree">В Wiki ничего нет</p>
              ) : (
                <Spin size="large" />
              )}
            </div>
            <div className="col-6">
              {selectedNode ? (
                <WikiPage key={key} metadata={selectedNodeMetadata} selectedNode={selectedNode} />
              ) : null}
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
