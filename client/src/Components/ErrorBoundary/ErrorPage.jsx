import React from "react";

const ErrorPage = ({ error, logger }) => {
    return (
        <div className="errorPage">
            <p className="errorStatus">App crash</p>
            <p className="messageError">{error.message}</p>
            <button onClick={logger}>Report feedback</button>
        </div>
    );
};
export default ErrorPage;
