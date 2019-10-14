import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { PrivateRoute } from './Components/Helpers';

import Loader from './Components/Loader';
import LoginPage from './Components/Pages/LoginPage';
import UserPanel from './Components/Pages/UserPanel';

class App extends React.Component {

	state = {
		firebaseLoadState: false,
		isUser: false,
	}

	loadAppSession = () => {
		return this.setState({ isUser: true, firebaseLoadState: true});
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
		if (firebaseLoadState)
			return (
				<Switch>
					<Route exact path = '/' 
						render = {props => (
							<LoginPage {...props} 
									isUser = {isUser} 
									firebase = {firebase} 
							/> 
						)} 
					/>
					<PrivateRoute exact path = '/panel' 
						component = {UserPanel} 
		                firebase = {firebase} 
					/>
				</Switch>
			);
		else return <Loader />
	};
}

export default App;
