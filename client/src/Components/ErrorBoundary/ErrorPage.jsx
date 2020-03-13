import React from 'react';
import PropTypes from 'prop-types';

const ErrorPage = ({ error, logger, update }) => {
  return (
    <div className="errorPage">
      <p className="errorStatus">App crash</p>
      <p style={{ display: 'none' }} className="messageError">
        {error.message}
      </p>
      <button disabled={false} onClick={logger}>
        Report error
      </button>
      <button onClick={update}>Update app</button>
    </div>
  );
};
ErrorPage.propTypes = {
  error: PropTypes.object.isRequired,
  logger: PropTypes.func.isRequired,
  update: PropTypes.func.isRequired,
};
export default ErrorPage;
