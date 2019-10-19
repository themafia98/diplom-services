import React from "react";

const TitleModule = ({ title, className, classNameTitle, additional }) => {
    return (
        <div className={["titleModule", className ? className : null].join(" ")}>
            <p className={["titleModule_title", classNameTitle ? classNameTitle : null].join(" ")}>{title}</p>
            {additional ? <span>{additional}</span> : null}
        </div>
    );
};
export default TitleModule;
