import React from "react";

import _ from "lodash";
import { connect } from "react-redux";
import { Calendar, notification } from "antd";

import { errorRequstAction } from "../../../Redux/actions/publicActions";

import TableView from "../../TableView";
import WeatherWidjet from "../../WeatherWidget";
import StreamBox from "../../StreamBox";
import TitleModule from "../../TitleModule";

class MainModule extends React.Component {
    state = {
        date: new Date(),
    };

    componentDidUpdate = () => {
        const { onErrorRequstAction, publicReducer: { requestError = null } = {} } = this.props;
        if (!_.isNull(requestError)) {
            onErrorRequstAction(false).then(() => {
                if (requestError === "Network error")
                    notification.error({ message: "Ошибка", description: "Интернет соединение недоступно." });
            });
        }
    };

    render() {
        const { firebase, onErrorRequstAction } = this.props;
        return (
            <div className="mainModule">
                <TitleModule additional="Общая информация" classNameTitle="mainModuleTitle" title="Главная страница" />
                <div className="mainModule_main">
                    <div className="col-4 columnModuleLeft">
                        <StreamBox />
                    </div>
                    <div className="col-8 columnModuleRight">
                        <div className="widjects">
                            <WeatherWidjet onErrorRequstAction={onErrorRequstAction} ket="weatherWidjet" />
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

const mapStateToProps = state => {
    return {
        publicReducer: state.publicReducer,
    };
};

const mapDispatchToProps = dispatch => {
    return {
        onErrorRequstAction: async error => await errorRequstAction(error),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(MainModule);
