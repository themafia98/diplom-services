// @ts-nocheck
import React from 'react';
import { tabContainerType } from './types';
import clsx from 'clsx';

const TabContainer = (props) => {
  const { isBackground, visible, children, className = '' } = props;

  return (
    <>
      {isBackground || visible ? (
        <div
          key={children.key + 'tab'}
          className={clsx('tabContainer', visible ? 'visible' : 'hidden', className ? className : null)}
        >
          {children}
        </div>
      ) : null}
    </>
  );
};
TabContainer.defaultProps = {
  className: 'module',
  isBackground: false,
  visible: false,
};
TabContainer.propTypes = tabContainerType;
export default TabContainer;
