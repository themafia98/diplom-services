import React from "react";
import clsx from "clsx";
import { Avatar } from "antd";
const NotificationItem = ({ image = false, content = "" }) => {
    return (
        <div className={clsx("notificationItem", image ? null : "centerContent")}>
            {image ? (
                <div className="right">
                    <Avatar shape="circle" type="small" icon="user" />
                </div>
            ) : null}
            <span className={clsx("notificationItem__content", image ? "left" : null)}>{content}</span>
        </div>
    );
};

export default NotificationItem;
