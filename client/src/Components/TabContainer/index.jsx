import React from 'react';
import clsx from 'clsx';

class TabContainer extends React.PureComponent {
  render() {
    const { isBackground, visible, children, className = '' } = this.props;

    if (isBackground || visible) {
      return (
        <div
          key={children.key + 'tab'}
          className={clsx('tabContainer', visible ? 'visible' : 'hidden', className ? className : null)}
        >
          {children}
        </div>
      );
    } else return null;
  }
}

export default TabContainer;
