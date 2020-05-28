import React from 'react';
import { Draggable } from 'react-beautiful-dnd';
import { tabType } from './types';
import clsx from 'clsx';
import { Icon, Tooltip } from 'antd';

class Tab extends React.PureComponent {
  static propTypes = tabType;
  static defaultProps = {
    hendlerTab: null,
    itemKey: null,
  };

  eventHandler = (event) => {
    const { hendlerTab: callbackHendlerTab, itemKey } = this.props;
    event.stopPropagation();
    callbackHendlerTab(event, itemKey, 'open');
  };

  eventCloseHandler = (event) => {
    const { hendlerTab: callbackHendlerTab, itemKey } = this.props;
    event.stopPropagation();
    if (itemKey === 'mainModule') return;
    // cbCallbackResize(resize);
    callbackHendlerTab(event, itemKey, 'close');
  };

  getTabStyle = () => {
    const { sizeTab = 10 } = this.props;
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
  };

  getIconStyle = () => {
    const { sizeTab = 10 } = this.props;
    return {
      left: sizeTab < 60 ? `85%` : sizeTab < 90 ? `90%` : sizeTab < 102 ? `93%` : null,
    };
  };

  tab = null;
  tabRef = (node) => (this.tab = node);

  render() {
    const { value, active, hendlerTab: callbackHendlerTab, itemKey, index = 0 } = this.props;
    const tabStyle = this.getTabStyle();
    const closeIconStyle = this.getIconStyle();
    return (
      <Draggable key={`${itemKey}-wrapper`} draggableId={itemKey} index={index}>
        {(provided, snapshot) => (
          <div
            className="draggable-wrapper"
            ref={provided.innerRef}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
          >
            <li
              style={tabStyle}
              onClick={callbackHendlerTab ? this.eventHandler : null}
              className={clsx(active ? 'active' : null)}
              key={itemKey}
              ref={this.tabRef}
            >
              <span className={clsx(active ? 'tabWrapper-content selected' : 'tabWrapper-content')}>
                <Tooltip title={value} placement="bottom">
                  <span className="tab-content">{value}</span>
                </Tooltip>
              </span>
              <Icon
                style={closeIconStyle}
                className={clsx('closeTab')}
                onClick={callbackHendlerTab ? this.eventCloseHandler : null}
                type="close"
              />
            </li>
          </div>
        )}
      </Draggable>
    );
  }
}

export default Tab;
