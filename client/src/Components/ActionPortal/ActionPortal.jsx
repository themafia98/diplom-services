import React, { useState, useMemo, useEffect } from 'react';
import Node from 'Models/Node';
import actionPortalType from './types';

const ActionPortal = ({ visible: visibleProps, action: actionProps, children, appConfig }) => {
  const { actionRoot: { visibilityActionRoot = false } = {} } = appConfig;

  const [visible, setVisible] = useState(false);

  /** node - instanse portal */
  const node = useMemo(() => new Node('div', 'action-root'), []);

  useEffect(() => {
    if (visibleProps !== visible) setVisible(visibleProps);
  }, [visibleProps, visible]);

  useEffect(() => node.append(), [node], [node]);

  const action = useMemo(() => {
    if (!children || !visibilityActionRoot || !visible) return null;

    if (actionProps) return actionProps;

    return (
      <div style={visible ? null : { display: 'none' }} className="action-render">
        {children}
      </div>
    );
  }, [actionProps, visible, children, visibilityActionRoot]);

  return !action || !node ? null : node.create(action);
};

ActionPortal.defaultProps = {
  visible: false,
  appConfig: {},
  action: null,
  children: null,
};

ActionPortal.propTypes = actionPortalType;

export default ActionPortal;
