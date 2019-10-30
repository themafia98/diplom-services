import React from "react";
import updater from "./updater.png";

const Updater = ({ className = null, additionalClassName = null }) => {
    return (
        <div className={["updater", className ? className : null].join(" ")}>
            <img
                className={[additionalClassName ? additionalClassName : null].join(" ")}
                alt="updater"
                src={updater}
            ></img>
        </div>
    );
};
export default Updater;
