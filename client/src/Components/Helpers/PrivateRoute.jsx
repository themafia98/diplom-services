import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Route } from 'react-router-dom';
import Loader from 'Components/Loader';
import modelsContext from 'Models/context';
import PropTypes from 'prop-types';

const { object, func, array } = PropTypes;

const PrivateRoute = ({ component: Component, onLogoutAction, onSetStatus, ...routeProps }) => {
  const timerRef = useRef(); // instance timer
  const history = useHistory();
  const { rest } = useContext(modelsContext);

  const [route, setRoute] = useState(<Loader title="Загрузка данных" />);
  /** @type {[number|null, Function|null]} */
  const [status, setStatus] = useState(null);
  const [init, setInit] = useState(null);

  const getRoutersFunc = async () => {
    await rest
      .authCheck()
      .then((res) => {
        if (res.status === 200) {
          if (res.status !== status) {
            onSetStatus('online');
            setRoute(<Component rest={rest} />);
            setStatus(res.status);
          }
        } else {
          rest.restartApp();
        }
      })
      .catch((err) => {
        if (err?.message.toLowerCase().includes('network error')) {
          console.warn(err);
          setStatus(522);
          onSetStatus('offline');
        } else rest.restartApp();
      });
  };

  useEffect(() => {
    history.push(history.location.pathname);
  }, [history]);

  const getRouters = useCallback(getRoutersFunc, [rest]);

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
  return <Route exact {...routeProps} render={(props) => route} />;
};

PrivateRoute.propTypes = {
  component: object.isRequired,
  onLogoutAction: func.isRequired,
  routeProps: array,
};

export default PrivateRoute;
