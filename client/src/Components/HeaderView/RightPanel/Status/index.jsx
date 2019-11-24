import React from "react";
import { Icon } from "antd";

const Status = ({ statusApp, shouldUpdate }) => {
    return (
        <div className="statusApp">
            {shouldUpdate ? <Icon type="loading" /> : null}
            <div className={["statusAppIcon", statusApp].join(" ")}></div>
        </div>
    );
};

export default Status;
