import React, { PureComponent, createRef } from 'react';
import { wikiModuleType } from './WikiModule.types';
import { connect } from 'react-redux';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import { Tree, Button, Input, Select, Dropdown, Menu, message, Spin } from 'antd';

import WikiPage from './WikiPage';
import ModalWindow from 'Components/ModalWindow';
import Title from 'Components/Title';
import actionsTypes from 'actions.types';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { withClientDb } from 'Models/ClientSideDatabase';
import actionPath from 'actions.path';
import { requestTemplate, paramsTemplate } from 'Utils/Api/api.utils';
import { withTranslation } from 'react-i18next';

const { Option } = Select;
const { Search } = Input;

class WikiModule extends PureComponent {
  static propTypes = wikiModuleType;

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

  titleRef = createRef();

  componentDidMount = () => {
    this.fetchTree('didMount');
  };

  componentDidUpdate = () => {
    this.fetchTree();
  };

  onSelect = (keys, event) => {
    const { metadata = [] } = this.props;
    let selectedNodeMetadata = null;
    let selectedNode = null;

    if (keys?.length) {
      selectedNode = keys[0];
      selectedNodeMetadata = metadata.find((meta) => meta?.path === selectedNode);
    }

    this.setState({
      ...this.state,
      selectedNode,
      selectedNodeMetadata,
    });
  };

  onVisibleModalChange = (callback) => {
    this.setState(
      (state) => {
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
        if (typeof callback === 'function') callback();
      },
    );
  };

  fetchTree = async (mode = '', forceUpdate = false) => {
    const {
      onLoadCurrentData,
      router: { shouldUpdate = false, routeData = {} } = {},
      moduleContext,
      clientDB,
    } = this.props;
    const { visibility = false } = moduleContext;
    const { isLoading = false } = this.state;
    const isModuleUpdate = shouldUpdate && visibility && !routeData['wikiModule']?.load;

    if (mode !== 'didMount' && isLoading && routeData['wikiModule']?.load) {
      this.setState({
        ...this.state,
        isLoading: false,
      });
    }

    if (!isLoading && (forceUpdate || mode === 'didMount' || isModuleUpdate)) {
      await onLoadCurrentData({
        action: actionPath.$LOAD_WIKI_TREE,
        path: 'wikiModule',
        sortBy: 'index',
        clientDB,
      });

      this.setState({
        isLoading: false,
      });
    }
  };

  onCreateNode = async (item = null) => {
    const { node: nodeState = {} } = this.state;
    const { metadata = [], modelsContext, t } = this.props;
    const { Request } = modelsContext;
    if (!Request) return;
    try {
      const node = !nodeState?.parentId ? { ...nodeState, parentId: 'root' } : { ...nodeState };
      const indexId = !item ? 'root' : item?.parentId;
      if (indexId === null) {
        message.error(t('wiki_messages_errorCreateLeaf'));
        return this.onVisibleModalChange();
      }
      const index = ++metadata.filter((nodeMeta) => nodeMeta?.parentId === indexId).length;
      const rest = new Request();

      const res = await rest.sendRequest(
        '/wiki/createLeaf',
        'PUT',
        {
          ...requestTemplate,
          actionType: actionsTypes.$CREATE_LEAF,
          params: {
            ...paramsTemplate,
            query: 'wikiTree',
            item: !item
              ? {
                  ...node,
                  level: 1,
                  path: `0-${index}`,
                  index,
                  accessGroups: node?.accessGroups?.length ? [...node.accessGroups] : ['full'],
                }
              : { ...item },
          },
        },
        true,
      );

      if (res.status !== 200) {
        throw new Error('Bad create');
      }

      if (!item) this.onVisibleModalChange(this.fetchTree.bind(this, null, true));
      else this.fetchTree('', true);
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error(t('wiki_messages_errorCreateLeaf'));
    }
  };

  onDeleteNode = async (params) => {
    const { modelsContext, t } = this.props;
    try {
      const { Request } = modelsContext;
      const rest = new Request();

      const res = await rest.sendRequest(
        '/wiki/deleteLeafs',
        'DELETE',
        {
          ...requestTemplate,
          actionType: actionsTypes.$DELETE_LEAF,
          params,
        },
        true,
      );

      if (!res || res?.status !== 200) {
        throw new Error('Bad delete leaf');
      }

      const { data: { response: { metadata: { deletedCount = 0, ok = 0 } = {} } = {} } = {} } = res;

      if (deletedCount && ok) this.fetchTree('', true);
      message.success(t('wiki_messages_deleteLeaf'));
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      message.error(t('wiki_messages_errorDeleteLeaf'));
    }
  };

