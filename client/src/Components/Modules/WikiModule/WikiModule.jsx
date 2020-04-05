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
      });
    }
  };

  onCreate = async event => {
    const { node } = this.state;
    const { metadata = [] } = this.props;
    const { Request } = this.context;
    if (!Request) return;
    try {
      const index = metadata?.length + 1;
      const rest = new Request();
      const res = await rest.sendRequest('/wiki/createLeaf', 'PUT', {
        type: 'wikiTree',
        item: {
          ...node,
          level: 1,
          path: `0-${index}`,
        },
      });

      if (res.status !== 200) {
        throw new Error('Bad create');
      }

      this.onVisibleModalChange(this.fetchTree.bind(this, '', true));
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

  renderTree = () => {
    const { metadata = [] } = this.props;
    return metadata.map(node => {
      return <TreeNode title={node?.title} key={node?.path}></TreeNode>;
    });
  };

  render() {
    const {
      visibleModal = false,
      node: { title = '', accessGroup = [] },
      isLoading: isLoadingState,
      selectedNode = null,
    } = this.state;
    const { _id: key = '' } = selectedNode || {};
    const { metadata = [], router: { shouldUpdate = false } = {} } = this.props;
    const isLoading = isLoadingState || (shouldUpdate && !metadata?.length);

    const menu = (
      <Menu>
        <Menu.Item key="1">Добавить ветку</Menu.Item>
        <Menu.Item key="2">Удалить ветку</Menu.Item>
      </Menu>
    );

    // TODO: antd tree example
    //   <TreeNode title="Главная страница" key="0-0">
    //   <TreeNode title="Глобальные уведомления" key="0-0-0" isLeaf />
    //   <TreeNode title="Таблица сотрудников" key="0-0-1" isLeaf />
    // </TreeNode>
    // <TreeNode title="Кабинет" key="0-1">
    //   <TreeNode title="Карточка пользователся" key="0-1-0" isLeaf />
    //   <TreeNode title="Журнал активности" key="0-1-1" isLeaf />
    // </TreeNode>

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
                <DirectoryTree onSelect={this.onSelect} onExpand={this.onExpand}>
                  {this.renderTree()}
                </DirectoryTree>
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
          onOkey={this.onCreate}
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
