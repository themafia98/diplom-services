import React from 'react';
import { tabContainerType } from './types';
import clsx from 'clsx';

const TabContainer = props => {
  const { isBackground, visible, children, className = '' } = props;

  return (
    <React.Fragment>
      {isBackground || visible ? (
        <div
          key={children.key + 'tab'}
          className={clsx('tabContainer', visible ? 'visible' : 'hidden', className ? className : null)}
        >
          {children}
        </div>
      ) : null}
    </React.Fragment>
  );
};
TabContainer.defaultProps = {
  className: 'module',
  isBackground: false,
  visible: false,
};
TabContainer.propTypes = tabContainerType;
export default TabContainer;
