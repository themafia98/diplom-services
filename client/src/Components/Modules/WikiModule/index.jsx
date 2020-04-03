import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';

import { Tree, Button, Input, Select, Dropdown, Menu } from 'antd';
import ModalWindow from '../../ModalWindow';
import TitleModule from '../../TitleModule';

const { TreeNode, DirectoryTree } = Tree;
const { Option } = Select;

class WikiModule extends React.PureComponent {
  static propTypes = {
    onErrorRequstAction: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
  };

  state = {
    isLoading: false,
    visibleModal: false,
    node: {
      title: '',
      accessGroup: [],
    },
  };

  onSelect = (keys, event) => {
    console.log('Trigger Select', keys, event);
  };

  onExpand = () => {
    console.log('Trigger Expand');
  };

  onVisibleModalChange = () => {
    this.setState(state => {
      return {
        ...state,
        visibleModal: !state?.visibleModal,
        node: {
          title: '',
          accessGroup: [],
        },
      };
    });
  };

  onCreate = event => {
    console.log(event);
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
                <TreeNode title="Главная страница" key="0-0">
                  <TreeNode title="Глобальные уведомления" key="0-0-0" isLeaf />
                  <TreeNode title="Таблица сотрудников" key="0-0-1" isLeaf />
                </TreeNode>
                <TreeNode title="Кабинет" key="0-1">
                  <TreeNode title="Карточка пользователся" key="0-1-0" isLeaf />
                  <TreeNode title="Журнал активности" key="0-1-1" isLeaf />
                </TreeNode>
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
