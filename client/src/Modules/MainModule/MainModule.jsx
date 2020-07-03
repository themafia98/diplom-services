import React from 'react';
import { connect } from 'react-redux';
import { mainModuleType } from './types';
import { Calendar } from 'antd';
import modelContext from 'Models/context';
import ClockWidjet from 'Components/ClockWidjet/index';
import TableView from 'Components/TableView';
import StreamBox from 'Components/StreamBox';
import TitleModule from 'Components/TitleModule';
import { loadCurrentData } from 'Redux/actions/routerActions/middleware';
import { routeParser } from 'Utils';

class MainModule extends React.PureComponent {
  static propTypes = mainModuleType;
  static contextType = modelContext;

  state = {
    path: 'mainModule',
    tableViewHeight: 300,
  };

  rightColumnRef = React.createRef();
  widgetsContainerRef = React.createRef();

  componentDidMount = () => {
    const { onLoadCurrentData, visible } = this.props;

    const { page = '', itemId = '', path: validPath = '' } = routeParser({
      pageType: 'moduleItem',
      path: 'mainModule__global',
    });

    if (visible && page === 'mainModule' && itemId === 'global') {
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
    const { onLoadCurrentData, visible = false } = this.props;

    const { path: validPath = '', page = '', itemId = '' } = routeParser({
      pageType: 'moduleItem',
      path: 'mainModule__global',
    });

    if (prevProps.visible !== visible && page === 'mainModule' && itemId === 'global') {
      if (visible & onLoadCurrentData)
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
    const { visible = false } = this.props;
    const { current: rightColumnNode } = this.rightColumnRef || {};
    const { current: widgetContainerNode } = this.widgetsContainerRef || {};
    if (!visible || !rightColumnNode) return;

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
    const { visible, setCurrentTab } = this.props;
    const { tableViewHeight } = this.state;
    const {
      config: {
        visibilityWidgets: { mainModule: { clockVisibility = true, calendarVisibility = true } = {} } = {},
      } = {},
    } = this.context;
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
              visible={visible}
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
                setCurrentTab={setCurrentTab}
                tableViewHeight={tableViewHeight}
                visible={visible}
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

export default connect(null, mapDispatchToProps)(MainModule);
