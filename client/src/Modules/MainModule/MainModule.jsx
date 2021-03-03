import React, { memo, useRef, useState, useEffect, useCallback } from 'react';
import { mainModuleType } from './MainModule.types';
import { Calendar } from 'antd';
import ClockWidjet from 'Components/ClockWidjet/index';
import TableView from 'Components/TableView';
import StreamBox from 'Components/StreamBox';
import TitleModule from 'Components/TitleModule';
import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import { routeParser } from 'Utils';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';
import { withClientDb } from 'Models/ClientSideDatabase';
import actionPath from 'actions.path';
import { useDispatch, useSelector } from 'react-redux';

const MainModule = memo(({ moduleContext, clientDB }) => {
  const dispatch = useDispatch();

  const [tableViewHeight, setTableViewHeight] = useState(300);

  const rightColumnRef = useRef(null);
  const widgetsContainerRef = useRef(null);

  const { visibilityWidgets } = useSelector((state) => {
    const { publicReducer } = state;
    const { appConfig } = publicReducer;
    return {
      visibilityWidgets: appConfig?.visibilityWidgets,
    };
  });

  const onResizeWindow = useCallback(() => {
    const { visibility = false } = moduleContext;
    const { current: rightColumnNode } = rightColumnRef || {};
    const { current: widgetContainerNode } = widgetsContainerRef || {};
    if (!visibility || !rightColumnNode) return;

    const { height: heightColumn = 0 } = rightColumnNode.getBoundingClientRect() || {};
    const { height: heightWidgets = 0 } = widgetContainerNode.getBoundingClientRect() || {};
    if (heightColumn <= 0) return;

    const newTableViewHeight = heightColumn - heightWidgets - 50;
    const differense = +tableViewHeight !== newTableViewHeight;

    if (tableViewHeight && differense) {
      setTableViewHeight(newTableViewHeight);
    }
  }, [moduleContext, tableViewHeight]);

  useEffect(() => {
    const { visibility = false } = moduleContext;
    const isMounted = !!rightColumnRef?.current?.offsetWidth;

    const { page = '', itemId = '', path: validPath = '' } = routeParser({
      pageType: 'moduleItem',
      path: 'mainModule__global',
    });

    if (isMounted && visibility && page === 'mainModule' && itemId === 'global') {
      dispatch(
        loadCurrentData({
          action: actionPath.$GLOBAL_LOAD_USERS,
          options: {
            departament: 'department',
            displayName: 'displayName',
            email: 'email',
            isHideEmail: 'isHideEmail',
            isHidePhone: 'isHidePhone',
            position: 'position',
            isOnline: 'isOnline',
          },
          path: validPath,
          clientDB,
        }),
      );
    }
  }, [clientDB, dispatch, moduleContext]);

  useEffect(() => {
    window.addEventListener('resize', onResizeWindow, false);

    return () => {
      window.removeEventListener('resize', onResizeWindow, false);
    };
  }, [onResizeWindow]);

  const { visibility = false } = moduleContext;
  const { mainModule = null } = visibilityWidgets || {};
  const { clockVisibility = true, calendarVisibility = true } = mainModule || {};

  return (
    <div className="mainModule">
      <TitleModule additional="Общая информация" classNameTitle="mainModuleTitle" title="Главная страница" />
      <div className="mainModule_main">
        <div className="col-4 columnModuleLeft">
          <StreamBox
            visible={visibility}
            prefix="#notification"
            streamModule="mainModule"
            withStore={true}
            streamStore="streamList"
            parentDataName="users"
            parentPath="mainModule__global"
            key="streamMain"
            type="global"
          />
        </div>
        <div ref={rightColumnRef} className="col-8 columnModuleRight">
          <div ref={widgetsContainerRef} className="widgets">
            {clockVisibility ? <ClockWidjet /> : null}
            {calendarVisibility ? <Calendar className="mainModule_calendar" fullscreen={false} /> : null}
          </div>
          <div className="tableView__wrapper">
            <TableView
              tableViewHeight={tableViewHeight}
              visible={visibility}
              key="mainModule_table"
              path="mainModule__global"
            />
          </div>
        </div>
      </div>
    </div>
  );
});

MainModule.propTypes = mainModuleType;

export default compose(moduleContextToProps, withClientDb)(MainModule);
