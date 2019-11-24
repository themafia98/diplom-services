import React from "react";
import Scrollbars from "react-custom-scrollbars";
import { Icon, Badge, Popover } from "antd";

class NotificationPopup extends React.PureComponent {
    render() {
        const content = (
            <div style={{ height: "100px" }} className="notificationContent">
                <Scrollbars>
                    <p>уведомление 1</p>
                    <p>уведомление 2</p>
                    <p>уведомление 3</p>
                    <p>уведомление 4</p>
                    <p>уведомление 5</p>
                    <p>уведомление 6</p>
                </Scrollbars>
            </div>
        );
        const counter = 6;
        return (
            <React.Fragment>
                <div className="notificationControllers">
                    <Badge className="notificationCounter" count={counter} />
                    <Popover
                        placement="bottom"
                        title={`Непрочитано уведомлений: ${counter}.`}
                        content={content}
                        trigger="click"
                    >
                        <Icon className="alertBell" type="bell" theme="twoTone" />
                    </Popover>
                </div>
            </React.Fragment>
        );
    }
}

export default NotificationPopup;
