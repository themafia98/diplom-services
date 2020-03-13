import React from 'react';
import PropTypes from 'prop-types';

import { Tree } from 'antd';

import TitleModule from '../../TitleModule';

const { TreeNode, DirectoryTree } = Tree;

class DocumentModule extends React.PureComponent {
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
      <div className="documentModule">
        <TitleModule classNameTitle="documentModuleTitle" title="Документы" />
        <div className="documentModule__main">
          <div className="col-6">
            <DirectoryTree multiple defaultExpandAll onSelect={this.onSelect} onExpand={this.onExpand}>
              <TreeNode title="parent 0" key="0-0">
                <TreeNode title="leaf 0-0" key="0-0-0" isLeaf />
                <TreeNode title="leaf 0-1" key="0-0-1" isLeaf />
              </TreeNode>
              <TreeNode title="parent 1" key="0-1">
                <TreeNode title="leaf 1-0" key="0-1-0" isLeaf />
                <TreeNode title="leaf 1-1" key="0-1-1" isLeaf />
              </TreeNode>
            </DirectoryTree>
          </div>
        </div>
      </div>
    );
  }
}

export default DocumentModule;
