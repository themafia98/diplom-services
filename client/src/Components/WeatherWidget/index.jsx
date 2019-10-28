import React from "react";
import _ from "lodash";
import axios from "axios";
import { notification } from "antd";
import Loader from "../Loader";

class WeatherWidjet extends React.Component {
    state = {
        isNetworkError: false,
        list: null,
        info: null,
    };

    componentDidMount = () => {
        const { onErrorRequstAction } = this.props;
        axios
            .get("http://ip-api.com/json/")
            .then(res => {
                let findCountry = "Minsk,BLR";
                if (res.status === 200) findCountry = `${res.data.city},${res.data.countryCode}`;
                this.sendRequstWeather(findCountry);
            })
            .catch(error => {
                console.error(error.message);
                if (error.message === "Network Error") {
                    return this.setState(
                        {
                            isNetworkError: true,
                        },
                        () => onErrorRequstAction(),
                    );
                } else this.sendRequstWeather("Minsk,BLR");
            });
    };

    sendRequstWeather = findCountry => {
        const { onErrorRequstAction } = this.props;
        const api = "https://cors-anywhere.herokuapp.com/http://api.openweathermap.org/data/2.5/forecast?q=";
        return axios
            .get(`${api}${findCountry}&APPID=${process.env.REACT_APP_WEATHER_API_TOKEN}`)
            .then(res => {
                if (res.status === 200) {
                    const {
                        data: { list, city },
                    } = res;
                    return this.setState({
                        list: list.filter(item => /21:00:00/gi.test(item.dt_txt)),
                        info: { ...city },
                        isNetworkError: false,
                    });
                } else throw Error(res.statusText);
            })
            .catch(error => {
                console.error(error.message);
                if (error.message === "Network Error") {
                    return this.setState(
                        {
                            isNetworkError: true,
                        },
                        () => onErrorRequstAction(),
                    );
                }
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
        const { list, info, isNetworkError } = this.state;

        return (
            <div className="weatherWidjet">
                {!_.isNull(list) && !_.isNull(info) && !isNetworkError ? (
                    this.getWeatherParseDataComponent(list, info)
                ) : !isNetworkError ? (
                    <Loader classNameSpiner="weatherLoader" className="wrapperLoader" />
                ) : isNetworkError ? (
                    <div>Network error</div>
                ) : null}
            </div>
        );
    }
}

export default WeatherWidjet;
