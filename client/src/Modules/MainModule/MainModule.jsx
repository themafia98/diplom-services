// @ts-nocheck
import React from 'react';
import { mainModuleType } from './types';
import { Calendar } from 'antd';
import modelContext from 'Models/context';
import ClockWidjet from 'Components/ClockWidjet/index';
import TableView from 'Components/TableView';
import StreamBox from 'Components/StreamBox';
import TitleModule from 'Components/TitleModule';

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
    this.onResizeWindow();
    window.addEventListener('resize', this.onResizeWindow.bind(this), false);
  };

  componentWillUnmount = () => {
    window.removeEventListener('resize', this.onResizeWindow.bind(this), false);
  };

  componentDidUpdate = () => {
    const { tableViewHeight = 0 } = this.state;
    if (tableViewHeight) this.onResizeWindow();
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
    const { path, tableViewHeight } = this.state;
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
              prefix="#notification"
              parentDataName="users"
              parentPath={path}
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
                path="mainModule__table"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainModule;
