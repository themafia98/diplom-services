import React from 'react';
import { loginType } from './types';
import { Redirect, NavLink } from 'react-router-dom';
import { Button, Input } from 'antd';
import { connect } from 'react-redux';
import { loadUdata } from 'Redux/actions/publicActions';
import { addTabAction, setActiveTabAction } from 'Redux/actions/routerActions';

import Logo from 'Components/Logo';
import ModalWindow from 'Components/ModalWindow';
import ModelContext from 'Models/context';

class LoginPage extends React.Component {
  state = {
    loading: false,
    loginAuth: null,
    redirect: false,
    errorMessage: null,
  };

  static contextType = ModelContext;
  static propTypes = loginType;
  static defaultProps = {
    authLoad: false,
  };

  enterLoading = (event) => {
    const { addTab, onLoadUdata, getCoreConfig } = this.props;
    const { Request } = this.context;
    const config = getCoreConfig();

    const { state: { value: login = '' } = {} } = this.login || {};
    const { state: { value: password = '' } = {} } = this.password || {};

    if (login && password) {
      const rest = new Request();
      this.setState({ errorMessage: null, loading: true });
      rest
        .sendRequest(
          '/login',
          'POST',
          {
            email: login,
            password,
          },
          false,
        )
        .then((res) => {
          if (res.status === 200 && res.data && res.data['user'].token) {
            localStorage.setItem('token', JSON.stringify(res.data['user'].token));
            this.setState({
              loginAuth: true,
            });
            const udataObj = Object.keys(res.data['user']).reduce((accumulator, key) => {
              if (key !== 'token') {
                accumulator[key] = res.data['user'][key];
              }
              return accumulator || {};
            }, {});

            let path = 'mainModule';
            const defaultModule = config.menu.find((item) => item['SIGN'] === 'default');
            if (defaultModule) path = defaultModule.EUID;

            onLoadUdata(udataObj);

            addTab(path);
          } else throw new Error(`${res.status}`);
        })
        .catch((error) => {
          const { response: { data = '' } = {} } = error || {};

          const parser = new DOMParser();
          const doc = parser.parseFromString(data, 'text/html');
          const isHtml = Array.from(doc.body.childNodes).some((node) => node.nodeType === 1);
          const isValid = data && typeof data === 'string' && !isHtml;

          const errorMessage = isValid
            ? data
            : isHtml
            ? 'Ошибка сервера, попробуйте позже.'
            : 'Ошибка авторизации';

          this.setState({
            errorMessage,
            loading: false,
          });
        });
    }
  };

  getCurrentUser = () => {
    return this.state.user;
  };

  onKeyDown = ({ key = '' }) => {
    if (key === 'Enter') this.enterLoading();
  };

  login = null;
  password = null;

  refLogin = (node) => (this.login = node);
  refPassword = (node) => (this.password = node);

  render() {
    const { refLogin, refPassword, enterLoading } = this;
    const { authLoad = false, location: { pathname = '' } = {}, getCoreConfig } = this.props;
    const { loading, errorMessage, loginAuth } = this.state;
    const config = getCoreConfig();
    const { regInclude = true, recovoryInclude = true } = config;

    if (authLoad || loginAuth) return <Redirect to="/dashboard" />;
    if ((!authLoad || !loginAuth) && pathname !== '/') {
      return <Redirect to="/" />;
    }

    return (
      <div className="loginPage">
        <div className="loginPage__loginContainer">
          <h1 className="loginContainer__title">{config['title']}</h1>
          <Logo />
          <form
            onKeyDown={this.onKeyDown}
            method="POST"
            name="loginForm"
            className="loginContainer__loginForm"
          >
            <div className="notificationWrapper">
              {errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}
            </div>
            <Input name="email" aria-label="login" size="large" placeholder="login" ref={refLogin} />
            <Input
              aria-label="password"
              type="password"
              name="password"
              size="large"
              autoComplete=""
              placeholder="password"
              ref={refPassword}
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
  }
}

const mapStateToProps = (state) => {
  const { router, publicReducer } = state;
  const { udata = {} } = publicReducer;
  return {
    router,
    udata,
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    addTab: (tab) => dispatch(addTabAction(tab)),
    setCurrentTab: (tab) => dispatch(setActiveTabAction(tab)),
    onLoadUdata: async (udata) => await dispatch(loadUdata(udata)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
export { LoginPage };
