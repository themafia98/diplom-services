import React, { useState, useCallback, useContext, useRef } from 'react';
import { loginType } from './LoginPage.types';
import { Redirect, NavLink } from 'react-router-dom';
import { Button, Input } from 'antd';
import { useSelector } from 'react-redux';
import Logo from 'Components/Logo';
import ModalWindow from 'Components/ModalWindow';
import ModelContext from 'Models/context';
import { SIGNS } from 'App.constant';

const LoginPage = ({ initialSession, authLoad, location }) => {
  const { appConfig } = useSelector((state) => {
    const { appConfig } = state.publicReducer;
    return {
      appConfig,
    };
  });

  const { pathname = '' } = location || {};
  const { regInclude = true, recovoryInclude = true } = appConfig || {};

  const [loading, setLoading] = useState(false);
  const [loginAuth, setAuth] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const loginRef = useRef(null);
  const passwordRef = useRef(null);

  const context = useContext(ModelContext);

  const enterLoading = useCallback(async () => {
    const { Request } = context;

    const { menu = [] } = appConfig || {};
    const { current: loginNode = null } = loginRef || {};
    const { current: passwordNode = null } = passwordRef || {};

    const { state: { value: loginValue = '' } = {} } = loginNode || {};
    const { state: { value: passwordValue = '' } = {} } = passwordNode || {};

    if (!loginValue || !passwordValue) {
      return;
    }

    const rest = new Request();

    setErrorMessage(null);
    setLoading(true);

    try {
      const response = await rest.sendRequest(
        '/login',
        'POST',
        {
          email: loginValue,
          password: passwordValue,
        },
        false,
      );

      if (response.status !== 200) {
        throw new Error(`${response.status}`);
      }

      const { user: udata, token } = response.data;

      if (!token) {
        throw new Error('Bad user auth token');
      }

      if (!udata) {
        throw new Error('Invalid udata');
      }

      localStorage.setItem('token', token);

      const defaultModule = menu?.find((item) => item?.SIGN === SIGNS.DEFAULT_SIGN);

      initialSession(udata, defaultModule?.EUID || 'mainModule');
      setAuth(true);
    } catch (error) {
      const { data = '' } = error?.response || {};

      const parser = new DOMParser();
      const doc = parser.parseFromString(data, 'text/html');
      const isHtml = Array.from(doc.body.childNodes).some((node) => node.nodeType === 1);
      const isValid = data && typeof data === 'string' && !isHtml;

      const errorMessage = isValid
        ? data
        : isHtml
        ? 'Ошибка сервера, попробуйте позже.'
        : 'Ошибка авторизации';

      setErrorMessage(errorMessage);
      setLoading(false);
    }
  }, [appConfig, context, initialSession]);

  const onKeyDown = ({ key = '' }) => {
    if (key === 'Enter') enterLoading();
  };

  if (authLoad || loginAuth) {
    return <Redirect to="/dashboard" />;
  }

  if ((!authLoad || !loginAuth) && pathname !== '/') {
    return <Redirect to="/" />;
  }

  return (
    <div className="loginPage">
      <div className="loginPage__loginContainer">
        <h1 className="loginContainer__title">{appConfig?.title}</h1>
        <Logo />
        <form onKeyDown={onKeyDown} method="POST" name="loginForm" className="loginContainer__loginForm">
          <div className="notificationWrapper">
            {errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}
          </div>
          <Input name="email" aria-label="login" size="large" placeholder="login" ref={loginRef} />
          <Input
            aria-label="password"
            type="password"
            name="password"
            size="large"
            autoComplete=""
            placeholder="password"
            ref={passwordRef}
          />
          <Button
            aria-label="login-button"
            className="enterSystem"
            type="primary"
            loading={loading}
            onClick={enterLoading}
          >
            Войти
          </Button>
          {regInclude ? <ModalWindow mode="reg" /> : null}
          {recovoryInclude ? (
            <NavLink aria-label="recovory-link" className="recovory-link" to="/recovory">
              Восстановление доступа
            </NavLink>
          ) : null}
        </form>
      </div>
    </div>
  );
};

LoginPage.propTypes = loginType;
LoginPage.defaultProps = {
  location: {},
};

export default LoginPage;
