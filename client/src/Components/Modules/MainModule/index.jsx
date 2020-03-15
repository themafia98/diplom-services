import React from 'react';
import PropTypes from 'prop-types';
import { Calendar } from 'antd';

import ClockWidjet from '../../ClockWidjet/index';
import TableView from '../../TableView';
import StreamBox from '../../StreamBox';
import TitleModule from '../../TitleModule';

class MainModule extends React.PureComponent {
  static propTypes = {
    onErrorRequstAction: PropTypes.func.isRequired,
  };

  render() {
    const { visible } = this.props;
    return (
      <div className="mainModule">
        <TitleModule
          additional="Общая информация"
          classNameTitle="mainModuleTitle"
          title="Главная страница"
        />
        <div className="mainModule_main">
          <div className="col-4 columnModuleLeft">
            <StreamBox />
          </div>
          <div className="col-8 columnModuleRight">
            <div className="widjects">
              {/* <WeatherWidjet onErrorRequstAction={onErrorRequstAction} ket="weatherWidjet" /> */}
              <ClockWidjet />
              <Calendar className="mainModule_calendar" fullscreen={false} />
            </div>
            <div className="tableViw__wrapper">
              <TableView visible={visible} key="mainModule_table" path="mainModule__table" />
            </div>
          </div>
        </div>
      </div>
    );
  }
}

export default MainModule;
