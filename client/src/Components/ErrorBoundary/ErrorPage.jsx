import React from 'react';

const ErrorPage = ({error, logger}) => {
    debugger;
    return (
        <div className = 'errorPage'>
        <p className = 'errorStatus'>{error.status || 'App crash'}</p>
        <p className = 'message'>{error.message}</p>
        <button onClick={logger}>Report feedback</button>
        </div>
    );
};
export default ErrorPage;