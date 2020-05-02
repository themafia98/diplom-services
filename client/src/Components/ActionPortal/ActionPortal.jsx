// @ts-nocheck
import Node from '../../Models/Node';
import React from 'react';
import { Button } from 'antd';

class ActionPortal extends React.PureComponent {
  node = new Node('div', 'action-root');
  componentDidMount = () => {
    this.node.append();
  };

  componentWillUnmount = () => {
    this.node.remove();
  };

  render() {
    const { action: actionProps = null } = this.props;
    const action = actionProps ? (
      actionProps
    ) : (
      <div className="action-button">
        <Button type="primary">Чат</Button>
      </div>
    );

    if (!action) return null;

    return this.node.create(action);
  }
}

export default ActionPortal;
