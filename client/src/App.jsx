import React from 'react';
import { connect } from 'react-redux';
import { Switch, Route } from 'react-router-dom';
import { PrivateRoute } from './Components/Helpers';
import config from './config.json';

import { updatePathAction, addTabAction } from './Redux/actions/routerActions';

import Loader from './Components/Loader';
import LoginPage from './Components/Pages/LoginPage';
import UserPanel from './Components/Pages/UserPanel';

class App extends React.Component {

	state = {
		firebaseLoadState: false,
		isUser: false,
	}

	loadAppSession = () => {
		const { moveTo, addTab } = this.props;
		return this.setState({ isUser: true, firebaseLoadState: true}, () => {
				let path = 'mainModule';
				const defaultModule = config.menu.find(item => item['SIGN'] === 'default');
				if (defaultModule) path = defaultModule.EUID;
				addTab(path).then(() => moveTo('/panel'));
		});
	};

	loadApp = () => {
		return this.setState({firebaseLoadState: true});
	};

	componentDidMount(){
        /** load app */
        this.props.firebase.auth.onAuthStateChanged((user) => {
            if (!this.state.firebaseLoadState){
               setTimeout(user ? this.loadAppSession.bind(this) : this.loadApp.bind(this), 500);
			};
		});
	}

	render(){
		const { firebase } = this.props;
		const { firebaseLoadState, isUser } = this.state;
		if (firebaseLoadState){
			return (
				<Switch>
					<Route exact path = '/' render = {props => (
						<LoginPage {...props} isUser = {isUser} firebase = {firebase} />
						)}
					/>
					<PrivateRoute exact path = '/panel' component = {UserPanel} firebase = {firebase} />
				</Switch>
			);
		} else return <Loader />
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
		addTab: async (tab) => await dispatch (addTabAction(tab)),
	}

}

export default connect(mapStateToProps, mapDispatchToProps)(App);
