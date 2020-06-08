import React from 'react';
import Node from 'Models/Node';
import modalContext from 'Models/context';
import actionPortalType from './types';

class ActionPortal extends React.Component {
  state = {
    visible: false,
  };
  /** node - instanse portal */
  node = new Node('div', 'action-root');
  static contextType = modalContext;

  static getDerivedStateFromProps = (props, state) => {
    const { visible: visibleState = false } = state;

    if (visibleState !== props?.visible) {
      return {
        ...state,
        visible: props.visible,
      };
    }

    return state;
  };

  componentDidMount = () => {
    this.node.append();
  };

  componentWillUnmount = () => {
    if (this.node) this.node.remove();
  };

  render() {
    const { action: actionProps = null, children } = this.props;
    const { visible = false } = this.state;
    const {
      config: { actionRoot: { visibilityActionRoot = false } = {} },
    } = this.context;

    if (!children || !visibilityActionRoot || !visible) return null;
    const action = actionProps ? (
      actionProps
    ) : (
      <div style={visible ? null : { display: 'none' }} className="action-render">
        {children}
      </div>
    );

    return !action ? null : this.node.create(action);
  }
}

ActionPortal.defaultProps = {
  action: null,
  children: null,
};

ActionPortal.propTypes = actionPortalType;

export default ActionPortal;
