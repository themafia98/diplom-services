import React from "react";
import loader from "./loader.gif";

const Loader = ({ className = "defaultLoader", classNameSpiner = null }) => (
    <div className={className ? className : null}>
        <img className={classNameSpiner ? classNameSpiner : null} src={loader} alt="loader" />
    </div>
);
export default Loader;
