import React from "react";
import { Redirect, NavLink } from "react-router-dom";
import { Button, Input } from "antd";
import { connect } from "react-redux";
import { addTabAction } from "../../../Redux/actions/routerActions";
import config from "../../../config.json";

import Logo from "../../Logo";
import ModalWindow from "../../ModalWindow";

class LoginPage extends React.Component {
    state = {
        loading: false,
        redirect: false,
        errorMessage: null,
    };

    enterLoading = event => {
        const {
            state: { value: login },
        } = this.login;
        const {
            state: { value: password },
        } = this.password;

        if (login && password) {
            this.setState({ errorMessage: null, loading: true });
            this.props.firebase
                .login(login, password)
                .then(res => {
                    if (res) {
                        this.props.history.push("/dashboard");
                    } else throw new Error("Error enter");
                })
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

        if (isUser && firebase.getCurrentUser()) return <Redirect to="/dashboard" />;

        return (
            <div className="loginPage">
                <div className="loginPage__loginContainer">
                    <h1 className="loginContainer__title">{config["title"]}</h1>
                    <Logo />
                    <form name="loginForm" className="loginContainer__loginForm">
                        <div className="notificationWrapper">
                            {errorMessage ? <p className="errorMessage">{errorMessage}</p> : null}
                        </div>
                        <Input size="large" placeholder="login" ref={refLogin} />
                        <Input type="password" size="large" placeholder="password" ref={refPassword} />
                        <Button type="primary" loading={loading} onClick={enterLoading}>
                            Войти
                        </Button>
                        <ModalWindow firebase={firebase} mode="reg" />
                        <NavLink to="/recovory">Восстановление доступа</NavLink>
                    </form>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => {
    return {
        router: { ...state.router },
    };
};

const mapDispatchToProps = dispatch => {
    return {
        addTab: tab => dispatch(addTabAction(tab)),
    };
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(LoginPage);
