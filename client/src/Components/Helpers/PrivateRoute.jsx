import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Route } from 'react-router-dom';
import Loader from 'Components/Loader';
import modelsContext from 'Models/context';
import PropTypes from 'prop-types';

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
        onSetStatus('online');
        setStatus(response.status);
      }

      if (response.status !== 200) {
        setStatus(response.status);

        setTimeout(() => rest.restartApp(), 3000);
      }
    } catch (err) {
      if (err?.message.toLowerCase().includes('network error')) {
        console.warn(err);
        setStatus(522);
        onSetStatus('offline');
      } else rest.restartApp();
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

    return <Loader title="Загрузка данных" />;
  };

  return <Route exact {...routeProps} render={pageRender} />;
};

PrivateRoute.propTypes = {
  component: object.isRequired,
  onLogoutAction: func.isRequired,
  routeProps: array,
};

export default PrivateRoute;
