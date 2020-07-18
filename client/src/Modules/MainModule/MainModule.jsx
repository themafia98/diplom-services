import React from 'react';
import { connect } from 'react-redux';
import { mainModuleType } from './types';
import { Calendar } from 'antd';
import ClockWidjet from 'Components/ClockWidjet/index';
import TableView from 'Components/TableView';
import StreamBox from 'Components/StreamBox';
import TitleModule from 'Components/TitleModule';
import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import { routeParser } from 'Utils';
import { compose } from 'redux';
import { moduleContextToProps } from 'Components/Helpers/moduleState';

class MainModule extends React.PureComponent {
  static propTypes = mainModuleType;

  state = {
    path: 'mainModule',
    tableViewHeight: 300,
  };

  rightColumnRef = React.createRef();
  widgetsContainerRef = React.createRef();

  componentDidMount = () => {
    const { onLoadCurrentData, moduleContext } = this.props;
    const { visibility = false } = moduleContext;
    const { page = '', itemId = '', path: validPath = '' } = routeParser({
      pageType: 'moduleItem',
      path: 'mainModule__global',
    });

    if (visibility && page === 'mainModule' && itemId === 'global') {
      onLoadCurrentData({
        path: validPath,
        startPath: 'system',
        xhrPath: 'userList',
        storeLoad: 'users',
        methodRequst: 'GET',
      });
    }
    this.onResizeWindow();
    window.addEventListener('resize', this.onResizeWindow, false);
  };

  componentDidUpdate = (prevProps) => {
    const { onLoadCurrentData, moduleContext } = this.props;
    const { visibility = false } = moduleContext;
    const {
      moduleContext: { visibility: visibilityPrev = false },
    } = prevProps;
    const { path: validPath = '', page = '', itemId = '' } = routeParser({
      pageType: 'moduleItem',
      path: 'mainModule__global',
    });

    if (visibilityPrev !== visibility && page === 'mainModule' && itemId === 'global') {
      if (visibility & onLoadCurrentData)
        onLoadCurrentData({
          path: validPath,
          xhrPath: 'userList',
          startPath: 'system',
          storeLoad: 'users',
          methodRequst: 'GET',
        });
    }
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.onResizeWindow, false);
  };

  onResizeWindow = () => {
    const { tableViewHeight = null } = this.state;
    const { moduleContext } = this.props;
    const { visibility = false } = moduleContext;
    const { current: rightColumnNode } = this.rightColumnRef || {};
    const { current: widgetContainerNode } = this.widgetsContainerRef || {};
    if (!visibility || !rightColumnNode) return;

    const { height: heightColumn = 0 } = rightColumnNode.getBoundingClientRect() || {};
    const { height: heightWidgets = 0 } = widgetContainerNode.getBoundingClientRect() || {};
    if (heightColumn <= 0) return;

    const newTableViewHeight = heightColumn - heightWidgets - 50;
    const differense = +tableViewHeight !== newTableViewHeight;

    if (tableViewHeight && differense) {
      this.setState({
        ...this.state,
        tableViewHeight: newTableViewHeight,
      });
    }
  };

  render() {
    const { modelsContext, moduleContext } = this.props;
    const { visibility = false } = moduleContext;
    const { tableViewHeight } = this.state;
    const {
      config: {
        visibilityWidgets: { mainModule: { clockVisibility = true, calendarVisibility = true } = {} } = {},
      } = {},
    } = modelsContext;
    return (
      <div className="mainModule">
        <TitleModule
          additional="Общая информация"
          classNameTitle="mainModuleTitle"
          title="Главная страница"
        />
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
          <div ref={this.rightColumnRef} className="col-8 columnModuleRight">
            <div ref={this.widgetsContainerRef} className="widgets">
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
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    onLoadCurrentData: (props) => dispatch(loadCurrentData(props)),
  };
};

export default compose(moduleContextToProps, connect(null, mapDispatchToProps))(MainModule);
