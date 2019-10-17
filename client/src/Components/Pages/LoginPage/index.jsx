import React from 'react';
import _ from 'lodash';
import { Redirect, NavLink } from 'react-router-dom';
import { Button, Input } from 'antd';
import { connect } from 'react-redux';
import { updatePathAction, addTabAction } from '../../../Redux/actions/routerActions';
import config from '../../../config.json';

class LoginPage extends React.Component {

    state = {
        loading: false,
        redirect: false,
    };

    enterLoading = event => {
        const {state: { value: login }} = this.login;
        const {state: {value: password }} = this.password;
        const { router:{ actionTabs = [], currentActionTab } = {}, addTab, moveTo } = this.props;
        
        if (login && password){
            this.setState({ loading: true });
            this.props.firebase.login(login, password)
            .then (res => {
                    if (res) {
                     moveTo('/panel').then(() => { if (_.isEmpty(actionTabs)) addTab(currentActionTab) })
                     .then(() => this.props.history.push('/panel'));
                    }
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
        const { isUser, firebase } = this.props;
        const { loading } = this.state;
        
        if (isUser && firebase.getCurrentUser()) return <Redirect to = '/panel' />

        return (
            <div className = 'loginPage'>
                <div className = 'loginPage__loginContainer'>
                    <h1 className = 'loginContainer__title'>{config['title']}</h1>
                    <div className = 'loginContainer__logo'>
                        <img src = {config['icon']} alt = 'icon' />
                    </div>
                    <form name = 'loginForm' className = 'loginContainer__loginForm'>
                        <Input size="large" placeholder="login" ref = {refLogin} />
                        <Input type = 'password' size="large" placeholder="password"  ref = {refPassword} />
                        <Button type="primary" loading={loading} onClick={enterLoading}>Enter</Button>
                        <NavLink to = '/recovory'>Recovery password</NavLink>
                    </form>
                </div>
            </div>
        )
    }
};

const mapStateToProps = state => {
	return {
		router: {...state.router}
	}
};

const mapDispatchToProps = dispatch => {
	return {
		moveTo: async (path) => await dispatch (updatePathAction(path)),
        addTab: (tab) =>  dispatch (addTabAction(tab)),
	}

}

export default connect(mapStateToProps, mapDispatchToProps)(LoginPage);