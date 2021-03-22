import React, { useState, useEffect, useContext, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { Route } from 'react-router-dom';
import Loader from 'Components/Loader';
import modelsContext from 'Models/context';
import { array, object } from 'prop-types';
import { APP_STATUS } from 'App.constant';
import { setAppStatus } from 'Redux/reducers/publicReducer.slice';
import { useDispatch } from 'react-redux';

const PrivateRoute = ({ component: Component, ...routeProps }) => {
  const timerRef = useRef();
  const history = useHistory();
  const dispatch = useDispatch();
  const { rest } = useContext(modelsContext);

  const [status, setStatus] = useState(null);
  const [init, setInit] = useState(null);

  const getRoutersFunc = useCallback(async () => {
    try {
      const response = await rest.authCheck();

      if (response.status === 200 && response.status !== status) {
        dispatch(setAppStatus(APP_STATUS.ON));
        setStatus(response.status);
      }

      if (response.status !== 200) {
        setStatus(response.status);
        setTimeout(() => rest.restartApp(), 3000);
      }
    } catch (error) {
      const { message = '' } = error;
      console.error(error);

      if (message.toLowerCase().includes('network error')) {
        setStatus(522);
        dispatch(setAppStatus(APP_STATUS.OFF));
        return;
      }

      setTimeout(() => rest.restartApp(), 3000);
    }
  }, [status, rest, dispatch]);

  useEffect(() => {
    history.push(history.location.pathname);
  }, [history]);

  const getRouters = useCallback(getRoutersFunc, [getRoutersFunc]);

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
  routeProps: array,
};

export default PrivateRoute;
