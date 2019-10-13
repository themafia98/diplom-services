import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import {Provider} from 'react-redux';
import ReactDOM from 'react-dom';

import 'normalize.css';
import 'antd/dist/antd.css';
import './index.css';

import App from './App';
import * as serviceWorker from './serviceWorker';

import firebase from './delayFirebase/Firebase';
import firebaseContext from './delayFirebase/firebaseContext'; /** firebase contect API */

import store from './Redux/store';


ReactDOM.render(
<BrowserRouter basename = {'/'}>
    <firebaseContext.Provider value = {firebase}>
        <Provider store = {store}>
            <App />
        </Provider>
    </firebaseContext.Provider>
</BrowserRouter>, 
document.getElementById('root'));

serviceWorker.unregister();
