import React, { useState, useRef, memo, useEffect } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { connect } from 'react-redux';
import { Layout } from 'antd';
import { dragEndTabAction } from 'Redux/actions/tabActions';
import { saveComponentStateAction } from 'Redux/actions/routerActions';
import RightPanel from './RightPanel';
import Tab from './Tab/index';
import { MARGIN_TAB } from './HeaderView.constant';
import { headerViewType } from './HeaderView.types';

const { Header } = Layout;

const HeaderView = memo(
  ({
    tabs,
    goCabinet,
    status,
    shouldUpdate,
    logout,
    udata,
    onSaveComponentState,
    appConfig,
    onDragEndTabAction,
    activeTabEUID,
    cbMenuTabHandler,
    dashboardStrem,
  }) => {
    const [length, setLength] = useState(1);
    const [size, setSize] = useState(160);
    const [sizeParent, setSizeParent] = useState(null);

    const tabsMenuRef = useRef(null);
    const { current: tabsMenuNode = null } = tabsMenuRef || {};

    useEffect(() => {
      const sizes = sizeParent / tabs.length - MARGIN_TAB;
      const counter = ~~(sizeParent / size);

      if (sizeParent === null && tabsMenuNode) {
        setLength(tabs.length);
        setSizeParent(tabsMenuNode.getBoundingClientRect().width);
      }

      if ((tabs.length >= counter && sizeParent !== null) || (tabs.length < length && size < 160)) {
        setLength(tabs.length);
        setSize(sizes);
      }
    }, [sizeParent, size, tabsMenuNode, length, tabs]);

    const reorder = (list, dragIndex, dropIndex) => {
      const [removed] = list.splice(dragIndex, 1);
      list.splice(dropIndex, 0, removed);
      return list;
    };

    const onDragEnd = ({ destination, source }, tabsList) => {
      const { index: indexDest } = destination || {};
      const { index } = source || {};

      if (!destination) return;

      onDragEndTabAction(reorder([...tabsList], index, indexDest));
    };

    const renderTabs = (items) => {
      return (
        <DragDropContext onDragEnd={(event) => onDragEnd(event, items)}>
          <Droppable direction="horizontal" droppableId="droppable">
            {(provided, snapshot) => (
              <div className="droppable-wrapper" ref={provided.innerRef}>
                <ul ref={tabsMenuRef} {...provided.droppableProps} className="tabsMenu">
                  {items.map(({ EUID = '', VALUE = '' }, index) => {
                    return (
                      <Tab
                        hendlerTab={cbMenuTabHandler}
                        active={activeTabEUID === EUID}
                        key={EUID}
                        itemKey={EUID}
                        value={VALUE}
                        sizeTab={size}
                        index={index}
                      />
                    );
                  })}
                </ul>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      );
    };

    const update = () => {
      if (dashboardStrem) dashboardStrem.emit('EventUpdate', true);
    };

    const notificationDep = {
      streamStore: 'streamList',
      streamModule: 'system',
      store: 'redux',
      filterStream: 'uidCreater',
      onSaveComponentState,
    };

    return (
      <Header>
        {tabs ? renderTabs(tabs) : null}
        <RightPanel
          appConfig={appConfig}
          udata={udata}
          shouldUpdate={shouldUpdate}
          status={status}
          goCabinet={goCabinet}
          onLogout={logout}
          onUpdate={update}
          notificationDep={notificationDep}
        />
      </Header>
    );
  },
);

HeaderView.defaultProps = {
  tabArray: [],
  activeTabEUID: 'mainModule',
  activeTabs: [],
  dashboardStrem: null,
  tabs: [],
  goCabinet: null,
  status: '',
  shouldUpdate: false,
  logout: null,
  udata: {},
  onSaveComponentState: null,
  appConfig: {},
  onDragEndTabAction: null,
  cbMenuTabHandler: null,
};

HeaderView.propTypes = headerViewType;

const mapStateTopProps = (state) => {
  const { status = 'online', udata = {}, appConfig } = state.publicReducer;
  const { shouldUpdate = false, routeData = {}, activeTabs } = state.router;
  return {
    activeTabs,
    shouldUpdate,
    status,
    udata,
    routeData,
    appConfig,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    onSaveComponentState: (data) => dispatch(saveComponentStateAction(data)),
    onDragEndTabAction: (payload) => dispatch(dragEndTabAction(payload)),
  };
};

export default connect(mapStateTopProps, mapDispatchToProps)(HeaderView);
export { HeaderView };
