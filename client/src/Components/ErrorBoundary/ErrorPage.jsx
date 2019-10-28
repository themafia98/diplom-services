import React from "react";

const ErrorPage = ({ error, logger, update }) => {
    return (
        <div className="errorPage">
            <p className="errorStatus">App crash</p>
            <p className="messageError">{error.message}</p>
            <button onClick={logger}>Report error</button>
            <button onClick={update}>Update app</button>
        </div>
    );
};
export default ErrorPage;
