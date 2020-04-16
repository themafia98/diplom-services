import React from 'react';
import PropTypes from 'prop-types';
import { Calendar } from 'antd';
import modelContext from '../../../Models/context';
import ClockWidjet from '../../ClockWidjet/index';
import TableView from '../../TableView';
import StreamBox from '../../StreamBox';
import TitleModule from '../../TitleModule';

class MainModule extends React.PureComponent {
  static propTypes = {
    onErrorRequstAction: PropTypes.func.isRequired,
  };

  static contextType = modelContext;

  state = {
    path: 'mainModule',
  };

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
          <div className="col-8 columnModuleRight">
            <div className="widjects">
              {clockVisibility ? <ClockWidjet /> : null}
              {calendarVisiblity ? <Calendar className="mainModule_calendar" fullscreen={false} /> : null}
            </div>
            <div className="tableViw__wrapper">
              <TableView
                setCurrentTab={setCurrentTab}
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
