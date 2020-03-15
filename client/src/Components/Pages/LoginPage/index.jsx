import React from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Redirect, NavLink } from 'react-router-dom';
import { Button, Input } from 'antd';
import { connect } from 'react-redux';
import { showGuile, loadUdata } from '../../../Redux/actions/publicActions';
import { addTabAction, setActiveTabAction } from '../../../Redux/actions/routerActions';

import Logo from '../../Logo';
import ModalWindow from '../../ModalWindow';
import modelContext from '../../../Models/context';

class LoginPage extends React.Component {
  state = {
    loading: false,
    loginAuth: null,
    redirect: false,
    errorMessage: null,
  };

  static contextType = modelContext;

  static propTypes = {
    addTab: PropTypes.func.isRequired,
    router: PropTypes.object.isRequired,
  };

  enterLoading = event => {
    const { addTab, onLoadUdata } = this.props;

    const { Request, config = {} } = this.context;

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
        .then(res => {
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
            const defaultModule = config.menu.find(item => item['SIGN'] === 'default');
            if (defaultModule) path = defaultModule.EUID;

            onLoadUdata(udataObj);

            addTab(path);
          } else throw new Error(res.status);
        })
        .catch(error => {
          const {
            response: { data = '' },
          } = error || {};
          debugger;
          const isHtml = /DOCTYPE html/gi.test(data);
          const isValid = _.isString(data) && data && !isHtml;

          const errorMessage = isValid ? data : 'Ошибка авторизации';

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

  login = null;
  password = null;

  refLogin = node => (this.login = node);
  refPassword = node => (this.password = node);

  render() {
    const { refLogin, refPassword, enterLoading } = this;
    const { authLoad = false } = this.props;
    const { loading, errorMessage, loginAuth } = this.state;
    const { config = {} } = this.context;

    if (authLoad || loginAuth) return <Redirect to="/dashboard" />;

    return (
      <div className="loginPage">
        <div className="loginPage__loginContainer">
          <h1 className="loginContainer__title">{config['title']}</h1>
          <Logo />
          <form method="POST" name="loginForm" className="loginContainer__loginForm">
            <div className="notificationWrapper">
              {errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}
            </div>
            <Input name="email" aria-label="login" size="large" placeholder="login" ref={refLogin} />
            <Input
              aria-label="password"
              type="password"
              name="password"
              size="large"
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
            <ModalWindow mode="reg" />
            <NavLink aria-label="recovory-link" className="recovory-link" to="/recovory">
              Восстановление доступа
            </NavLink>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => {
  const { udata = {} } = state.publicReducer || {};
  return {
    router: { ...state.router },
    udata,
  };
};

const mapDispatchToProps = dispatch => {
  return {
    addTab: tab => dispatch(addTabAction(tab)),
    onShowGuide: show => dispatch(showGuile(show)),
    setCurrentTab: tab => dispatch(setActiveTabAction(tab)),
    onLoadUdata: async udata => await dispatch(loadUdata(udata)),
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
export { LoginPage };
