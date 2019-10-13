import React from 'react';
import { Redirect } from 'react-router-dom';
import { Button, Input } from 'antd';
import { connect } from 'react-redux';

import config from '../../../config.json';

class LoginPage extends React.Component {

    state = {
        loading: false,
        iconLoading: false,
        redirect: false,
    };

    enterLoading = event => {
        const {state: { value: login }} = this.login;
        const {state: {value: password }} = this.password;

        if (login && password){
            this.setState({ loading: true });
            this.props.firebase.login(login, password)
            .then (res => {
                    if (res) this.props.history.push('/panel');
                    else throw new Error('Error enter');
            }).catch(error => this.setState({ loading: false }));
        }
    };

    login = null;
    password = null;

    refLogin = node => this.login = node;
    refPassword = node => this.password = node;

    render(){
        const { refLogin, refPassword, enterLoading } = this;
        const { isUser } = this.props;
        const { loading } = this.state;

        if (isUser) return <Redirect to = '/panel' />

        return (
            <div className = 'loginPage'>
                <div className = 'loginPage__loginContainer'>
                    <h1 className = 'loginContainer__title'>{config['title']}</h1>
                    <div className = 'loginContainer__logo'>
                        <img src = {config['Icon']} alt = 'icon' />
                    </div>
                    <form name = 'loginForm' className = 'loginContainer__loginForm'>
                        <Input size="large" placeholder="login" ref = {refLogin} />
                        <Input type = 'password' size="large" placeholder="password"  ref = {refPassword} />
                        <Button type="primary" loading={loading} onClick={enterLoading} >
                            Enter
                        </Button>
                    </form>
                </div>
            </div>
        )
    }
};

const mapStateToProps = state => {
    return {};
};

const mapDispatchToProps = (dispatch, props) => {
    return {};
};

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);