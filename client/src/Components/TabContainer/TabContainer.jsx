import React from 'react';
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

export default TabContainer;
