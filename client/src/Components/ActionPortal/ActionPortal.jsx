// @ts-nocheck
import Node from '../../Models/Node';
import modalContext from '../../Models/context';
import React from 'react';
import { Button } from 'antd';

class ActionPortal extends React.PureComponent {
  state = {
    visible: false,
  };
  static contextType = modalContext;

  node = new Node('div', 'action-root');
  componentDidMount = () => {
    this.node.append();
  };

  componentWillUnmount = () => {
    this.node.remove();
  };

  onChangeVisible = () => {
    this.setState((state) => {
      return {
        ...this.state,
        visible: !state.visible,
      };
    });
  };

  render() {
    const { action: actionProps = null, renderComponent = null } = this.props;
    const {
      config: { actionRoot: { visibilityActionRoot = false } = {} },
    } = this.context;

    if (!renderComponent || !visibilityActionRoot) return null;
    const action = actionProps ? (
      actionProps
    ) : (
      <>
        <div className="action-button">
          <Button onClick={this.onChangeVisible} type="primary">
            Чат
          </Button>
        </div>
        <div style={this.state.visible ? null : { display: 'none' }} className="action-render">
          {renderComponent}
        </div>
      </>
    );

    if (!action) return null;

    return this.node.create(action);
  }
}

export default ActionPortal;
