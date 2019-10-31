import React from "react";
import updater from "./updater.png";
import { Tooltip } from "antd";

const Updater = ({ className = null, additionalClassName = null, onClick = null }) => {
    return (
        <div className={["updater", className ? className : null].join(" ")}>
            <Tooltip title="Обновить" placement="bottom">
                <img
                    onClick={onClick ? onClick : null}
                    className={[additionalClassName ? additionalClassName : null].join(" ")}
                    alt="updater"
                    src={updater}
                ></img>
            </Tooltip>
        </div>
    );
};
export default Updater;
