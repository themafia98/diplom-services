import React from "react";
import _ from "lodash";
import PropTypes from "prop-types";
import moment from "moment";
import TitleModule from "../TitleModule";
import { Timeline } from "antd";

const ObserverTime = props => {

    const { title = "", settingsLogs = {} } = props;

    const renderLogs = (settingsLogs = {}) => {
        if (!settingsLogs || _.isEmpty(settingsLogs)) return null;

        return settingsLogs.map((log, index) => {
            const { message, date, _id = "" } = log;
            return (
                <Timeline.Item key={index + _id}>
                    {message}
                    {moment(date)
                        .locale(navigator.language)
                        .format("LL")}
                </Timeline.Item>
            )
        })
    }

    return (
        <React.Fragment>
            <TitleModule classNameTitle="observerTitle" title={title ? title : "История изменений"} />
            <div className="observerWrapper">
                <Timeline>
                    {renderLogs(settingsLogs)}
                </Timeline>
            </div>
        </React.Fragment>
    );
}

ObserverTime.propTypes = {
    title: PropTypes.string
};
export default ObserverTime;
