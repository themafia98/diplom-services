import React, { useState, useRef, memo, useEffect, useMemo, useCallback } from 'react';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';
import { useDispatch, useSelector } from 'react-redux';
import { Layout } from 'antd';
import RightPanel from './RightPanel';
import Tab from './Tab/Tab';
import { MARGIN_TAB } from './HeaderView.constant';
import { headerViewType } from './HeaderView.types';
import { setEndDndTab } from 'Redux/reducers/routerReducer.slice';

const { Header } = Layout;

const HeaderView = memo(
  ({ tabs, goCabinet, logout, activeTabEUID, cbMenuTabHandler, dashboardStream, webSocket }) => {
    const dispatch = useDispatch();

    const [length, setLength] = useState(1);
    const [size, setSize] = useState(160);
    const [sizeParent, setSizeParent] = useState(null);

    const tabsMenuRef = useRef(null);

    const { shouldUpdate, status, appConfig } = useSelector((state) => {
      const { status, appConfig } = state.publicReducer;
      const { shouldUpdate = false } = state.router;
      return {
        shouldUpdate,
        status,
        appConfig,
      };
    });

    useEffect(() => {
      if (!tabs) {
        return;
      }

      const sizes = sizeParent / tabs.length - MARGIN_TAB;
      const counter = ~~(sizeParent / size);

      if (sizeParent === null && tabsMenuRef.current) {
        setLength(tabs.length);
        setSizeParent(tabsMenuRef.current.getBoundingClientRect().width);
      }

      if ((tabs.length >= counter && sizeParent !== null) || (tabs.length < length && size < 160)) {
        setLength(tabs.length);
        setSize(sizes);
      }
    }, [sizeParent, size, length, tabs]);

    const reorder = (list, dragIndex, dropIndex) => {
      const [removed] = list.splice(dragIndex, 1);
      list.splice(dropIndex, 0, removed);
      return list;
    };

    const onDragEnd = useCallback(
      ({ destination, source }, tabsList) => {
        const { index: indexDest } = destination || {};
        const { index } = source || {};

        if (!destination) return;

        dispatch(setEndDndTab(reorder([...tabsList], index, indexDest)));
      },
      [dispatch],
    );

    const createHandleDragEnd = useCallback((tabs) => (event) => onDragEnd(event, tabs), [onDragEnd]);

    const tabsItems = useMemo(() => {
      if (!tabs) {
        return null;
      }

      return (
        <DragDropContext onDragEnd={createHandleDragEnd(tabs)}>
          <Droppable direction="horizontal" droppableId="droppable">
            {(provided) => (
              <div className="droppable-wrapper" ref={provided.innerRef}>
                <ul ref={tabsMenuRef} {...provided.droppableProps} className="tabsMenu">
                  {tabs.map(({ EUID, VALUE }, index) => {
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
    }, [activeTabEUID, cbMenuTabHandler, createHandleDragEnd, size, tabs]);

    const update = () => {
      if (dashboardStream) dashboardStream.emit('EventUpdate', true);
    };

    const notificationDep = {
      streamStore: 'streamList',
      streamModule: 'system',
      store: 'redux',
      filterStream: 'uidCreater',
    };

    return (
      <Header>
        {tabsItems}
        <RightPanel
          appConfig={appConfig}
          shouldUpdate={shouldUpdate}
          status={status}
          goCabinet={goCabinet}
          onLogout={logout}
          onUpdate={update}
          notificationDep={notificationDep}
          webSocket={webSocket}
        />
      </Header>
    );
  },
);

HeaderView.defaultProps = {
  goCabinet: null,
};

HeaderView.propTypes = headerViewType;

export default HeaderView;
