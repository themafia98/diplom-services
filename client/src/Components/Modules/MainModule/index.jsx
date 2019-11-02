import React from "react";

import { Calendar } from "antd";
import ClockWidjet from "../../ClockWidjet/index";
import TableView from "../../TableView";
// import WeatherWidjet from "../../WeatherWidget";
import StreamBox from "../../StreamBox";
import TitleModule from "../../TitleModule";

class MainModule extends React.Component {
    state = {
        date: new Date(),
    };

    render() {
        const { firebase } = this.props;
        return (
            <div className="mainModule">
                <TitleModule additional="Общая информация" classNameTitle="mainModuleTitle" title="Главная страница" />
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
                            <TableView path="mainModule__table" firebase={firebase} />
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

export default MainModule;
