import React from 'react';
import moment from 'moment';
import _ from 'lodash';
import axios from 'axios';

import Loader from '../Loader';

class WeatherWidjet extends React.Component {

    state = {
        list: null,
        info: null,
    }

    componentDidMount = () => {

        const findCountry = 'Minsk,blr';

        const api = 'http://api.openweathermap.org/data/2.5/forecast';
        axios.get(`${api}?q=${findCountry}&APPID=${process.env.REACT_APP_WEATHER_API_TOKEN}`)
        .then(res => {
           if (res.status === 200){
               const { data: { list, city } } = res;
               return this.setState({
                   list : [...list],
                   info: {...city}
               });
           } else throw Error(res.statusText);
        })
        .catch(error => {
            console.error(error);
        })
    }

    getWeatherParseDataComponent = (list, info) => {
        const components = [];
        debugger;
        for (let i = 0; i < 7; i++){
            const temp = list[i].main.temp - 273.15;
            const icon = `${list[i].weather[0].icon}.png`;
            const today = moment().isoWeekday();
            components.push(
                <div key = {i + temp} className = 'weather'>
                    <p>{today}</p>
                    <img alt = 'icon_weather' className = 'weather_icon' 
                        src = {`http://openweathermap.org/img/w/${icon}`} />
                        <spam className = 'templo'>{temp.toFixed(1)}</spam>
                </div>
            )
        }
        return components;
    }

    render(){
        const { list, info } = this.state;
        if (!_.isNull(list) && !_.isNull(info))
        return (
            <div className = 'weatherWidjet'>
                {this.getWeatherParseDataComponent(list,info)}
            </div>
        );
        else return <Loader classNameSpiner = 'weatherLoader' className = 'wrapperLoader' />;
    }
};

export default WeatherWidjet;