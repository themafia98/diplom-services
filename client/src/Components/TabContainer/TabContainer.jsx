import React, { useCallback, useMemo, useEffect } from 'react';
import { tabContainerType } from './types';
import clsx from 'clsx';
import ActionPortal from 'Components/ActionPortal';

const TabContainer = (props) => {
  const { isBackground, visible, children, className, isPortal, isTab, onChangeVisibleAction } = props;

  const changeActionVisible = useCallback(onChangeVisibleAction, []);

  const visibilityClass = useMemo(
    () =>
      clsx(
        'tabContainer',
        visible ? 'visible' : 'hidden',
        className ? className : null,
        isBackground ? 'isBackground' : null,
      ),
    [visible, className, isBackground],
  );

  useEffect(() => {
    const shouldChange = isPortal && isTab;
    if (changeActionVisible && shouldChange) changeActionVisible(null, shouldChange);
  }, [isPortal, isTab, changeActionVisible]);

  return (
    <>
      {(isBackground || visible) && (!isPortal || (isPortal && isTab)) ? (
        <div key={children.key + 'tab'} className={visibilityClass}>
          {children}
        </div>
      ) : isPortal && !isTab ? (
        <ActionPortal visible={isPortal}>{children}</ActionPortal>
      ) : null}
    </>
  );
};
TabContainer.defaultProps = {
  className: 'module',
  onChangeVisibleAction: null,
  isBackground: false,
  visible: false,
  isPortal: false,
  isTab: false,
};
TabContainer.propTypes = tabContainerType;
export default TabContainer;
