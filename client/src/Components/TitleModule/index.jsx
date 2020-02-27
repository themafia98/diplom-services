import React from "react";
import PropTypes from "prop-types";

const TitleModule = ({ title, className, classNameTitle, additional }) => {
    return (
        <div className={["titleModule", className ? className : null].join(" ")}>
            <p className={["titleModule_title", classNameTitle ? classNameTitle : null].join(" ")}>{title}</p>
            {additional ? <span>{additional}</span> : null}
        </div>
    );
};

TitleModule.propTypes = {
    title: PropTypes.string,
    className: PropTypes.string,
    classNameTitle: PropTypes.string,
    additional: PropTypes.string
};

export default TitleModule;
