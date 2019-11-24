import React from "react";
import { Icon, Badge, Popover } from "antd";

class NotificationPopup extends React.PureComponent {
    render() {
        const content = (
            <div>
                <p>уведомление 1</p>
                <p>уведомление 2</p>
            </div>
        );
        const counter = 1;
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
