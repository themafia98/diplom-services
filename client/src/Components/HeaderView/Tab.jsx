import React, { useMemo, useCallback } from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { tabType } from './types';
import clsx from 'clsx';
import { Icon, Tooltip } from 'antd';

const Tab = ({ value, active, hendlerTab, itemKey, index, sizeTab }) => {
  const callbackHendlerTab = useCallback(hendlerTab, []);

  const eventHandler = (event) => {
    event.stopPropagation();

    callbackHendlerTab(event, itemKey, 'open');
  };

  const eventCloseHandler = (event) => {
    event.stopPropagation();

    if (itemKey === 'mainModule') return;

    callbackHendlerTab(event, itemKey, 'close');
  };

  const getTabStyle = useCallback(() => {
    const recalcSize =
      sizeTab > 55
        ? sizeTab - sizeTab * 0.15
        : sizeTab > 43
        ? sizeTab - sizeTab * 0.2
        : sizeTab - sizeTab * 0.3;
    return {
      width: `${recalcSize}px`,
      maxWidth: `${recalcSize}px`,
      minWidth: `${recalcSize}px`,
    };
  }, [sizeTab]);

  const getIconStyle = useCallback(() => {
    return {
      left: sizeTab < 60 ? '85%' : sizeTab < 90 ? '90%' : sizeTab < 102 ? '93%' : null,
    };
  }, [sizeTab]);

  const tabStyle = useMemo(() => getTabStyle(), [getTabStyle]);
  const closeIconStyle = useMemo(() => getIconStyle(), [getIconStyle]);

  return (
    <Draggable key={`${itemKey}-wrapper`} draggableId={itemKey} index={index}>
      {(provided) => (
        <div
          className="draggable-wrapper"
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
        >
          <li
            style={tabStyle}
            onClick={callbackHendlerTab ? eventHandler : null}
            className={clsx(active ? 'active' : null)}
            key={itemKey}
          >
            <span className={clsx(active ? 'tabWrapper-content selected' : 'tabWrapper-content')}>
              <Tooltip title={value} placement="bottom">
                <span className="tab-content">{value}</span>
              </Tooltip>
            </span>
            <Icon
              style={closeIconStyle}
              className={clsx('closeTab')}
              onClick={callbackHendlerTab ? eventCloseHandler : null}
              type="close"
            />
          </li>
        </div>
      )}
    </Draggable>
  );
};

Tab.defaultProps = {
  hendlerTab: null,
  itemKey: null,
  value: '',
  active: false,
  index: 0,
  sizeTab: 0,
};

Tab.propTypes = tabType;

export default Tab;
