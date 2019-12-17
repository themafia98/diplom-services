import React from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { Redirect, NavLink } from "react-router-dom";
import { Button, Input } from "antd";
import { connect } from "react-redux";
import { showGuile } from "../../../Redux/actions/publicActions";
import { addTabAction } from "../../../Redux/actions/routerActions";
import config from "../../../config.json";

import Logo from "../../Logo";
import ModalWindow from "../../ModalWindow";

class LoginPage extends React.Component {
    state = {
        loading: false,
        redirect: false,
        errorMessage: null
    };

    static propTypes = {
        addTab: PropTypes.func.isRequired,
        router: PropTypes.object.isRequired
    };

    enterLoading = event => {
        const { onShowGuide = null } = this.props;
        const { state: { value: login = "" } = {} } = this.login || {};
        const { state: { value: password = "" } = {} } = this.password || {};

        if (login && password) {
            this.setState({ errorMessage: null, loading: true });
            axios
                .post("/rest/rest/login", {
                    email: login,
                    password
                })
                .catch(err => console.log(err))
                .catch(error => {
                    this.setState({ errorMessage: error.message, loading: false });
                });
        }
    };

    login = null;
    password = null;

    refLogin = node => (this.login = node);
    refPassword = node => (this.password = node);

    render() {
        const { refLogin, refPassword, enterLoading } = this;
        const { isUser, firebase } = this.props;
        const { loading, errorMessage } = this.state;

        if (firebase && isUser && firebase.getCurrentUser()) return <Redirect to="/dashboard" />;

        return (
            <div className="loginPage">
                <div className="loginPage__loginContainer">
                    <h1 className="loginContainer__title">{config["title"]}</h1>
                    <Logo />
                    <form
                        method="POST"
                        action="/rest/rest/login"
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
                            placeholder="password"
                            ref={refPassword}
                        />
                        <Button
                            aria-label="login-button"
                            className="enterSystem"
                            type="primary"
                            htmlType="submit"
                            loading={loading}
                            // onClick={enterLoading}
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
    return {
        router: { ...state.router }
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addTab: tab => dispatch(addTabAction(tab)),
        onShowGuide: show => dispatch(showGuile(show))
    };
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);
export { LoginPage };