  onChangeSelect = (value) => {
    this.setState((state) => {
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
    const { modelsContext } = this.props;
    const { TreeBuilder } = modelsContext;
    return new TreeBuilder(nodeListChildren).buildTree(rootNodeList);
  };

  /**
   * @param {Array<object>} nodeList
   */
  getTreeData = (nodeList) => {
    if (!Array.isArray(nodeList)) return [];

    const rootNodesList = nodeList.filter((node) => node?.parentId === 'root');
    const nodeListChildren = nodeList.filter((node) => node?.parentId !== 'root');

    return this.buildTree(rootNodesList, nodeListChildren);
  };

  onDropdownEvent = (sign = '', id = '', event) => {
    event.stopPropagation();

    if (!sign || !id) return;

    const { metadata = [], t } = this.props;

    const item = metadata.find((node) => node?._id === id);

    if (!item) {
      message.error(t('wiki_messages_leafNotFound'));
      return;
    }

    if (sign === 'add') {
      const { current: { state: { value: title = '' } = {} } = {} } = this.titleRef || {};
      if (!title) return;
      const index = ++metadata.filter((node) => node?.parentId === id).length;

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
      const childrensIds = metadata.reduce((nodeList, node) => {
        if (node?.parentId === id) {
          return [...nodeList, node?._id];
        }
        return nodeList;
      }, []);

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
    const { metadata = [], t } = this.props;

    const listData = this.getTreeData(metadata);

    const loop = (data) =>
      data.reduce((elementsList, it) => {
        const item = {
          ...it,
          children: it?.children ? it.children : [],
        };

        const menu = (
          <Menu className="dropdown-action">
            <Menu.Item key={`add${it?._id}`}>
              <Input autoFocus placeholder={t('wiki_newLeafPlaceholder')} type="text" ref={this.titleRef} />
              <Button
                type="primary"
                className="item-action"
                onClick={this.onDropdownEvent.bind(this, 'add', it?._id)}
              >
                {t('wiki_addLeaf')}
              </Button>
            </Menu.Item>
            <Menu.Item key={`delete${it?._id}`}>
              <Button type="link" onClick={this.onDropdownEvent.bind(this, 'delete', it?._id)}>
                {t('wiki_deleteSelectLeaf')}
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
                <span className="site-tree-search-value">{searchValue}</span>
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
          return [...elementsList, { title, key: item?.path, children: loop(item.children) }];
        }
        return elementsList;
      }, []);

    return loop(listData);
  };

  onSearch = ({ target: { value: searchValue = '' } }) => {
    this.setState({
      ...this.state,
      searchValue,
    });
  };

  /**
   * @param {object} paramsState
   * @param {Function|null} callback
   */
  onChangeWikiPage = async (paramsState, callback = null) => {
    try {
      const { modelsContext } = this.props;
      const { Request } = modelsContext;
      const rest = new Request();
      const res = await rest.sendRequest(
        '/system/wiki/update/single',
        'POST',
        {
          ...requestTemplate,
          actionType: actionsTypes.$UPDATE_WIKI_PAGE,
          params: {
            ...paramsTemplate,
            ...paramsState,
          },
        },
        true,
      );
      const { data: { response = {} } = {} } = res || {};
      if (res?.status !== 200 && res?.status !== 404) {
        throw new Error(`Bad fetch update wikiPage. ${paramsState}`);
      }
      const { metadata = {} } = response || {};
      if (callback) callback(null, metadata);
    } catch (error) {
      if (error?.response?.status !== 404) console.error(error);
      if (callback) callback(null);
    }
  };

  render() {
    const {
      visibleModal = false,
      node: { title = '', accessGroup = [] },
      isLoading: isLoadingState,
      selectedNodeMetadata = null,
      selectedNode = '',
    } = this.state;
    const { _id: id = '' } = selectedNodeMetadata || {};
    const { metadata = [], router: { shouldUpdate = false } = {}, udata = {}, t } = this.props;
    const isLoading = isLoadingState || (shouldUpdate && !metadata?.length);

    return (
      <>
        <div className="wikiModule">
          <div className="wikiModule__controlls">
            <Title classNameTitle="wikiModuleTitle" title={t('wiki_title')} />
            <Button
              disabled={isLoadingState}
              onClick={this.onVisibleModalChange}
              type="primary"
              className="createNode"
            >
              {t('wiki_createNewLeaf')}
            </Button>
          </div>
          <div className="wikiModule__main">
            <div className="col-4">
              {metadata.length ? (
                <>
                  <Search
                    className="wikiModule__searchInput"
                    placeholder={t('wiki_treeSearchPlaceholder')}
                    onChange={this.onSearch}
                  />
                  <Scrollbars autoHide hideTracksWhenNotNeeded>
                    <Tree onSelect={this.onSelect} treeData={this.renderTree()} />
                  </Scrollbars>
                </>
              ) : !isLoading ? (
                <p className="empty-tree">{t('wiki_empty')}</p>
              ) : (
                <Spin size="large" />
              )}
            </div>
            <div className="col-8 viewport-max">
              {selectedNode ? (
                <WikiPage
                  key={id}
                  udata={udata}
                  onChangeWikiPage={this.onChangeWikiPage}
                  metadata={selectedNodeMetadata}
                  selectedNode={selectedNode}
                />
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
                placeholder={t('wiki_treeNamePlaceholder')}
              />
              <Select
                placeholder={t('wiki_accessGroupsPlaceholder')}
                value={accessGroup}
                onChange={this.onChangeSelect}
                mode="multiple"
              >
                <Option value="full">{t('wiki_accessAll')}</Option>
              </Select>
            </div>
          }
        />
      </>
    );
  }
}

const mapStateToProps = (state) => {
  const { router, publicReducer } = state;
  const { udata = {} } = publicReducer;
  const { routeData } = router;
  const { wikiTree: metadata = [] } = routeData['wikiModule'] || {};

  return {
    router,
    udata,
    metadata,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadCurrentData: (props) => dispatch(loadCurrentData(props)),
  };
};

export default compose(
  moduleContextToProps,
  withClientDb,
  connect(mapStateToProps, mapDispatchToProps),
  withTranslation(),
)(WikiModule);
