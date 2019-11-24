import React from "react";
import { Avatar } from "antd";
const NotificationItem = ({ image = false, content = "" }) => {
    return (
        <div className={["notificationItem", image ? null : "centerContent"].join(" ")}>
            {image ? (
                <div className="right">
                    <Avatar shape="circle" type="small" icon="user" />
                </div>
            ) : null}
            <span className={[image ? "left" : null].join(" ")} className="notificationItem__content">
                {content}
            </span>
        </div>
    );
};

export default NotificationItem;
