// @ts-nocheck
import React from 'react';
import { mainModuleType } from './types';
import { Calendar } from 'antd';
import modelContext from '../../Models/context';
import ClockWidjet from '../../Components/ClockWidjet/index';
import TableView from '../../Components/TableView';
import StreamBox from '../../Components/StreamBox';
import TitleModule from '../../Components/TitleModule';

class MainModule extends React.PureComponent {
  static propTypes = mainModuleType;
  static contextType = modelContext;

  state = {
    path: 'mainModule',
  };

  firstPartRef = React.createRef();

  render() {
    const { visible, setCurrentTab } = this.props;
    const { path } = this.state;
    const {
      config: {
        visibilityWidjets: { mainModule: { clockVisibility = true, calendarVisiblity = true } = {} } = {},
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
            <StreamBox parentDataName="users" parentPath={path} key="streamMain" type="global" />
          </div>
          <div ref={this.firstPartRef} className="col-8 columnModuleRight">
            <div className="widjects">
              {clockVisibility ? <ClockWidjet /> : null}
              {calendarVisiblity ? <Calendar className="mainModule_calendar" fullscreen={false} /> : null}
            </div>
            <div className="tableView__wrapper">
              <TableView
                setCurrentTab={setCurrentTab}
                firstPartRef={this.firstPartRef}
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