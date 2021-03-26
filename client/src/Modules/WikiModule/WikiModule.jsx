import React, { memo, useState, useEffect, useCallback, useContext, useRef, useMemo } from 'react';
import { wikiModuleType } from './WikiModule.types';
import { useDispatch, useSelector } from 'react-redux';
import _ from 'lodash';
import Scrollbars from 'react-custom-scrollbars';
import { loadCurrentData } from 'Redux/middleware/routerReducer.thunk';
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
import { useTranslation } from 'react-i18next';
import ModelContext from 'Models/context';

const WikiModule = memo(({ moduleContext, clientDB }) => {
  const { Request, TreeBuilder } = useContext(ModelContext);
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const [isLoading, setLoading] = useState(false);
  const [visibleModal, setVisibleModal] = useState(false);
  const [selectedNode, setSelectedNode] = useState('');
  const [searchValue, setSearchValue] = useState('');
  const [node, setNode] = useState({});
  const [visibleDropdownId, setVisbileDropdownId] = useState(null);
  const [visibleDropdown, setVisibleDropdown] = useState(false);
  const [selectedNodeMetadata, setSelectedNodeMetadata] = useState(null);

  const titleRef = useRef(null);

  const { shouldUpdate, routeData, metadata } = useSelector(({ router }) => {
    const { shouldUpdate = false, routeData } = router;
    const { wikiTree: metadata } = routeData['wikiModule'] || {};
    return {
      shouldUpdate,
      routeData,
      metadata,
    };
  });

  const fetchTree = useCallback(
    async (mode = '', forceUpdate = false) => {
      const { visibility = false } = moduleContext;

      const isModuleUpdate = shouldUpdate && visibility && !routeData['wikiModule']?.load;

      setLoading(true);

      if (!isLoading && (forceUpdate || mode === 'didMount' || isModuleUpdate)) {
        dispatch(
          loadCurrentData({
            action: actionPath.$LOAD_WIKI_TREE,
            path: 'wikiModule',
            sortBy: 'index',
            clientDB,
          }),
        );

        setLoading(false);
      }
    },
    [clientDB, dispatch, isLoading, moduleContext, routeData, shouldUpdate],
  );

  useEffect(() => {
    fetchTree();
  }, [fetchTree]);

  const onSelect = (keys, event) => {
    let selectedNodeMetadata = null;
    let selectedNode = null;

    if (!metadata) {
      return;
    }

    if (keys?.length) {
      selectedNode = keys[0];
      selectedNodeMetadata = metadata.find((meta) => meta?.path === selectedNode);
    }

    setSelectedNode(selectedNode);
    setSelectedNodeMetadata(selectedNodeMetadata);
  };

  const onVisibleModalChange = useCallback(
    (callback) => {
      setVisibleModal(!visibleModal);
      setNode({ title: '', accessGroup: [] });

      if (typeof callback === 'function') {
        callback();
      }
    },
    [visibleModal],
  );

  const onCreateNode = useCallback(
    async (item = null) => {
      if (!metadata) {
        return;
      }

      try {
        const newNode = !node?.parentId ? { ...node, parentId: 'root' } : { ...node };
        const indexId = !item ? 'root' : item?.parentId;

        if (indexId === null) {
          message.error(t('wiki_messages_errorCreateLeaf'));
          onVisibleModalChange();
          return;
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
                    ...newNode,
                    level: 1,
                    path: `0-${index}`,
                    index,
                    accessGroups: newNode?.accessGroups?.length ? [...newNode.accessGroups] : ['full'],
                  }
                : { ...item },
            },
          },
          true,
        );

        if (res.status !== 200) {
          throw new Error('Bad create');
        }

        if (!item) {
          onVisibleModalChange(fetchTree.bind(this, null, true));
          return;
        }

        fetchTree('', true);
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.error(error);
        }
        message.error(t('wiki_messages_errorCreateLeaf'));
      }
    },
    [Request, fetchTree, metadata, node, onVisibleModalChange, t],
  );

  const onDeleteNode = useCallback(
    async (params) => {
      try {
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

        const { deletedCount = 0, ok = 0 } = res.data.response?.metadata || {};

        if (deletedCount && ok) {
          fetchTree('', true);
        }

        message.success(t('wiki_messages_deleteLeaf'));
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.error(error);
        }

        message.error(t('wiki_messages_errorDeleteLeaf'));
      }
    },
    [Request, fetchTree, t],
  );

  const onChangeSelect = (value) => {
    setNode({ ...node, accessGroup: value });
  };

  const onChangeTitleNode = ({ target }) => setNode({ ...node, title: target.value });

  const buildTree = useCallback(
    (rootNodeList, nodeListChildren) => new TreeBuilder(nodeListChildren).buildTree(rootNodeList),
    [TreeBuilder],
  );

  const getTreeData = useCallback(
    (nodeList) => {
      if (!Array.isArray(nodeList)) {
        return [];
      }

      const rootNodesList = nodeList.filter((node) => node?.parentId === 'root');
      const nodeListChildren = nodeList.filter((node) => node?.parentId !== 'root');

      return buildTree(rootNodesList, nodeListChildren);
    },
    [buildTree],
  );

  const onDropdownEvent = useCallback(
    (sign = '', id = '', event) => {
      event.stopPropagation();

      if (!sign || !id) {
        return;
      }

      if (!metadata) {
        return;
      }

      const item = metadata.find((node) => node?._id === id);

      if (!item) {
        message.error(t('wiki_messages_leafNotFound'));
        return;
      }

      if (sign === 'add') {
        const title = titleRef.current?.state?.value;

        if (!title) return;

        const index = ++metadata.filter((node) => node?.parentId === id).length;

        onCreateNode(
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

        onDeleteNode(
          {
            queryParams: {
              ids: _.uniq([...childrensIds, parentId]),
            },
          },
          event,
        );
      }
    },
    [metadata, onCreateNode, onDeleteNode, t],
  );

  const onVisibleChange = (id, visible) => {
    setVisbileDropdownId(visible ? id : null);
    setVisibleDropdown(visible);
  };

  const tree = useMemo(() => {
    if (!metadata) {
      return;
    }

    const listData = getTreeData(metadata);

    const loop = (data) =>
      data.reduce((elementsList, it) => {
        const item = {
          ...it,
          children: it?.children ? it.children : [],
        };

        const menu = (
          <Menu className="dropdown-action">
            <Menu.Item key={`add${it?._id}`}>
              <Input autoFocus placeholder={t('wiki_newLeafPlaceholder')} type="text" ref={titleRef} />
              <Button
                type="primary"
                className="item-action"
                onClick={onDropdownEvent.bind(this, 'add', it?._id)}
              >
                {t('wiki_addLeaf')}
              </Button>
            </Menu.Item>
            <Menu.Item key={`delete${it?._id}`}>
              <Button type="link" onClick={onDropdownEvent.bind(this, 'delete', it?._id)}>
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
              visible={visibleDropdownId === it?._id && visibleDropdown}
              onVisibleChange={onVisibleChange.bind(this, it?._id)}
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
              visible={visibleDropdownId === it?._id && visibleDropdown}
              onVisibleChange={onVisibleChange.bind(this, it?._id)}
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
  }, [getTreeData, metadata, onDropdownEvent, searchValue, t, visibleDropdown, visibleDropdownId]);

  const onSearch = ({ target }) => setSearchValue(target.value);

  const onChangeWikiPage = useCallback(
    async (paramsState, callback = null) => {
      try {
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
        const { response = {} } = res.data;

        if (res.status !== 200 && res.status !== 404) {
          throw new Error(`Bad fetch update wikiPage. ${paramsState}`);
        }

        if (callback) {
          callback(null, response.metadata);
        }
      } catch (error) {
        if (error?.response?.status !== 404) {
          console.error(error);
        }

        if (callback) {
          callback(null);
        }
      }
    },
    [Request],
  );

  const { title = '', accessGroup = [] } = node;

  const { _id: id = '' } = selectedNodeMetadata || {};

  const isLoadingStatus = isLoading || (shouldUpdate && !metadata?.length);

  return (
    <>
      <div className="wikiModule">
        <div className="wikiModule__controlls">
          <Title classNameTitle="wikiModuleTitle" title={t('wiki_title')} />
          <Button disabled={isLoading} onClick={onVisibleModalChange} type="primary" className="createNode">
            {t('wiki_createNewLeaf')}
          </Button>
        </div>
        <div className="wikiModule__main">
          <div className="col-4">
            {metadata?.length ? (
              <>
                <Input.Search
                  className="wikiModule__searchInput"
                  placeholder={t('wiki_treeSearchPlaceholder')}
                  onChange={onSearch}
                />
                <Scrollbars autoHide hideTracksWhenNotNeeded>
                  <Tree onSelect={onSelect} treeData={tree} />
                </Scrollbars>
              </>
            ) : !isLoadingStatus ? (
              <p className="empty-tree">{t('wiki_empty')}</p>
            ) : (
              <Spin size="large" />
            )}
          </div>
          <div className="col-8 viewport-max">
            {selectedNode ? (
              <WikiPage
                key={id}
                onChangeWikiPage={onChangeWikiPage}
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
        onOkey={onCreateNode.bind(this, null)}
        onReject={onVisibleModalChange}
        content={
          <div className="modal-content">
            <Input
              value={title}
              onChange={onChangeTitleNode}
              type="text"
              placeholder={t('wiki_treeNamePlaceholder')}
            />
            <Select
              placeholder={t('wiki_accessGroupsPlaceholder')}
              value={accessGroup}
              onChange={onChangeSelect}
              mode="multiple"
            >
              <Select.Option value="full">{t('wiki_accessAll')}</Select.Option>
            </Select>
          </div>
        }
      />
    </>
  );
});

WikiModule.propTypes = wikiModuleType;

export default compose(moduleContextToProps, withClientDb)(WikiModule);
