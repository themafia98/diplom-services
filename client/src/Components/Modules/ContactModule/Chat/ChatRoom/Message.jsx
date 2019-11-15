import React from "react";
import { Tooltip } from "antd";

const Message = ({ it = null, children = null, showTooltip }) => {
    if (!it) return null;

    return showTooltip ? (
        <Tooltip placement="top" key={`${it.id}_tooltip`} visible={showTooltip} title="Перейти в профиль">
            <span>{children}</span>
        </Tooltip>
    ) : (
        <span>{children}</span>
    );
};

export default Message;
