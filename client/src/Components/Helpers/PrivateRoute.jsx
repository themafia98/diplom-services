import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Route } from 'react-router-dom';
import Loader from 'Components/Loader';
import modelsContext from 'Models/context';
import PropTypes from 'prop-types';
import { APP_STATUS } from 'App.constant';

const { object, func, array } = PropTypes;

const PrivateRoute = ({ component: Component, onLogoutAction, onSetStatus, ...routeProps }) => {
  const timerRef = useRef();
  const history = useHistory();
  const { rest } = useContext(modelsContext);

  const [status, setStatus] = useState(null);
  const [init, setInit] = useState(null);

  const getRoutersFunc = async () => {
    try {
      const response = await rest.authCheck();

      if (response.status === 200 && response.status !== status) {
        onSetStatus(APP_STATUS.ON);
        setStatus(response.status);
      }

      if (response.status !== 200) {
        setStatus(response.status);

        setTimeout(() => rest.restartApp(), 3000);
      }
    } catch (error) {
      const { message = '' } = error;

      if (message.toLowerCase().includes('network error')) {
        console.error(error);
        setStatus(522);
        onSetStatus(APP_STATUS.OFF);
        return;
      }

      setTimeout(() => rest.restartApp(), 3000);
    }
  };

  useEffect(() => {
    history.push(history.location.pathname);
  }, [history]);

  const getRouters = useCallback(getRoutersFunc, [rest, status, onSetStatus]);

  const startTimer = useCallback(() => {
    timerRef.current = setInterval(getRouters, 50000);
  }, [timerRef, getRouters]);

  const clearTimer = useCallback(() => clearInterval(timerRef.current), [timerRef]);

  useEffect(() => {
    if (!init) {
      setInit(true);
      getRouters();
    }
    if (status !== 'error') {
      startTimer();
    }
    return () => clearTimer();
  }, [getRouters, status, init, clearTimer, startTimer]);

  const pageRender = (props) => {
    if (status === 200) {
      return <Component {...props} />;
    }

    return <Loader title="Loading data" />;
  };

  return <Route exact {...routeProps} render={pageRender} />;
};

PrivateRoute.propTypes = {
  component: object.isRequired,
  onLogoutAction: func.isRequired,
  routeProps: array,
};

export default PrivateRoute;
