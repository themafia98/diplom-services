import React from "react";
import PropTypes from "prop-types";
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

Updater.propTypes = {
    className: PropTypes.string,
    additionalClassName: PropTypes.string,
    onClick: PropTypes.func.isRequired,
};

export default Updater;
