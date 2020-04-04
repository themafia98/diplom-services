import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { Tree, Button, Input, Select, Dropdown, Menu, message } from 'antd';
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
    visibleModal: false,
    metadata: [],
    node: {
      title: '',
      accessGroup: [],
    },
  };

  componentDidMount = async () => {
    this.fetchTree('didMount');
  };

  onSelect = (keys, event) => {
    console.log('Trigger Select', keys, event);
  };

  onExpand = () => {
    console.log('Trigger Expand');
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

  fetchTree = async (mode = '') => {
    const { metadata: metadataState = [] } = this.state;
    const { Request } = this.context;
    if (!Request) return;
    try {
      const rest = new Request();
      const res = await rest.sendRequest('/wiki/list');

      if (res.status !== 200) {
        throw new Error('Bad load wiki list');
      }

      const { data: { response: { metadata = [] } = {} } = {} } = res;

      const metadataByMode =
        mode === 'didMount' ? metadata : _.uniqBy([...metadataState, ...metadata], '_id');

      this.setState({ metadata: metadataByMode });
    } catch (error) {
      console.error(error);
      message.error('Ошибка загрузки дерева');
    }
  };

  onCreate = async event => {
    const { node, metadata = [] } = this.state;
    const { Request } = this.context;
    if (!Request) return;
    try {
      debugger;
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

      this.onVisibleModalChange(this.fetchTree);
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
    const { metadata = [] } = this.state;
    return metadata.map((node, index) => <TreeNode title={node?.title} key={node?.path}></TreeNode>);
  };

  render() {
    const {
      visibleModal = false,
      node: { title = '', accessGroup = [] },
    } = this.state;

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
          <Button onClick={this.onVisibleModalChange} type="primary" className="createNode">
            Создать новую ветку
          </Button>
          <div className="wikiModule__main">
            <div className="col-6">
              <DirectoryTree multiple defaultExpandAll onSelect={this.onSelect} onExpand={this.onExpand}>
                {this.renderTree()}
              </DirectoryTree>
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

export default WikiModule;
