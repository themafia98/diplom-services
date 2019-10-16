import React from 'react';

import WeatherWidjet from '../../WeatherWidget';
import StreamBox from '../../StreamBox';
import TitleModule from '../../TitleModule';
import Calendar from 'react-calendar';

class MainModuleComponent extends React.Component {

    state = {
        date: new Date(),
    };

    render(){
        return (
            <div className = 'mainModule'>
                <TitleModule additional = 'Общая информация' classNameTitle = 'mainModuleTitle' title = 'Главная страница' />
                <div className = 'mainModule_main'>
                    <div className = 'col-4 columnModuleLeft'>
                        <StreamBox />
                    </div>
                    <div className = 'col-8 columnModuleRight'>
                        <WeatherWidjet ket = 'weatherWidjet' />
                        <Calendar className = 'mainModule_calendar' value = {this.state.date} />
                    </div>
                </div>
            </div>
        );
    }
};

export default MainModuleComponent;