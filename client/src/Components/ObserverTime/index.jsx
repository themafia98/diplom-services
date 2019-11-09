import React from "react";
import PropTypes from "prop-types";
import moment from "moment";
import TitleModule from "../TitleModule";
import { Timeline } from "antd";

class ObserverTime extends React.PureComponent {
    render() {
        const { title = "" } = this.props;
        return (
            <React.Fragment>
                <TitleModule classNameTitle="observerTitle" title={title ? title : "История изменений"} />
                <div className="observerWrapper">
                    <Timeline>
                        <Timeline.Item>
                            Смена почты{" "}
                            {moment()
                                .locale(navigator.language)
                                .format("LL")}
                        </Timeline.Item>
                        <Timeline.Item>
                            Смена пароля{" "}
                            {moment()
                                .locale(navigator.language)
                                .format("LL")}
                        </Timeline.Item>
                    </Timeline>
                </div>
            </React.Fragment>
        );
    }
}

ObserverTime.propTypes = {
    title: PropTypes.string,
};
export default ObserverTime;
