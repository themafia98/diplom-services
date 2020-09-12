import React, { useCallback, useMemo, useEffect } from 'react';
import { tabContainerType } from './TabContainer.types';
import clsx from 'clsx';
import { useModuleState, useModuleActions } from 'Components/Helpers/moduleState/hooks';
import { withModuleState } from 'Components/Helpers';

const TabContainer = ({ classNameTab, children, ...props }) => {
  const moduleContext = useModuleState();
  const moduleActionsContext = useModuleActions();

  const { setVisibility = null } = moduleActionsContext;
  const { visibility = false, availableBackground = false } = moduleContext;

  /**
   * actual visibile state
   */
  const { actualParams = {} } = props;
  const { isBackground = availableBackground, visible = visibility } = actualParams;

  const setVisibilityMemo = useCallback(setVisibility, [setVisibility, visibility, availableBackground]);

  const visibilityClass = useMemo(
    () =>
      clsx(
        'tabContainer',
        visibility ? 'visible' : 'hidden',
        classNameTab && classNameTab,
        !visibility && availableBackground ? 'isBackground' : null,
      ),
    [visibility, availableBackground, classNameTab],
  );

  useEffect(() => {
    if (setVisibilityMemo)
      setVisibilityMemo({
        visibility: visible,
        availableBackground: isBackground,
      });
  }, [isBackground, visible, setVisibilityMemo]);

  return (
    <>
      {(visibility || isBackground) && children ? (
        <div key={children.key + 'tab'} className={visibilityClass}>
          {children}
        </div>
      ) : null}
    </>
  );
};
TabContainer.defaultProps = {
  actualParams: {},
  classNameTab: 'module',
  children: null,
};
TabContainer.propTypes = tabContainerType;
export default withModuleState(TabContainer);
