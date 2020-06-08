import React, { useCallback, useMemo, useEffect } from 'react';
import { tabContainerType } from './types';
import clsx from 'clsx';

const TabContainer = (props) => {
  const { isBackground, visible, children, className, isPortal, isTab, onChangeVisibleAction } = props;

  const changeActionVisible = useCallback(onChangeVisibleAction, []);
  const isVisibility = useMemo(() => (isBackground || visible) && !!children, [
    isBackground,
    visible,
    children,
  ]);
  const isValidTabType = useMemo(() => !isPortal || (isPortal && isTab), [isPortal, isTab]);
  const shouldRender = isVisibility && isValidTabType;

  const visibilityClass = useMemo(
    () =>
      clsx(
        'tabContainer',
        visible && shouldRender ? 'visible' : 'hidden',
        className ? className : null,
        !visible && isBackground && shouldRender ? 'isBackground' : null,
      ),
    [visible, className, isBackground, shouldRender],
  );

  useEffect(() => {
    const shouldChange = isPortal && isTab;
    if (changeActionVisible && shouldChange) changeActionVisible(null, shouldChange);
  }, [isPortal, isTab, changeActionVisible]);

  return (
    <>
      {shouldRender ? (
        <div key={children.key + 'tab'} className={visibilityClass}>
          {children}
        </div>
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
