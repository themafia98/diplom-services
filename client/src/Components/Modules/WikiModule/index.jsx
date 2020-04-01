import React from 'react';
import PropTypes from 'prop-types';

import { Tree } from 'antd';

import TitleModule from '../../TitleModule';

const { TreeNode, DirectoryTree } = Tree;

class WikiModule extends React.PureComponent {
  static propTypes = {
    onErrorRequstAction: PropTypes.func.isRequired,
    path: PropTypes.string.isRequired,
  };

  state = {
    isLoading: false,
  };

  onSelect = (keys, event) => {
    console.log('Trigger Select', keys, event);
  };

  onExpand = () => {
    console.log('Trigger Expand');
  };

  render() {
    return (
      <div className="wikiModule">
        <TitleModule classNameTitle="wikiModuleTitle" title="Википедия системы" />
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
    );
  }
}

export default WikiModule;
