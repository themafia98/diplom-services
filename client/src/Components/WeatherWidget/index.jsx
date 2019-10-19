import React from "react";
import _ from "lodash";
import axios from "axios";

import Loader from "../Loader";

class WeatherWidjet extends React.Component {
    state = {
        list: null,
        info: null,
    };

    componentDidMount = () => {
        const apiIP = "https://api.ipgeolocation.io/ipgeo?apiKey=";
        const api = "http://api.openweathermap.org/data/2.5/forecast";
        axios
            .get(`${apiIP}${process.env.REACT_APP_IP_API_TOKEN}`)
            .then(res => {
                let findCountry = "Minsk,BLR";
                if (res.status === 200) findCountry = `${res.data.city},${res.data.country_code3}`;
                this.sendRequstWeather(findCountry, api);
            })
            .catch(error => {
                console.error(error);
                this.sendRequstWeather("Minsk,BLR", api);
            });
    };

    sendRequstWeather = (findCountry, api) => {
        return axios
            .get(`${api}?q=${findCountry}&APPID=${process.env.REACT_APP_WEATHER_API_TOKEN}`)
            .then(res => {
                if (res.status === 200) {
                    const {
                        data: { list, city },
                    } = res;
                    return this.setState({
                        list: list.filter(item => /21:00:00/gi.test(item.dt_txt)),
                        info: { ...city },
                    });
                } else throw Error(res.statusText);
            })
            .catch(error => {
                console.error(error);
            });
    };

    getWeatherParseDataComponent = (list, info) => {
        const components = [];
        for (let i = 0; i < list.length; i++) {
            const temp = list[i].main.temp - 273.15;
            const icon = `${list[i].weather[0].icon}.png`;
            const data = list[i].dt_txt
                .split(" ")[0]
                .split("-")
                .reverse()
                .join(".");
            components.push(
                <div key={i + temp} className="weather">
                    <p>{data}</p>
                    <img alt="icon_weather" className="weather_icon" src={`http://openweathermap.org/img/w/${icon}`} />
                    <p className="templo">{temp.toFixed(1)}C&deg;</p>
                </div>,
            );
        }
        return components;
    };

    render() {
        const { list, info } = this.state;
        if (!_.isNull(list) && !_.isNull(info))
            return <div className="weatherWidjet">{this.getWeatherParseDataComponent(list, info)}</div>;
        else
            return (
                <div className="weatherWidjet">
                    <Loader classNameSpiner="weatherLoader" className="wrapperLoader" />
                </div>
            );
    }
}

export default WeatherWidjet;
