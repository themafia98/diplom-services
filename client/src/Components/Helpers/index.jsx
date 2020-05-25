import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { privateType } from './types';
import { Route } from 'react-router-dom';
import Loader from 'Components/Loader';
import modelsContext from 'Models/context';

const PrivateRoute = ({ component: Component, onLogoutAction, onSetStatus, ...routeProps }) => {
  /**
   * @type {import('react').MutableRefObject}
   */
  const timerRef = useRef(); // instance timer
  const history = useHistory();
  const { rest } = useContext(modelsContext);

  const [route, setRoute] = useState(<Loader />);
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
    timerRef.current = setInterval(getRouters, 20000);
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

PrivateRoute.propTypes = privateType;

export { PrivateRoute };
