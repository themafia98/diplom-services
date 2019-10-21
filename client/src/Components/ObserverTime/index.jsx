import React from "react";
import moment from "moment";
import TitleModule from "../TitleModule";
import { Timeline } from "antd";
import "moment/locale/ru";
import "moment/locale/eu";
import "moment/locale/de";
class ObserverTime extends React.Component {
    render() {
        const { title } = this.props;
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
export default ObserverTime;
