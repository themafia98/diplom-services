import React from 'react';
import { Switch, Route } from 'react-router-dom';
import { PrivateRoute } from './Components/Helpers';
  
import LoginPage from './Components/Pages/LoginPage';
import UserPanel from './Components/Pages/UserPanel';

function App() {
  return (
    <Switch>
      <Route exact path = '/' component = {LoginPage} />
      <PrivateRoute exact path = '/panel' component = {UserPanel} />
    </Switch>
  );
}

export default App;
